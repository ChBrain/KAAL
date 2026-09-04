// Acceptance tests for requirement push-v1. One per criterion, numbered to
// match. Surface only: the ledgers, the scripts as commands, the eval
// records. Nothing here imports a script; it runs it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

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
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
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

test("2. kaal ledger passes the league, refuses the bad ledger and the stale ledger", () => {
  assert.equal(
    run(["bin/kaal.mjs", "ledger"]).status,
    0,
    "league ledgers refused",
  );
  assert.equal(
    run(["bin/kaal.mjs", "ledger", join(HERE, "fixtures", "bad-ledger")])
      .status,
    1,
    "bad ledger not refused",
  );
  assert.equal(
    run(["bin/kaal.mjs", "ledger", join(HERE, "fixtures", "stale-ledger")])
      .status,
    1,
    "stale ledger not refused",
  );
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

test("5. every script, in bin/ or in a skill's scripts/, has a test asserting a failure on bad input", () => {
  const failing = /status,?\s*1|\.throws|rejects|toBe\(1\)|equal\(.*1\)/;
  const pairs = [];
  const bin = join(ROOT, "bin");
  if (existsSync(bin))
    for (const s of readdirSync(bin).filter((f) => f.endsWith(".mjs")))
      pairs.push([
        join(bin, s),
        join(ROOT, "tests", basename(s, ".mjs") + ".test.mjs"),
      ]);
  for (const n of skills()) {
    const dir = join(ROOT, "skills", n, "scripts");
    if (!existsSync(dir)) continue;
    for (const s of readdirSync(dir).filter(
      (f) => f.endsWith(".mjs") && !f.endsWith(".test.mjs"),
    ))
      pairs.push([join(dir, s), join(dir, basename(s, ".mjs") + ".test.mjs")]);
  }
  assert.ok(pairs.length >= 1, "no scripts anywhere");
  for (const [s, t] of pairs) {
    assert.ok(existsSync(t), `${s}: no test`);
    assert.ok(
      failing.test(readFileSync(t, "utf8")),
      `${s}: test asserts no failure`,
    );
  }
});

test("6. a move stands at script with a script inside its skill, called from SKILL.md, and a passing test", () => {
  const moves = allMoves().filter((m) => m.rung === "script");
  assert.ok(moves.length >= 1, "no move at script");
  for (const m of moves) {
    assert.ok(
      m.script && m.script.startsWith("scripts/"),
      `${m.skill}/${m.name}: script not under the skill's scripts/`,
    );
    const script = join(ROOT, "skills", m.skill, m.script);
    assert.ok(existsSync(script), `${m.skill}/${m.name}: script missing`);
    assert.ok(
      readFileSync(join(ROOT, "skills", m.skill, "SKILL.md"), "utf8").includes(
        m.script,
      ),
      `${m.skill}/${m.name}: SKILL.md does not call ${m.script}`,
    );
    const t = join(ROOT, "skills", m.skill, m.test ?? "");
    assert.ok(m.test && existsSync(t), `${m.skill}/${m.name}: test missing`);
    assert.equal(
      run(["--test", t], join(ROOT, "skills", m.skill)).status,
      0,
      `${m.skill}/${m.name}: test fails`,
    );
  }
});

test("7. a move stands at skill with fresh pass records from two models", () => {
  const moves = allMoves().filter((m) => m.rung === "skill");
  assert.ok(moves.length >= 1, "no move at skill");
  for (const m of moves) {
    const dir = m.test && join(ROOT, m.test);
    assert.ok(
      dir && existsSync(dir) && statSync(dir).isDirectory(),
      `${m.skill}/${m.name}: no eval directory`,
    );
    const current = sha(join(ROOT, "skills", m.skill, "SKILL.md"));
    const records = readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => frontmatter(readFileSync(join(dir, f), "utf8")));
    const fresh = records.filter(
      (r) => r.verdict === "pass" && r.skill_sha === current,
    );
    assert.ok(
      new Set(fresh.map((r) => r.model)).size >= 2,
      `${m.skill}/${m.name}: fewer than two fresh passing models`,
    );
  }
});

test("8. the evals workflow runs only on /eval or dispatch, reads models, writes evals/", () => {
  const dir = join(ROOT, ".github", "workflows");
  assert.ok(existsSync(dir), "no workflows");
  const w = readdirSync(dir)
    .map((f) => readFileSync(join(dir, f), "utf8"))
    .find((t) => /\/eval/.test(t) && /evals\//.test(t));
  assert.ok(w, "no evals workflow");
  assert.ok(
    /issue_comment/.test(w) && /workflow_dispatch/.test(w),
    "not triggered by /eval comment and dispatch",
  );
  assert.ok(
    !/^\s*push:/m.test(w) && !/^\s*pull_request:/m.test(w),
    "runs on push or pull_request",
  );
  assert.ok(/models:\s*read/.test(w), "no models: read permission");
});
