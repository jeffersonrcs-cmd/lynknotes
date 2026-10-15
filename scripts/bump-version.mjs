import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const kind = process.argv[2];
if (!["patch", "minor", "major", "rev"].includes(kind)) {
  console.error("Uso: node scripts/bump-version.mjs <patch|minor|major|rev>");
  process.exit(1);
}
const packagePath = resolve(root, "package.json");
const historyPath = resolve(root, "version-history.json");
const markdownPath = resolve(root, "VERSION_HISTORY.md");
const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(pkg.version || ""));
if (!match) throw new Error("Versão inválida no package.json.");
let [major, minor, patch] = match.slice(1).map(Number);
let revision = Number(pkg.revision ?? 1);
if (!Number.isInteger(revision) || revision < 1) throw new Error("REV inválido no package.json.");
if (kind === "rev") revision += 1;
else {
  if (kind === "major") { major += 1; minor = 0; patch = 0; }
  if (kind === "minor") { minor += 1; patch = 0; }
  if (kind === "patch") patch += 1;
  revision = 1;
}
pkg.version = `${major}.${minor}.${patch}`;
pkg.revision = revision;
writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n");
const history = JSON.parse(readFileSync(historyPath, "utf8"));
const today = new Date().toISOString().slice(0, 10);
const entry = {
  version: pkg.version,
  revision,
  date: today,
  title: kind === "rev" ? "Revisão de manutenção" : "Atualização do LynkNotes",
  changes: [kind === "rev" ? "Ajustes e correções registrados nesta revisão." : "Atualizações, melhorias e correções desta versão."]
};
history.unshift(entry);
writeFileSync(historyPath, JSON.stringify(history, null, 2) + "\n");
const markdown = readFileSync(markdownPath, "utf8");
const section = `## v${pkg.version} — REV ${revision} (${today})\n\n- ${entry.changes[0]}\n\n`;
const header = "# Histórico de versões do LynkNotes\n\n";
if (!markdown.startsWith(header)) throw new Error("Cabeçalho de VERSION_HISTORY.md não encontrado.");
writeFileSync(markdownPath, markdown.replace(header, header + section));
console.log(`LynkNotes atualizado para v${pkg.version} — REV ${revision}`);
