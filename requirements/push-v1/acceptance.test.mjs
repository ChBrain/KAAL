// Acceptance tests for requirement push-v1. One per criterion, numbered to
// match. Surface only: the ledgers, the scripts as commands, the eval
// records. Nothing here imports a script; it runs it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const run = (args, cwd = ROOT) =>
  spawnSync("node", args, { cwd, encoding: "utf8" });
const skills = () =>
  readdirSync(join(ROOT, "skills")).filter((n) =>
    statSync(join(ROOT, "skills", n)).isDirectory(),
  );
const ledger = (n) =>
  JSON.parse(readFileSync(join(ROOT, "skills", n, "moves.json"), "utf8")).moves;
const allMoves = () =>
  skills().flatMap((n) => ledger(n).map((m) => ({ ...m, skill: n })));
const frontmatter = (text) =>
  Object.fromEntries(
    [
      ...(text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "").matchAll(
        /^(\w+):\s*(.*)$/gm,
      ),
    ].map((m) => [m[1], m[2]]),
  );

test("1. analyse, architect and operate each record a human move", () => {
  for (const n of ["analyse", "architect", "operate"])
    assert.ok(
      ledger(n).some((m) => m.rung === "human"),
      `${n}: no human move`,
    );
});

test("2. kaal ledger passes the league and refuses the bad ledger", () => {
  assert.equal(
    run(["bin/kaal.mjs", "ledger"]).status,
    0,
    "league ledgers refused",
  );
  const bad = run([
    "bin/kaal.mjs",
    "ledger",
    join(HERE, "fixtures", "bad-ledger", "moves.json"),
  ]);
  assert.equal(bad.status, 1, "bad ledger not refused");
});

test("3. kaal check passes skills/ and refuses the vendor-named skill", () => {
  assert.equal(run(["bin/kaal.mjs", "check"]).status, 0, "skills/ refused");
  const bad = run([
    "bin/kaal.mjs",
    "check",
    join(HERE, "fixtures", "bad-skill"),
  ]);
  assert.equal(bad.status, 1, "vendor-named skill not refused");
});

test("4. kaal retros prints one line per skill with a count", () => {
  const r = run(["bin/kaal.mjs", "retros"]);
  assert.equal(r.status, 0);
  const lines = r.stdout.trim().split("\n");
  for (const n of skills())
    assert.ok(
      lines.some((l) => l.includes(n) && /\d+/.test(l)),
      `${n}: no count line`,
    );
});

test("5. every script under bin/ has a test that asserts a failure on bad input", () => {
  const bin = join(ROOT, "bin");
  assert.ok(existsSync(bin), "no bin/");
  const scripts = readdirSync(bin).filter((f) => f.endsWith(".mjs"));
  assert.ok(scripts.length >= 1, "no scripts");
  for (const s of scripts) {
    const t = join(ROOT, "tests", basename(s, ".mjs") + ".test.mjs");
    assert.ok(existsSync(t), `${s}: no test`);
    const text = readFileSync(t, "utf8");
    assert.ok(
      /status,?\s*1|\.throws|rejects|toBe\(1\)|equal\(.*1\)/.test(text),
      `${s}: test asserts no failure`,
    );
  }
});

test("6. a move stands at script with a script and a passing test on disk", () => {
  const moves = allMoves().filter((m) => m.rung === "script");
  assert.ok(moves.length >= 1, "no move at script");
  for (const m of moves) {
    assert.ok(
      m.script && existsSync(join(ROOT, m.script)),
      `${m.skill}/${m.name}: script missing`,
    );
    assert.ok(
      m.test && existsSync(join(ROOT, m.test)),
      `${m.skill}/${m.name}: test missing`,
    );
    assert.equal(
      run(["--test", m.test]).status,
      0,
      `${m.skill}/${m.name}: test fails`,
    );
  }
});

test("7. a move stands at skill with pass records from two models", () => {
  const moves = allMoves().filter((m) => m.rung === "skill");
  assert.ok(moves.length >= 1, "no move at skill");
  for (const m of moves) {
    const dir = m.test && join(ROOT, m.test);
    assert.ok(
      dir && existsSync(dir) && statSync(dir).isDirectory(),
      `${m.skill}/${m.name}: no eval directory`,
    );
    const records = readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => frontmatter(readFileSync(join(dir, f), "utf8")));
    const passing = new Set(
      records.filter((r) => r.verdict === "pass").map((r) => r.model),
    );
    assert.ok(
      passing.size >= 2,
      `${m.skill}/${m.name}: ${passing.size} passing model(s)`,
    );
  }
});
