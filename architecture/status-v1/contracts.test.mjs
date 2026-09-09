// Contract tests for the drawing status-v1. One per seam. Blind to the code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = join(ROOT, "requirements", "status-v1", "fixtures");
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });

test("1. record to command: the record decides the verdict, and its absence is not a failure", () => {
  // Superseded by `a-task-is-delivered-by-its-run`. The seam was between a
  // requirement's status line and the command's verdict; it is between the
  // run on record and the verdict now, and the promise is the same one in
  // both halves: a red that matters is told from a red that does not, and
  // the command says which.
  const R = join(
    ROOT,
    "requirements",
    "a-task-is-delivered-by-its-run",
    "fixtures",
  );
  const suite = (n) =>
    join(R, n, "requirements", "alpha", "acceptance.test.mjs");
  const r = kaal(
    "acceptance",
    suite("regressed"),
    suite("not-delivered"),
    suite("delivered"),
  );
  // One of the three is a regression, so the run refuses, and the other two
  // are answers rather than failures.
  assert.equal(r.status, 1, r.stdout + r.stderr);
  const lines = r.stdout.split("\n");
  assert.equal(
    lines.filter((l) => /^FAIL/.test(l)).length,
    1,
    `expected one refusal: ${r.stdout}`,
  );
  assert.match(r.stdout, /^FAIL\s+regressed/m, r.stdout);
  assert.match(r.stdout, /^ok\s+not delivered/m, r.stdout);
  assert.match(r.stdout, /^ok\s+delivered/m, r.stdout);
  // And the absence of a record is not a failure, which is the half that
  // changed: an unproved task is work in progress, and the old field made it
  // a failure only when somebody had written `closed` on the page.
  const alone = kaal("acceptance", suite("not-delivered"));
  assert.equal(alone.status, 0, `an unproved task refused: ${alone.stdout}`);
});

test("2. test file to command: pass and fail counts are read from the run and printed", () => {
  const r = kaal("acceptance", join(F, "open-red", "acceptance.test.mjs"));
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /1 passing/);
  assert.match(r.stdout, /1 failing/);
});
