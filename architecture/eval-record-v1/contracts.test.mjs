// Contract tests for the drawing eval-record-v1. One per seam. Blind to the
// code: the tool as a command on fixture roots, the workflow as text.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const RQ = join(ROOT, "requirements", "eval-record-v1", "fixtures");
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });

test("1. record file to module: a missing field is named in the finding", () => {
  const r = kaal("ledger", join(RQ, "missing-field"));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /temperature/, "the missing field is not named");
});

test("2. module to ledger: stale on any of the three shas counts for nothing", () => {
  assert.equal(kaal("ledger", join(RQ, "complete")).status, 0);
  assert.equal(
    kaal("ledger", join(RQ, "stale-fixture")).status,
    1,
    "stale ask_sha counted",
  );
  assert.equal(
    kaal("ledger", join(HERE, "fixtures", "stale-expect")).status,
    1,
    "stale expect_sha counted",
  );
});

test("3. workflow to record file: the shas are computed, not typed", () => {
  const dir = join(ROOT, ".github", "workflows");
  const w = readdirSync(dir)
    .map((f) => readFileSync(join(dir, f), "utf8"))
    .find((t) => /startsWith\([^)]*['"]\/eval/.test(t));
  assert.ok(w, "no evals workflow");
  for (const f of ["ask_sha", "expect_sha", "skill_sha"])
    assert.match(w, new RegExp(f + ":\\s*\\$\\{"), `${f} is not computed`);
  assert.match(w, /reader:/);
  assert.match(w, /temperature:/);
});
