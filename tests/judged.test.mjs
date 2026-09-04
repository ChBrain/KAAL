import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { statusForDrawing, runContracts } from "../bin/lib/acceptance.mjs";

const F = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "requirements",
  "status-v2",
  "fixtures",
);
const c = (n) => join(F, n, "architecture", "t", "contracts.test.mjs");

test("statusForDrawing reads the task's requirement two levels up, null when absent", () => {
  assert.equal(statusForDrawing(c("open-red")), "open");
  assert.equal(statusForDrawing(c("closed-red")), "closed");
  assert.equal(statusForDrawing(c("orphan")), null);
});

test("runContracts applies the four verdicts to drawings", () => {
  assert.equal(runContracts([c("open-red")]).ok, true);
  assert.equal(runContracts([c("closed-red")]).ok, false);
  assert.equal(runContracts([c("open-green")]).ok, true);
  assert.equal(runContracts([c("orphan")]).ok, false);
});
