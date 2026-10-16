import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  pkg: resolve(root, "package.json"),
  history: resolve(root, "version-history.json"),
  markdown: resolve(root, "VERSION_HISTORY.md"),
};

const KINDS = ["patch", "minor", "major", "rev"];
const MIN_LEN = 12;
const PLACEHOLDERS = [
  /revisão incrementada para registrar/i,
  /atualizações, melhorias e correções desta versão/i,
  /ajustes e correções registrados/i,
];

const USAGE = `Uso:
  node scripts/bump-version.mjs <patch|minor|major|rev> "O que mudou" ["Outra mudança" ...] [--title "Título"] [--dry-run]
  node scripts/bump-version.mjs check`;

const fail = (msg) => {
  console.error(`Erro: ${msg}`);
  process.exit(1);
};
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const parseVersion = (v) => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(v ?? ""));
  return m ? m.slice(1).map(Number) : null;
};
const isGeneric = (text) => PLACEHOLDERS.some((re) => re.test(text));

// Ordem decrescente: versão maior primeiro, depois REV maior.
const compareDesc = (a, b) => {
  const va = parseVersion(a.version);
  const vb = parseVersion(b.version);
  for (let i = 0; i < 3; i++) if (va[i] !== vb[i]) return vb[i] - va[i];
  return b.revision - a.revision;
};

function validate(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return ["version-history.json deve ser uma lista com pelo menos uma entrada."];
  }
  const errors = [];
  const seen = new Set();
  const revsByVersion = new Map();
  history.forEach((e, i) => {
    const n = `entrada ${i + 1}`;
    if (!parseVersion(e.version)) errors.push(`${n}: versão inválida (${e.version}).`);
    if (!Number.isInteger(e.revision) || e.revision < 1) errors.push(`${n}: REV inválido (${e.revision}).`);
    if (!Array.isArray(e.changes) || e.changes.length === 0) errors.push(`${n}: sem lista "changes".`);
    const key = `${e.version}#${e.revision}`;
    if (seen.has(key)) errors.push(`v${e.version} REV ${e.revision} aparece mais de uma vez.`);
    seen.add(key);
    if (!revsByVersion.has(e.version)) revsByVersion.set(e.version, new Set());
    revsByVersion.get(e.version).add(e.revision);
  });
  if (errors.length) return errors;

  for (const [version, revs] of revsByVersion) {
    for (let r = 1; r <= Math.max(...revs); r++) {
      if (!revs.has(r)) errors.push(`v${version}: REV ${r} ausente.`);
    }
  }
  for (let i = 0; i < history.length - 1; i++) {
    if (compareDesc(history[i], history[i + 1]) > 0) {
      errors.push(
        `fora de ordem: v${history[i].version} REV ${history[i].revision} antes de v${history[i + 1].version} REV ${history[i + 1].revision}.`
      );
    }
  }
  return errors;
}

function renderMarkdown(history) {
  const lines = [
    "# Histórico de versões do LynkNotes",
    "",
    "Este arquivo registra as versões publicadas do LynkNotes. A versão do LynkNotes é independente da versão do JSLynk e dos demais aplicativos conectados.",
    "",
  ];
  for (const e of history) {
    lines.push(`## v${e.version} — REV ${e.revision} (${e.date})`, "");
    if (e.title) lines.push(`**${e.title}**`, "");
    for (const c of e.changes) lines.push(`- ${c}`);
    lines.push("");
  }
  return lines.join("\n");
}

const args = process.argv.slice(2);
const kind = args.shift();

// ---------- Modo check (para CI) ----------
if (kind === "check") {
  const history = readJson(paths.history);
  const pkg = readJson(paths.pkg);
  const errors = validate(history);
  if (!errors.length) {
    const latest = [...history].sort(compareDesc)[0];
    if (pkg.version !== latest.version || pkg.revision !== latest.revision) {
      errors.push(
        `package.json (v${pkg.version} REV ${pkg.revision}) diverge do histórico (v${latest.version} REV ${latest.revision}).`
      );
    }
  }
  const generic = Array.isArray(history) ? history.filter((e) => (e.changes ?? []).some(isGeneric)).length : 0;
  if (generic) console.warn(`Aviso: ${generic} entrada(s) com descrição genérica.`);
  if (errors.length) fail("verificação falhou:\n- " + errors.join("\n- "));
  console.log("Versionamento consistente.");
  process.exit(0);
}

// ---------- Modo bump ----------
if (!KINDS.includes(kind)) fail(`tipo inválido.\n${USAGE}`);

const changes = [];
let titleArg;
let dryRun = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--title") titleArg = args[++i];
  else if (a === "--dry-run") dryRun = true;
  else if (a.startsWith("--")) fail(`opção desconhecida: ${a}\n${USAGE}`);
  else changes.push(a.trim());
}

if (changes.length === 0) fail(`informe o que mudou entre aspas.\n${USAGE}`);
for (const c of changes) {
  if (c.length < MIN_LEN) fail(`descrição curta demais (mínimo ${MIN_LEN} caracteres): "${c}"`);
  if (isGeneric(c)) fail(`descrição genérica não é aceita: "${c}"`);
}

const history = readJson(paths.history);
const pkg = readJson(paths.pkg);
if (Array.isArray(history) && history.every((e) => parseVersion(e.version) && Number.isInteger(e.revision))) {
  history.sort(compareDesc);
}
const errors = validate(history);
if (errors.length) fail("version-history.json tem problemas; corrija antes de gerar nova versão:\n- " + errors.join("\n- "));

// O histórico é a única fonte da verdade; o package.json precisa concordar.
const latest = history[0];
if (pkg.version !== latest.version || pkg.revision !== latest.revision) {
  fail(
    `package.json (v${pkg.version} REV ${pkg.revision}) diverge do histórico (v${latest.version} REV ${latest.revision}). Alinhe os dois antes de continuar.`
  );
}

let [major, minor, patch] = parseVersion(latest.version);
let revision = latest.revision;
if (kind === "rev") {
  revision += 1;
} else {
  if (kind === "major") [major, minor, patch] = [major + 1, 0, 0];
  if (kind === "minor") [minor, patch] = [minor + 1, 0];
  if (kind === "patch") patch += 1;
  revision = 1;
}
const version = `${major}.${minor}.${patch}`;

const now = new Date();
const entry = {
  version,
  revision,
  date: now.toLocaleDateString("sv-SE"), // AAAA-MM-DD no fuso local
  timestamp: now.toISOString(),
  title: (titleArg?.trim() || changes[0]).slice(0, 80),
  changes,
};

const nextHistory = [entry, ...history];
const nextPkg = { ...pkg, version, revision };

if (dryRun) {
  console.log("Simulação (nada foi gravado):");
  console.log(JSON.stringify(entry, null, 2));
  process.exit(0);
}

// Tudo foi validado e montado em memória; só agora grava os arquivos.
writeFileSync(paths.history, JSON.stringify(nextHistory, null, 2) + "\n");
writeFileSync(paths.pkg, JSON.stringify(nextPkg, null, 2) + "\n");
writeFileSync(paths.markdown, renderMarkdown(nextHistory));
console.log(`LynkNotes atualizado para v${version} — REV ${revision}`);
