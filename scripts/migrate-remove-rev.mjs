// Uso único: converte o histórico com REV para versões sequenciais (1.0.0, 1.0.1, 1.0.2...).
// A ordem do arquivo (mais nova primeiro) é tratada como a ordem real das alterações.
// Depois de rodar e conferir, este arquivo pode ser apagado.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const historyPath = resolve(root, "version-history.json");
const packagePath = resolve(root, "package.json");
const dryRun = process.argv.includes("--dry-run");

const history = JSON.parse(readFileSync(historyPath, "utf8"));
const pkg = JSON.parse(readFileSync(packagePath, "utf8"));

if (!Array.isArray(history) || history.length === 0) {
  console.error("Erro: version-history.json vazio ou inválido.");
  process.exit(1);
}
if (!history.some((e) => "revision" in e)) {
  console.log("Nada a migrar: nenhuma entrada tem o campo revision.");
  process.exit(0);
}

const chronological = [...history].reverse(); // da mais antiga para a mais nova
const migrated = chronological
  .map((entry, i) => {
    const { revision, version, ...rest } = entry;
    return { version: `1.0.${i}`, ...rest, legacy: `v${version} REV ${revision}` };
  })
  .reverse(); // volta para a mais nova primeiro

console.log("Conversão (antigo → novo):");
for (const e of [...migrated].reverse()) console.log(`  ${e.legacy} → v${e.version}`);

if (dryRun) {
  console.log("\nSimulação: nada foi gravado.");
  process.exit(0);
}

const nextPkg = { ...pkg, version: migrated[0].version };
delete nextPkg.revision;

writeFileSync(historyPath, JSON.stringify(migrated, null, 2) + "\n");
writeFileSync(packagePath, JSON.stringify(nextPkg, null, 2) + "\n");
execFileSync("node", [resolve(root, "scripts/bump-version.mjs"), "regenerate"], { stdio: "inherit" });
console.log(`\nMigração concluída. Versão atual: v${nextPkg.version}`);