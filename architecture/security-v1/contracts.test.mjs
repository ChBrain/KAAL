// Contract tests for the drawing security-v1. One per seam. Blind to the
// code: the tool as a command on fixture skill directories.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });

test("1. script to rule: a shell reach with no declaration is a named finding", () => {
  const r = kaal("check", join(HERE, "fixtures", "shell-reach"));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^x: reach:/m);
});

test("2. declaration to rule: a declared network reach passes", () => {
  const r = kaal("check", join(HERE, "fixtures", "declared-reach"));
  assert.equal(r.status, 0, r.stderr);
});
