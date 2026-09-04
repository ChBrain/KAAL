// Contract test for the drawing status-v2. One seam. Blind to the code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = join(ROOT, "requirements", "status-v2", "fixtures");
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });

test("1. drawing to task status: the directory names the task, the requirement gives the status, absence fails", () => {
  const c = (n) => join(F, n, "architecture", "t", "contracts.test.mjs");
  const r = kaal("contracts", c("open-red"), c("orphan"));
  assert.equal(r.status, 1);
  const line = (s) => r.stdout.split("\n").filter((l) => l.includes("t ("));
  assert.equal(line().length, 2, "one line per drawing");
  assert.ok(
    line().some((l) => /^open/.test(l)),
    "open-red not reported open",
  );
  assert.ok(
    line().some((l) => /^FAIL.*status/i.test(l)),
    "orphan not failed for missing status",
  );
});
