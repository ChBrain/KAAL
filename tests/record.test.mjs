import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FIELDS,
  readRecord,
  isFresh,
  freshModels,
} from "../bin/lib/record.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RQ = join(ROOT, "requirements", "eval-record-v1", "fixtures");
const AR = join(ROOT, "architecture", "eval-record-v1", "fixtures");

test("the nine fields, and the document names every one of them", () => {
  assert.deepEqual(FIELDS, [
    "model",
    "reader",
    "temperature",
    "date",
    "fixture",
    "ask_sha",
    "expect_sha",
    "skill_sha",
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
});
