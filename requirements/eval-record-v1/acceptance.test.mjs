// Acceptance tests for requirement eval-record-v1. One per criterion. Surface
// only: the record contract document, the tool as a command on fixture
// roots, the workflow file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = join(HERE, "fixtures");
const FIELDS = [
  "model",
  "reader",
  "temperature",
  "date",
  "fixture",
  "ask_sha",
  "expect_sha",
  "skill_sha",
  "verdict",
];
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });

test("1. evals/README.md names every required field and both body sections", () => {
  const p = join(ROOT, "evals", "README.md");
  assert.ok(existsSync(p), "no evals/README.md");
  const t = readFileSync(p, "utf8");
  for (const f of FIELDS)
    assert.ok(new RegExp("`" + f + "`").test(t), `field ${f} not named`);
  assert.ok(
    /# Output/.test(t) && /# Reading/.test(t),
    "body sections not named",
  );
});

test("2. a record counts only with every required field", () => {
  const ok = kaal("ledger", join(F, "complete"));
  assert.equal(ok.status, 0, ok.stderr);
  const bad = kaal("ledger", join(F, "missing-field"));
  assert.equal(bad.status, 1, "records missing temperature were counted");
});

test("3. freshness covers the fixture: a stale ask_sha counts for nothing", () => {
  const r = kaal("ledger", join(F, "stale-fixture"));
  assert.equal(r.status, 1, "records with a stale ask_sha were counted");
});

test("4. the evals workflow writes every required field and both sections", () => {
  const dir = join(ROOT, ".github", "workflows");
  const w = readdirSync(dir)
    .map((f) => readFileSync(join(dir, f), "utf8"))
    .find((t) => /startsWith\([^)]*['"]\/eval/.test(t));
  assert.ok(w, "no evals workflow");
  for (const f of FIELDS)
    assert.ok(new RegExp(f + ":").test(w), `workflow does not write ${f}`);
  assert.ok(
    /# Output/.test(w) && /# Reading/.test(w),
    "workflow does not write both sections",
  );
});
