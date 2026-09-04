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

test("1. requirement to command: the status decides the verdict, and its absence is a failure", () => {
  const r = kaal(
    "acceptance",
    join(F, "closed-red", "acceptance.test.mjs"),
    join(F, "open-red", "acceptance.test.mjs"),
    join(F, "no-status", "acceptance.test.mjs"),
  );
  assert.equal(r.status, 1);
  const line = (n) => r.stdout.split("\n").find((l) => l.includes(n)) ?? "";
  assert.match(line("closed-red"), /^FAIL/);
  assert.match(line("open-red"), /^open/);
  assert.match(line("no-status"), /^FAIL.*status/i);
});

test("2. test file to command: pass and fail counts are read from the run and printed", () => {
  const r = kaal("acceptance", join(F, "open-red", "acceptance.test.mjs"));
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /1 passing/);
  assert.match(r.stdout, /1 failing/);
});
