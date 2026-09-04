import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { countRetros } from "../bin/lib/retros.mjs";

const F = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "architecture",
  "push-v1",
  "fixtures",
  "retros-root",
);

test("consumed and archived retros are not counted; a skill with none counts zero", () => {
  const c = Object.fromEntries(countRetros(F).map((r) => [r.skill, r.count]));
  assert.equal(c.a, 1);
  assert.equal(c.b, 0);
});

test("a root with no retros directory counts zero for every skill and does not throw", () => {
  const c = countRetros(join(F, "..", "rules"));
  assert.ok(Array.isArray(c));
  assert.ok(c.every((r) => r.count === 0));
});
