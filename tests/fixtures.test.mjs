import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { listFixtures, shapeOf } from "../bin/lib/fixtures.mjs";

const FX = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "requirements",
  "code-v2",
  "fixtures",
);

test("listFixtures finds the five shapes under any fixtures directory, sorted by slash paths", () => {
  const found = listFixtures(join(FX, "some"));
  assert.deepEqual(found.map((x) => x.shape).sort(), [
    "config",
    "drawing",
    "record",
    "requirement",
    "skill",
  ]);
  const paths = found.map((x) => x.path);
  assert.deepEqual(paths, [...paths].sort());
  for (const p of paths)
    assert.ok(!p.includes("\\") && p.includes("fixtures/"));
  assert.deepEqual(listFixtures(join(FX, "none")), []);
});

test("shapeOf reads a record by its verdict line and nothing else by content", () => {
  assert.equal(
    shapeOf(join(FX, "some", "evals", "fixtures", "e", "m.md")),
    "record",
  );
  assert.equal(shapeOf(join(FX, "none", "plain", "README.md")), null);
});
