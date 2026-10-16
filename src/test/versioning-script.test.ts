import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const sourceScript = resolve(process.cwd(), "scripts/bump-version.mjs");
const temporaryRoots: string[] = [];

function git(root: string, ...args: string[]) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function fixture(commitMessage: string, changedPath: string) {
  const root = mkdtempSync(join(tmpdir(), "lynknotes-versioning-"));
  temporaryRoots.push(root);
  mkdirSync(join(root, "scripts"), { recursive: true });
  mkdirSync(dirname(join(root, changedPath)), { recursive: true });
  writeFileSync(join(root, "scripts", "bump-version.mjs"), readFileSync(sourceScript, "utf8"));
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ name: "versioning-fixture", version: "1.0.0" }, null, 2) + "\n",
  );
  writeFileSync(
    join(root, "version-history.json"),
    JSON.stringify(
      [{ version: "1.0.0", date: "2026-01-01", title: "Initial", changes: ["Initial version established"] }],
      null,
      2,
    ) + "\n",
  );
  writeFileSync(join(root, "VERSION_HISTORY.md"), "# History\n");
  writeFileSync(join(root, changedPath), "initial configuration\n");

  git(root, "init", "-b", "main");
  git(root, "config", "user.name", "Versioning Test");
  git(root, "config", "user.email", "versioning-test@example.invalid");
  git(root, "add", ".");
  git(root, "commit", "-m", "chore: initial fixture");
  const before = git(root, "rev-parse", "HEAD");

  writeFileSync(join(root, changedPath), "updated configuration\n");
  git(root, "add", changedPath);
  git(root, "commit", "-m", commitMessage);
  const after = git(root, "rev-parse", "HEAD");

  return { root, before, after };
}

function simulate(root: string, before: string, after: string) {
  return execFileSync(
    "node",
    ["scripts/bump-version.mjs", "auto", "--before", before, "--after", after, "--dry-run"],
    { cwd: root, encoding: "utf8" },
  );
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("automatic semantic versioning", () => {
  it("detects a root-level configuration change and increments PATCH", () => {
    const { root, before, after } = fixture("chore(config): adjust build settings", "vite.config.ts");
    const output = simulate(root, before, after);
    expect(output).toContain('"version": "1.0.1"');
    expect(output).toContain("Adjust build settings");
  });

  it("increments MINOR for a feat commit", () => {
    const { root, before, after } = fixture("feat(search): add note search", "src/search.ts");
    const output = simulate(root, before, after);
    expect(output).toContain('"version": "1.1.0"');
    expect(output).toContain("Add note search");
  });

  it("ignores commits that only change generated history artifacts", () => {
    const { root, before } = fixture("chore(version): update generated history", "version-history.json");
    writeFileSync(
      join(root, "version-history.json"),
      JSON.stringify(
        [{ version: "1.0.0", date: "2026-01-01", title: "Initial", changes: ["Initial version established"] }],
        null,
        2,
      ) + "\n",
    );
    git(root, "add", "version-history.json");
    git(root, "commit", "-m", "chore(version): update generated history [skip ci]");
    const after = git(root, "rev-parse", "HEAD");
    expect(simulate(root, before, after)).toContain("Nenhuma versão gerada");
  });

  it("increments MAJOR for a breaking change", () => {
    const { root, before, after } = fixture("feat(api)!: change note schema", "src/schema.ts");
    const output = simulate(root, before, after);
    expect(output).toContain('"version": "2.0.0"');
    expect(output).toContain("Change note schema");
  });
});
