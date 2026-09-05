// Contract tests for the drawing public-v1. One per seam. Blind to the code:
// every seam here is a file GitHub reads, so the tests read the same file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (...p) => readFileSync(join(ROOT, ...p), "utf8");

test("1. dependabot to pull requests: two streams, weekly, limited, npm grouped", () => {
  const d = read(".github", "dependabot.yml");
  const streams = d.split(/^\s*- package-ecosystem: /m).slice(1);
  assert.deepEqual(streams.map((s) => s.split("\n")[0].trim()).sort(), [
    "github-actions",
    "npm",
  ]);
  for (const s of streams) {
    assert.match(s, /interval: weekly/);
    assert.match(s, /open-pull-requests-limit: \d+/);
  }
  assert.match(
    streams.find((s) => s.startsWith("npm")),
    /groups:/,
  );
});

test("2. codeql to the Security tab: the permission and the three triggers", () => {
  const c = read(".github", "workflows", "codeql.yml");
  assert.match(c, /security-events:\s*write/);
  assert.match(c, /^\s*push:\n\s*branches:\s*\[main\]/m);
  assert.match(c, /^\s*pull_request:/m);
  assert.match(c, /^\s*schedule:\n\s*- cron:/m);
  assert.match(c, /codeql-action\/init@v\d+/);
  assert.match(c, /codeql-action\/analyze@v\d+/);
});

test("3. ci to checks: walls stays on ubuntu, walls-windows on windows, one command each", () => {
  const ci = read(".github", "workflows", "ci.yml");
  const job = (name) => {
    const m = ci.match(
      new RegExp(`^ {2}${name}:\\n([\\s\\S]*?)(?=^ {2}\\S|(?![\\s\\S]))`, "m"),
    );
    return m ? m[1] : "";
  };
  assert.match(job("walls"), /runs-on: ubuntu-latest/);
  assert.match(job("walls-windows"), /runs-on: windows-latest/);
  for (const name of ["walls", "walls-windows"]) {
    const runs = [...job(name).matchAll(/^\s*- run: (.*)$/gm)].map((m) =>
      m[1].trim(),
    );
    assert.deepEqual(runs, ["npm ci", "npm test"], `${name} runs ${runs}`);
  }
});

test("4. contract to runtimes: AGENTS.md carries the sentences, the pointers carry only a pointer", () => {
  const a = read("AGENTS.md");
  for (const re of [
    /npm test/,
    /FAIL/,
    /waiver/,
    /--no-verify/,
    /one pull request[^.]*one lane/i,
  ])
    assert.match(a, re);
  for (const p of [["CLAUDE.md"], [".github", "copilot-instructions.md"]]) {
    const t = read(...p);
    assert.match(t, /AGENTS\.md/);
    assert.ok(t.split("\n").length < 30);
    assert.doesNotMatch(
      t,
      /npm test|waiver/,
      `${p.join("/")} restates the contract`,
    );
  }
});
