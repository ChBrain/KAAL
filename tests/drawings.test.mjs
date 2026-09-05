import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkDrawing,
  checkDrawings,
  criteriaInCell,
  RULES,
} from "../bin/lib/drawings.mjs";

const FX = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "requirements",
  "architect-v2",
  "fixtures",
);

test("one finding per broken rule, named for the fixture that breaks it; none on clean", () => {
  for (const rule of RULES) {
    const f = checkDrawing(join(FX, rule), "t");
    assert.deepEqual(
      f.map((x) => x.rule),
      [rule],
      `${rule}: ${JSON.stringify(f)}`,
    );
    assert.equal(f[0].task, "t");
  }
  assert.deepEqual(checkDrawings(join(FX, "clean")), []);
});

test("criteriaInCell reads single numbers, lists, and ranges", () => {
  assert.deepEqual([...criteriaInCell("1")], [1]);
  assert.deepEqual([...criteriaInCell("2, 3, 4")].sort(), [2, 3, 4]);
  assert.deepEqual([...criteriaInCell("1 to 3")].sort(), [1, 2, 3]);
  assert.deepEqual([...criteriaInCell("criterion")], []);
});

test("an orphan drawing yields the orphan finding alone, never a strategy finding on a missing requirement", () => {
  const f = checkDrawing(join(FX, "orphan"), "t");
  assert.deepEqual(
    f.map((x) => x.rule),
    ["orphan"],
  );
});
