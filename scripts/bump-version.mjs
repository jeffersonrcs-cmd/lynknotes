import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  pkg: resolve(root, "package.json"),
  history: resolve(root, "version-history.json"),
  markdown: resolve(root, "VERSION_HISTORY.md"),
};

// Pastas do app: só mudanças nelas geram versão automática.
const APP_PATHS = ["src/", "public/", "supabase/", "drizzle/"];
const SKIP_MARKERS = /\[(skip ci|sem-versao|auto-versao)\]/i;
const MIN_LEN = 12;
const PLACEHOLDERS = [
  /revisão incrementada para registrar/i,
  /atualizações, melhorias e correções desta versão/i,
  /ajustes e correções registrados/i,
];
const INTRO =
  "Este arquivo registra as versões publicadas do LynkNotes. A versão do LynkNotes é independente da versão do JSLynk e dos demais aplicativos conectados.";
const RANK = { patch: 0, minor: 1, major: 2 };

const USAGE = `Uso:
  node scripts/bump-version.mjs <patch|minor|major> "O que mudou" ["Outra mudança" ...] [--title "Título"] [--dry-run]
  node scripts/bump-version.mjs auto --before <sha> [--after <sha>] [--message "mensagem do commit"] [--dry-run]
  node scripts/bump-version.mjs check
  node scripts/bump-version.mjs regenerate`;

const fail = (msg) => {
  console.error(`Erro: ${msg}`);
  process.exit(1);
};
const skip = (reason) => {
  console.log(`Nenhuma versão gerada: ${reason}`);
  process.exit(0);
};
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const parseVersion = (v) => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(v ?? ""));
  return m ? m.slice(1).map(Number) : null;
};
const isGeneric = (text) => PLACEHOLDERS.some((re) => re.test(text));
const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// Mais nova primeiro.
const compareDesc = (a, b) => {
  const va = parseVersion(a.version);
  const vb = parseVersion(b.version);
  for (let i = 0; i < 3; i++) if (va[i] !== vb[i]) return vb[i] - va[i];
  return 0;
};

function validate(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return ["version-history.json deve ser uma lista com pelo menos uma entrada."];
  }
  const errors = [];
  const seen = new Set();
  history.forEach((e, i) => {
    const n = `entrada ${i + 1}`;
    if (!parseVersion(e.version)) errors.push(`${n}: versão inválida (${e.version}).`);
    if ("revision" in e) errors.push(`${n} (v${e.version}): o campo "revision" não é mais usado.`);
    if (!Array.isArray(e.changes) || e.changes.length === 0) errors.push(`${n}: sem lista "changes".`);
    if (seen.has(e.version)) errors.push(`v${e.version} aparece mais de uma vez.`);
    seen.add(e.version);
  });
  if (errors.length) return errors;
  for (let i = 0; i < history.length - 1; i++) {
    if (compareDesc(history[i], history[i + 1]) >= 0) {
      errors.push(`fora de ordem: v${history[i].version} antes de v${history[i + 1].version}.`);
    }
  }
  return errors;
}

function validatePackage(history, pkg) {
  const errors = [];
  if ("revision" in pkg) errors.push('package.json ainda tem o campo "revision".');
  if (pkg.version !== history[0].version) {
    errors.push(`package.json (v${pkg.version}) diverge do histórico (v${history[0].version}).`);
  }
  return errors;
}

function renderMarkdown(history) {
  const lines = ["# Histórico de versões do LynkNotes", "", INTRO, ""];
  for (const e of history) {
    lines.push(`## v${e.version} (${e.date})`, "");
    if (e.title && e.title !== e.changes[0].slice(0, 80)) lines.push(`**${e.title}**`, "");
    for (const c of e.changes) lines.push(`- ${c}`);
    lines.push("");
  }
  return lines.join("\n");
}

function nextVersion(current, kind) {
  let [major, minor, patch] = parseVersion(current);
  if (kind === "major") [major, minor, patch] = [major + 1, 0, 0];
  else if (kind === "minor") [minor, patch] = [minor + 1, 0];
  else patch += 1;
  return `${major}.${minor}.${patch}`;
}

function parseArgs(args) {
  const out = { positionals: [], title: undefined, before: undefined, after: undefined, message: undefined, dryRun: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--title") out.title = args[++i];
    else if (a === "--before") out.before = args[++i];
    else if (a === "--after") out.after = args[++i];
    else if (a === "--message") out.message = args[++i];
    else if (a === "--dry-run") out.dryRun = true;
    else if (a.startsWith("--")) fail(`opção desconhecida: ${a}\n${USAGE}`);
    else out.positionals.push(a.trim());
  }
  return out;
}

const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" });
const validSha = (s) => Boolean(s) && !/^0+$/.test(s);

function changedFiles(before, after) {
  if (!validSha(before)) return null;
  try {
    return git("diff", "--name-only", before, after).split("\n").filter(Boolean);
  } catch {
    return null;
  }
}

// Só entram commits que mexeram em pastas do app (README, workflows etc. ficam de fora).
function commitList(before, after) {
  if (!validSha(before)) return null;
  try {
    const out = git("log", "--no-merges", "--reverse", "--format=%h%x1f%B%x00", `${before}..${after}`, "--", ...APP_PATHS);
    const list = out
      .split("\0")
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const [sha, ...rest] = chunk.split("\x1f");
        return { sha: sha.trim(), message: rest.join("\x1f").trim() };
      });
    return list.length ? list : null;
  } catch {
    return null;
  }
}

// Conventional Commits: "feat:" sobe MINOR; "!" ou BREAKING CHANGE sobe MAJOR; o resto sobe PATCH.
function classify(message, sha) {
  const [subjectRaw, ...rest] = message.trim().split(/\r?\n/);
  const subject = subjectRaw.trim();
  const body = rest.join("\n");
  const m = /^(\w+)(\([^)]*\))?(!)?:\s*(.+)$/.exec(subject);
  const type = m ? m[1].toLowerCase() : null;
  const breaking = Boolean(m?.[3]) || /^BREAKING[ -]CHANGE:/m.test(message);
  const kind = breaking ? "major" : type === "feat" ? "minor" : "patch";
  let text = capitalize((m ? m[4] : subject).trim());
  if (text.length < MIN_LEN || isGeneric(text)) {
    text = `Alterações no commit ${sha}: ${text || "sem descrição"}`;
  }
  return { kind, text };
}

function save(history, pkg) {
  writeFileSync(paths.history, JSON.stringify(history, null, 2) + "\n");
  writeFileSync(paths.pkg, JSON.stringify(pkg, null, 2) + "\n");
  writeFileSync(paths.markdown, renderMarkdown(history));
}

function loadValidated() {
  const history = readJson(paths.history);
  const pkg = readJson(paths.pkg);
  const errors = validate(history);
  if (!errors.length) errors.push(...validatePackage(history, pkg));
  return { history, pkg, errors };
}

function publish(kind, changes, title, dryRun) {
  const { history, pkg, errors } = loadValidated();
  if (errors.length) fail("o versionamento tem problemas; corrija antes de gerar nova versão:\n- " + errors.join("\n- "));
  const now = new Date();
  const entry = {
    version: nextVersion(history[0].version, kind),
    date: now.toLocaleDateString("sv-SE"), // AAAA-MM-DD no fuso local
    timestamp: now.toISOString(),
    title: (title?.trim() || changes[0]).slice(0, 80),
    changes,
  };
  if (dryRun) {
    console.log(`Simulação (${kind}); nada foi gravado:`);
    console.log(JSON.stringify(entry, null, 2));
    process.exit(0);
  }
  save([entry, ...history], { ...pkg, version: entry.version });
  console.log(`LynkNotes atualizado para v${entry.version}`);
}

const args = process.argv.slice(2);
const mode = args.shift();
const opts = parseArgs(args);

if (mode === "check") {
  const { history, errors } = loadValidated();
  const generic = Array.isArray(history) ? history.filter((e) => (e.changes ?? []).some(isGeneric)).length : 0;
  if (generic) console.warn(`Aviso: ${generic} entrada(s) com descrição genérica.`);
  if (errors.length) fail("verificação falhou:\n- " + errors.join("\n- "));
  console.log("Versionamento consistente.");
} else if (mode === "regenerate") {
  const { history, pkg, errors } = loadValidated();
  if (errors.length) fail("corrija antes de regenerar:\n- " + errors.join("\n- "));
  save(history, pkg);
  console.log("VERSION_HISTORY.md regenerado.");
} else if (mode === "auto") {
  // --after limita o intervalo ao push que disparou o workflow (padrão: HEAD).
  const after = validSha(opts.after) ? opts.after : "HEAD";
  const files = changedFiles(opts.before, after);
  if (files && !files.some((f) => APP_PATHS.some((p) => f.startsWith(p)))) {
    skip("nenhum arquivo do app mudou desde a última versão.");
  }
  let headSha = "desconhecido";
  try {
    headSha = git("rev-parse", "--short", after).trim();
  } catch {}
  const commits = commitList(opts.before, after) ?? (opts.message ? [{ sha: headSha, message: opts.message }] : []);
  const usable = commits.filter(
    (c) => !SKIP_MARKERS.test(c.message) && !/^Merge (branch|pull request|remote-tracking)/i.test(c.message)
  );
  if (usable.length === 0) skip("nenhum commit elegível (marcadores de pulo ou merges).");
  const parsed = usable.map((c) => classify(c.message, c.sha));
  const kind = parsed.reduce((best, p) => (RANK[p.kind] > RANK[best] ? p.kind : best), "patch");
  const changes = [...new Set(parsed.map((p) => p.text))];
  publish(kind, changes, opts.title, opts.dryRun);
} else if (["patch", "minor", "major"].includes(mode)) {
  const changes = opts.positionals;
  if (changes.length === 0) fail(`informe o que mudou entre aspas.\n${USAGE}`);
  for (const c of changes) {
    if (c.length < MIN_LEN) fail(`descrição curta demais (mínimo ${MIN_LEN} caracteres): "${c}"`);
    if (isGeneric(c)) fail(`descrição genérica não é aceita: "${c}"`);
  }
  publish(mode, changes, opts.title, opts.dryRun);
} else {
  fail(`modo inválido.\n${USAGE}`);
}