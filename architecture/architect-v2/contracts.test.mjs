// Contract tests for the drawing architect-v2. One per seam. Blind to the
// code: the tool as a command on fixture roots, the config, the skill's text.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FX = join(ROOT, "requirements", "architect-v2", "fixtures");
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
const section = (t, title) =>
  t.match(
    new RegExp(
      `^## [^\\n]*${title}[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`,
      "m",
    ),
  )?.[1] ?? "";

test("1. drawing to check: exactly one finding per fixture root, its rule the fixture's name; none on clean", () => {
  for (const rule of ["sections", "edges", "tests", "strategy", "orphan"]) {
    const r = kaal("drawings", join(FX, rule));
    const findings = r.stderr.trim().split("\n").filter(Boolean);
    assert.equal(r.status, 1, `${rule}: exit ${r.status}`);
    assert.equal(
      findings.length,
      1,
      `${rule}: ${findings.length} findings:\n${r.stderr}`,
    );
    assert.match(findings[0], new RegExp(`^t: ${rule}: .+`));
  }
  const c = kaal("drawings", join(FX, "clean"));
  assert.equal(c.status, 0, c.stderr);
  assert.equal(c.stderr.trim(), "");
});

test("2. check to board: the line shape, the summary on the league's tree, the wall in the list", () => {
  const t = kaal("drawings");
  assert.equal(t.status, 0, t.stderr);
  assert.equal(t.stderr.trim(), "", "findings on the league's own drawings");
  assert.match(t.stdout, /^drawings: /m);
  const gates =
    JSON.parse(readFileSync(join(ROOT, "kaal.config.json"), "utf8")).gates ??
    [];
  const wall = gates.find((g) => g.name === "drawings");
  assert.ok(wall, "no drawings wall");
  assert.match(wall.command, /kaal\.mjs drawings$/);
  assert.ok(wall.fix, "the wall has no fix hint");
});

test("3. skill text to the architect: formats first in section 2, the human gate by name in section 5", () => {
  const t = readFileSync(join(ROOT, "skills", "architect", "SKILL.md"), "utf8");
  const fixed =
    section(t, "Draw the want").match(
      /^- \*\*Fixed and free\.\*\*[\s\S]*?(?=^- \*\*|(?![\s\S]))/m,
    )?.[0] ?? "";
  assert.match(fixed, /format/i);
  assert.match(fixed, /first/i);
  const h = section(t, "Hand off");
  assert.match(h, /human\.gates/);
  assert.match(h, /one (merge|pull request)/i);
});
