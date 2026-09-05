// Acceptance tests for requirement architect-v2. One per criterion. Surface
// only: the tool as a command on fixture roots, the config, the skill's text.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const SKILL = join(ROOT, "skills", "architect");
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
const section = (t, title) => {
  const m = t.match(
    new RegExp(`^## [^\\n]*${title}[^\\n]*\\n([\\s\\S]*?)(?=^## |\\s*$)`, "m"),
  );
  return m ? m[1] : "";
};
const text = () => readFileSync(join(SKILL, "SKILL.md"), "utf8");
const RETROS = [
  "2026-09-04-architect-first-use.md",
  "2026-09-04-architect-second-use.md",
  "2026-09-04-architect-third-use.md",
  "2026-09-04-architect-fourth-use.md",
  "2026-09-04-architect-fifth-use.md",
  "2026-09-04-architect-sixth-use.md",
  "2026-09-04-architect-seventh-use.md",
  "2026-09-04-architect-eighth-use.md",
  "2026-09-04-architect-ninth-use.md",
  "2026-09-05-architect-tenth-use.md",
];

test("1. kaal drawings refuses each broken shape, naming drawing and rule", () => {
  for (const rule of ["sections", "edges", "tests", "strategy", "orphan"]) {
    const r = kaal("drawings", join(HERE, "fixtures", rule));
    assert.equal(
      r.status,
      1,
      `${rule}: exit ${r.status}\n${r.stdout}${r.stderr}`,
    );
    assert.match(
      r.stderr,
      new RegExp(`^t: ${rule}:`, "m"),
      `${rule}: no finding naming the drawing and the rule:\n${r.stderr}`,
    );
  }
});

test("2. the league's own drawings pass, and the board runs the check", () => {
  const r = kaal("drawings");
  assert.equal(r.status, 0, r.stderr);
  const gates =
    JSON.parse(readFileSync(join(ROOT, "kaal.config.json"), "utf8")).gates ??
    [];
  assert.ok(gates.length > 0, "no walls");
  assert.ok(
    gates.some((g) => /kaal\.mjs drawings\b/.test(g.command)),
    "no drawings wall",
  );
});

test("3. the Fixed and free rule fixes the formats first", () => {
  const d = section(text(), "Draw the want");
  assert.match(d, /format/i);
  assert.match(d, /first/i);
});

test("4. the Hand off names human.gates and the one-merge approval", () => {
  const h = section(text(), "Hand off");
  assert.match(h, /human\.gates/);
  assert.match(h, /one (pull request|merge)/i);
});

test("5. the edge-count fixture exists and expects three of each", () => {
  const f = join(SKILL, "fixtures", "edge-count");
  assert.ok(existsSync(join(f, "ask.md")), "no ask.md");
  const e = readFileSync(join(f, "expect.md"), "utf8");
  assert.match(e, /three .*seams/i);
  assert.match(e, /three .*edges/i);
  assert.match(e, /three .*contract tests/i);
});

test("6. the ten retros are archived and none remains in retros/", () => {
  assert.equal(RETROS.length, 10);
  for (const r of RETROS) {
    assert.ok(
      existsSync(join(ROOT, "retros", "archive", r)),
      `${r} not archived`,
    );
    assert.ok(!existsSync(join(ROOT, "retros", r)), `${r} still in retros/`);
  }
});
