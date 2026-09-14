// Acceptance tests for requirement
// a-maintainer-can-see-where-board-time-is-spent. One per criterion. Surface
// only: the board command's output and exit answer, plus the CI workflow that
// keeps that proof mandatory on both platforms. No test compares a duration
// with a clock or a threshold.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FIXTURE = join(HERE, "fixtures", "board");
const TIMING = / \[timing: (\d+(?:\.\d+)?) ms, advisory\]$/;

const board = () =>
  spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "gates", FIXTURE],
    {
      cwd: ROOT,
      encoding: "utf8",
    },
  );

const resultLines = (stdout) =>
  stdout
    .split(/\r?\n/)
    .filter((line) => /^(?:ok {3}|FAIL |n\/a {2})/.test(line));

test("1. every wall has one ordered advisory timing annotation", () => {
  const r = board();
  const lines = resultLines(r.stdout);
  assert.equal(lines.length, 4, `expected four wall results:\n${r.stdout}`);
  assert.deepEqual(
    lines.map((line) => line.match(/^(?:ok {3}|FAIL |n\/a {2})(\S+)/)?.[1]),
    ["counted", "refuses", "after", "declines"],
    `wall results left declaration order:\n${r.stdout}`,
  );
  for (const line of lines) {
    const timing = line.match(TIMING);
    assert.ok(timing, `wall result has no advisory timing: ${line}`);
    assert.ok(
      Number.isFinite(Number(timing[1])),
      `timing is not numeric: ${line}`,
    );
  }
});

test("2. timing leaves every board answer and the exit unchanged", () => {
  const r = board();
  const withoutTiming = r.stdout
    .trim()
    .split(/\r?\n/)
    .map((line) => line.replace(TIMING, ""));
  assert.deepEqual(withoutTiming, [
    "ok   counted (2 passing)",
    "FAIL refuses  fix: read the refusal",
    "  refused on purpose",
    "ok   after",
    "  reached after the failure",
    "n/a  declines",
    "  this question is not mine",
    "red: 4 wall(s), 1 failing, 0 waived, 1 not applicable",
  ]);
  assert.equal(r.status, 1, "timing changed the failing board's exit answer");
});

const job = (text, name) =>
  text.match(
    new RegExp(`^  ${name}:\\n([\\s\\S]*?)(?=^  \\S|(?![\\s\\S]))`, "m"),
  )?.[1];
const jobs = (text) =>
  [...text.slice(text.indexOf("\njobs:")).matchAll(/^  ([a-z0-9-]+):$/gm)].map(
    (match) => match[1],
  );

test("3. Linux and Windows each keep a mandatory board job", () => {
  const ci = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
  const boardJobs = jobs(ci)
    .map((name) => [name, job(ci, name)])
    .filter(([, body]) => /^\s*- run: npm test\s*$/m.test(body ?? ""));
  assert.ok(boardJobs.length > 0, "the workflow has no board jobs");
  for (const platform of ["ubuntu-latest", "windows-latest"])
    assert.ok(
      boardJobs.some(([, body]) =>
        new RegExp(`^\\s*runs-on: ${platform}$`, "m").test(body),
      ),
      `no npm test job remains on ${platform}`,
    );
});
