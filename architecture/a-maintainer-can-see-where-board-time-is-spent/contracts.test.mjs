// Contract tests for drawing
// a-maintainer-can-see-where-board-time-is-spent. One per seam. The first
// drives the wall runner and reads its public result records. The second
// drives the command and reads the board surface. Neither asserts a duration
// threshold or a clock implementation.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { runGates } from "../../bin/lib/gates.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FIXTURE = join(
  ROOT,
  "requirements",
  "a-maintainer-can-see-where-board-time-is-spent",
  "fixtures",
  "board",
);
const TIMING = / \[timing: (\d+(?:\.\d+)?) ms, advisory\]$/;
const configuredNames = () =>
  JSON.parse(readFileSync(join(FIXTURE, "kaal.config.json"), "utf8")).gates.map(
    (gate) => gate.name,
  );
const runBoard = (fixture = FIXTURE) =>
  spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "gates", fixture],
    {
      cwd: ROOT,
      encoding: "utf8",
    },
  );
const primaryLines = (lines) =>
  lines.filter((line) =>
    /^(?:ok {3}|FAIL |n\/a {2}|waived |unused waiver )/.test(line),
  );
const assertEveryPrimaryIsTimed = (lines, expected) => {
  const primary = primaryLines(lines);
  assert.equal(primary.length, expected, lines.join("\n"));
  for (const line of primary)
    assert.match(
      line,
      TIMING,
      `wall line has no final advisory timing: ${line}`,
    );
  assert.equal(
    lines.filter((line) => TIMING.test(line)).length,
    expected,
    `timing did not occur exactly once per wall:\n${lines.join("\n")}`,
  );
};

test("1. execution to timed result", () => {
  const result = runGates(FIXTURE);
  const names = configuredNames();
  assert.deepEqual(
    result.results.map((wall) => wall.name),
    names,
    "the timed results left declaration order",
  );
  assert.equal(result.results.length, names.length);
  for (const wall of result.results) {
    assert.ok(
      Object.hasOwn(wall, "elapsedMs"),
      `${wall.name} has no elapsedMs result`,
    );
    assert.equal(
      typeof wall.elapsedMs,
      "number",
      `${wall.name} elapsedMs is not a number`,
    );
    assert.ok(
      Number.isFinite(wall.elapsedMs) && wall.elapsedMs >= 0,
      `${wall.name} elapsedMs is not finite and non-negative: ${wall.elapsedMs}`,
    );
  }
});

test("2. timed result to board reader", () => {
  const run = runBoard();
  const lines = run.stdout.trim().split(/\r?\n/);
  const primary = primaryLines(lines);
  const names = configuredNames();
  assertEveryPrimaryIsTimed(lines, names.length);
  assert.deepEqual(
    primary.map((line) => line.match(/^(?:ok {3}|FAIL |n\/a {2})(\S+)/)?.[1]),
    names,
    `the board left declaration order:\n${run.stdout}`,
  );
  assert.deepEqual(
    lines.map((line) => line.replace(TIMING, "")),
    [
      "ok   counted (2 passing)",
      "FAIL refuses  fix: read the refusal",
      "  refused on purpose",
      "ok   after",
      "  reached after the failure",
      "n/a  declines",
      "  this question is not mine",
      "red: 4 wall(s), 1 failing, 0 waived, 1 not applicable",
    ],
  );
  assert.equal(run.status, 1, "timing changed the board's exit answer");

  const scratch = mkdtempSync(join(tmpdir(), "kaal-timing-contract-"));
  const fixture = join(scratch, "board");
  try {
    cpSync(FIXTURE, fixture, { recursive: true });
    const waivers = join(fixture, "waivers");
    mkdirSync(waivers);
    writeFileSync(
      join(waivers, "counted.md"),
      "---\nwall: counted\nwho: architect\nwhy: contract proof\nuntil: 2099-12-31\n---\n",
    );
    writeFileSync(
      join(waivers, "refuses.md"),
      "---\nwall: refuses\nwho: architect\nwhy: contract proof\nuntil: 2099-12-31\n---\n",
    );
    const waived = runBoard(fixture);
    const waivedLines = waived.stdout.trim().split(/\r?\n/);
    assertEveryPrimaryIsTimed(waivedLines, names.length);
    assert.deepEqual(
      waivedLines.map((line) => line.replace(TIMING, "")),
      [
        "unused waiver counted: the wall is green",
        "waived refuses by architect: contract proof (until 2099-12-31)",
        "ok   after",
        "  reached after the failure",
        "n/a  declines",
        "  this question is not mine",
        "green: 4 wall(s), 0 failing, 1 waived, 1 not applicable",
      ],
    );
    assert.equal(waived.status, 0, "timing changed the waived board's exit");
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});
