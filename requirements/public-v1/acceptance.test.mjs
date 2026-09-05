// Acceptance tests for requirement public-v1. One per criterion. Surface
// only: files under .github/ and the root.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const G = join(ROOT, ".github");
const read = (...p) => readFileSync(join(ROOT, ...p), "utf8");
const lines = (t) => t.split("\n").length;

test("1. dependabot updates actions and npm weekly with a limit", () => {
  const d = read(".github", "dependabot.yml");
  for (const eco of ["github-actions", "npm"]) {
    const block = d.slice(d.indexOf(`package-ecosystem: ${eco}`));
    assert.ok(block.length > 0, `no ${eco}`);
    assert.match(
      block.split("package-ecosystem:")[0] || block,
      /interval: weekly/,
    );
    assert.match(
      block.split("package-ecosystem:")[0] || block,
      /open-pull-requests-limit: \d+/,
    );
  }
});

test("2. CODEOWNERS names an owner for everything, the workflows, and bin", () => {
  const c = read(".github", "CODEOWNERS");
  assert.match(c, /^\*\s+@\S+/m);
  assert.match(c, /^\/\.github\/workflows\/\s+@\S+/m);
  assert.match(c, /^\/bin\/\s+@\S+/m);
});

test("3. codeql analyses javascript-typescript on pull requests, main, and a schedule", () => {
  const c = read(".github", "workflows", "codeql.yml");
  assert.match(c, /languages:\s*javascript-typescript/);
  assert.match(c, /^\s*pull_request:/m);
  assert.match(c, /^\s*push:\n\s*branches:\s*\[main\]/m);
  assert.match(c, /^\s*schedule:/m);
  assert.match(c, /security-events:\s*write/);
});

test("4. ci keeps walls on ubuntu, adds windows, both run npm test; actions pinned to v7 or higher", () => {
  const ci = read(".github", "workflows", "ci.yml");
  const jobs = ci.slice(ci.indexOf("\njobs:"));
  assert.match(jobs, /^ {2}walls:\n(?:.*\n)*? {4}runs-on: ubuntu-latest/m);
  assert.match(jobs, /runs-on: windows-latest/);
  assert.equal(
    (jobs.match(/^\s*- run: npm test\s*$/gm) ?? []).length,
    2,
    "two jobs run npm test",
  );
  for (const f of readdirSync(join(G, "workflows"))) {
    const w = read(".github", "workflows", f);
    for (const m of w.matchAll(
      /uses: actions\/(checkout|setup-node|github-script)@v(\d+)/g,
    ))
      assert.ok(Number(m[2]) >= 7, `${f}: ${m[0]}`);
  }
});

test("5. AGENTS.md is the contract; CLAUDE.md and copilot-instructions.md point at it", () => {
  const a = read("AGENTS.md");
  assert.match(a, /npm test/);
  assert.match(a, /FAIL/);
  assert.match(a, /fix/);
  assert.match(a, /main is green|green on main/i);
  assert.match(a, /waiver/);
  assert.match(a, /--no-verify/);
  assert.match(a, /one pull request[^.]*one lane/i);
  for (const p of [["CLAUDE.md"], [".github", "copilot-instructions.md"]]) {
    assert.ok(existsSync(join(ROOT, ...p)), `${p.join("/")} missing`);
    const t = read(...p);
    assert.match(t, /AGENTS\.md/);
    assert.ok(lines(t) < 30, `${p.join("/")} is ${lines(t)} lines`);
  }
});

test("6. FUNDING.yml names the sponsors account", () => {
  assert.match(read(".github", "FUNDING.yml"), /^github:\s*\[?ChBrain\]?/m);
});
