import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const sourceScript = resolve(process.cwd(), "scripts/bump-version.mjs");
const temporaryRoots = [];

function git(root, ...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function fixture(commits) {
  const root = mkdtempSync(join(tmpdir(), "lynknotes-versioning-"));
  temporaryRoots.push(root);
  mkdirSync(join(root, "scripts"), { recursive: true });
  writeFileSync(join(root, "scripts", "bump-version.mjs"), readFileSync(sourceScript, "utf8"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "versioning-fixture", version: "1.0.0" }, null, 2) + "\n");
  writeFileSync(join(root, "version-history.json"), JSON.stringify(
    [{ version: "1.0.0", date: "2026-01-01", title: "Initial", changes: ["Initial version established"] }], null, 2,
  ) + "\n");
  writeFileSync(join(root, "VERSION_HISTORY.md"), "# History\n");
  writeFileSync(join(root, "src.js"), "initial content\n");
  git(root, "init", "-b", "main");
  git(root, "config", "user.name", "Versioning Test");
  git(root, "config", "user.email", "versioning-test@example.invalid");
  git(root, "add", ".");
  git(root, "commit", "-m", "chore: initial fixture");
  const before = git(root, "rev-parse", "HEAD");
  for (const [message, content] of commits) {
    writeFileSync(join(root, "src.js"), content + "\n");
    git(root, "add", "src.js");
    git(root, "commit", "-m", message);
  }
  return { root, before, after: git(root, "rev-parse", "HEAD") };
}

function simulate(root, before, after) {
  return execFileSync("node", ["scripts/bump-version.mjs", "auto", "--before", before, "--after", after, "--dry-run"], {
    cwd: root, encoding: "utf8",
  });
}

test("commits de correção/configuração incrementam PATCH", () => {
  const { root, before, after } = fixture([["fix(auth): preserve login session", "fix"]]);
  const output = simulate(root, before, after);
  assert.match(output, /"version": "1\.0\.1"/);
  assert.match(output, /Preserve login session/);
});

test("feat incrementa MINOR", () => {
  const { root, before, after } = fixture([["feat(search): add note search", "feat"]]);
  const output = simulate(root, before, after);
  assert.match(output, /"version": "1\.1\.0"/);
  assert.match(output, /Add note search/);
});

test("breaking change incrementa MAJOR", () => {
  const { root, before, after } = fixture([["feat(api)!: change account schema", "major"]]);
  const output = simulate(root, before, after);
  assert.match(output, /"version": "2\.0\.0"/);
  assert.match(output, /Change account schema/);
});

test("prevalece o maior impacto entre vários commits do intervalo", () => {
  const { root, before, after } = fixture([
    ["fix: correct note sorting", "fix"],
    ["feat: add note search", "feat"],
    ["refactor(api): change public contract\n\nBREAKING CHANGE: response schema changed", "breaking"],
  ]);
  const output = simulate(root, before, after);
  assert.match(output, /"version": "2\.0\.0"/);
});

test("históricos gerados não disparam uma nova versão", () => {
  const { root, before } = fixture([["chore: initial fixture", "generated"]]);
  writeFileSync(join(root, "version-history.json"), JSON.stringify(
    [{ version: "1.0.0", date: "2026-01-01", title: "Initial", changes: ["Initial version established"] }], null, 2,
  ) + "\n ");
  git(root, "add", "version-history.json");
  git(root, "commit", "-m", "chore(version): update generated history [skip ci]");
  const after = git(root, "rev-parse", "HEAD");
  assert.match(simulate(root, before, after), /Nenhuma versão gerada/);
});

test.after(() => {
  for (const root of temporaryRoots) rmSync(root, { recursive: true, force: true });
});
