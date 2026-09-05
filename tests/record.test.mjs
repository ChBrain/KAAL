import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FIELDS,
  SETUPS,
  readRecord,
  isFresh,
  whyStale,
  freshModels,
} from "../bin/lib/record.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RQ = join(ROOT, "requirements", "eval-record-v1", "fixtures");
const AR = join(ROOT, "architecture", "eval-record-v1", "fixtures");

test("the ten fields, and the document names every one of them", () => {
  assert.deepEqual(FIELDS, [
    "model",
    "reader",
    "temperature",
    "date",
    "fixture",
    "ask_sha",
    "expect_sha",
    "skill_sha",
    "setup",
    "verdict",
  ]);
  const doc = readFileSync(join(ROOT, "evals", "README.md"), "utf8");
  for (const f of FIELDS)
    assert.ok(doc.includes("`" + f + "`"), `README does not name ${f}`);
});

test("readRecord returns the fields when complete, or the first missing or invalid field", () => {
  const good = readRecord(join(RQ, "complete", "evals", "x", "f", "alpha.md"));
  assert.equal(good.missing, null);
  assert.equal(good.data.model, "alpha");
  const bad = readRecord(
    join(RQ, "missing-field", "evals", "x", "f", "alpha.md"),
  );
  assert.equal(bad.missing, "temperature");
});

test("setup is one of four words; absent or off the list is the missing field", () => {
  assert.deepEqual(SETUPS, ["chat", "system", "workspace", "workflow"]);
  const NS = join(
    ROOT,
    "requirements",
    "honest-records",
    "fixtures",
    "no-setup",
    "evals",
    "good",
    "f",
    "alpha.md",
  );
  assert.equal(readRecord(NS).missing, "setup");
  const doc = readFileSync(join(ROOT, "evals", "README.md"), "utf8");
  for (const v of SETUPS)
    assert.ok(doc.includes("`" + v + "`"), `README does not name ${v}`);
});

test("whyStale names the file that moved, skill before ask before expect, or null", () => {
  const c = join(RQ, "complete");
  assert.equal(
    whyStale(readRecord(join(c, "evals", "x", "f", "alpha.md")).data, c, "x"),
    null,
  );
  const e = join(AR, "stale-expect");
  assert.equal(
    whyStale(readRecord(join(e, "evals", "x", "f", "alpha.md")).data, e, "x"),
    "expect moved",
  );
  const s = join(
    ROOT,
    "architecture",
    "honest-records",
    "fixtures",
    "stale-standing",
  );
  assert.equal(
    whyStale(readRecord(join(s, "evals", "x", "f", "alpha.md")).data, s, "x"),
    "skill moved",
  );
});

test("isFresh compares all three shas against the current files", () => {
  const c = join(RQ, "complete");
  assert.equal(
    isFresh(readRecord(join(c, "evals", "x", "f", "alpha.md")).data, c, "x"),
    true,
  );
  const s = join(RQ, "stale-fixture");
  assert.equal(
    isFresh(readRecord(join(s, "evals", "x", "f", "alpha.md")).data, s, "x"),
    false,
  );
  const e = join(AR, "stale-expect");
  assert.equal(
    isFresh(readRecord(join(e, "evals", "x", "f", "alpha.md")).data, e, "x"),
    false,
  );
});

test("freshModels counts distinct models that are complete, pass and fresh, and names the reasons it dropped", () => {
  const r = freshModels(join(RQ, "complete"), "evals/x/f", "x");
  assert.deepEqual([...r.models].sort(), ["alpha", "beta"]);
  const m = freshModels(join(RQ, "missing-field"), "evals/x/f", "x");
  assert.equal(m.models.size, 0);
  assert.ok(
    m.reasons.some((x) => /temperature/.test(x)),
    "the missing field is not in the reasons",
  );
  const s = freshModels(
    join(ROOT, "architecture", "honest-records", "fixtures", "stale-standing"),
    "evals/x/f",
    "x",
  );
  assert.deepEqual(s.stale, [{ file: "alpha.md", why: "skill moved" }]);
  assert.deepEqual(s.reasons, ["alpha.md is stale (skill moved)"]);
});
