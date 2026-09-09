import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readPeople,
  requirementFor,
  judge,
  runAcceptance,
  expand,
} from "../bin/lib/acceptance.mjs";

const F = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "requirements",
  "status-v1",
  "fixtures",
);
const f = (n) => join(F, n, "acceptance.test.mjs");
const P = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "architecture",
  "a-task-names-its-people",
  "fixtures",
);

test("requirementFor: an acceptance test's sibling, a drawing's task under requirements/", () => {
  assert.equal(
    requirementFor(
      join(P, "people-none", "requirements", "t", "acceptance.test.mjs"),
    ),
    join(P, "people-none", "requirements", "t", "requirement.md"),
  );
  assert.equal(
    requirementFor(
      join(P, "people-none", "architecture", "t", "contracts.test.mjs"),
    ),
    join(
      P,
      "people-none",
      "architecture",
      "t",
      "..",
      "..",
      "requirements",
      "t",
      "requirement.md",
    ),
  );
});

test("readPeople reads the People line's value from the test's requirement, and null when absent", () => {
  assert.equal(
    readPeople(
      join(P, "people-none", "requirements", "t", "acceptance.test.mjs"),
    ),
    "none",
  );
  assert.equal(
    readPeople(
      join(P, "people-none", "architecture", "t", "contracts.test.mjs"),
    ),
    "none",
  );
  assert.equal(
    readPeople(
      join(P, "no-people", "requirements", "t", "acceptance.test.mjs"),
    ),
    null,
  );
  assert.equal(
    readPeople(join(P, "orphan", "architecture", "t", "contracts.test.mjs")),
    null,
  );
});

test("judge: no people line is a verdict of its own, and it comes first", () => {
  // The people question is presence and never meaning, and it outranks the
  // verdict: a Handoff that has not answered it has not been read yet.
  const green = { word: "delivered", ok: true };
  assert.match(judge(green, null).label, /^FAIL no people line/);
  assert.equal(judge(green, null).ok, false);
  assert.equal(judge(green, "none").ok, true);
  assert.equal(
    judge(
      { word: "not delivered", ok: true },
      "the data, its record, erased on request",
    ).ok,
    true,
  );
});

test("judge carries the verdict's own word into the label a reader sees", () => {
  for (const [word, ok, head] of [
    ["delivered", true, "ok"],
    ["not delivered", true, "ok"],
    ["regressed", false, "FAIL"],
    ["nothing ran", false, "FAIL"],
  ]) {
    const v = judge({ word, ok }, "none");
    assert.equal(v.ok, ok, `${word} was judged ${v.ok}`);
    assert.match(v.label, new RegExp(`^${head}`), `${word} reads ${v.label}`);
    // The word itself, not a paraphrase: the board's line is where a reader
    // learns which of the four this is.
    assert.ok(v.label.includes(word), `${word} is not in ${v.label}`);
  }
});
