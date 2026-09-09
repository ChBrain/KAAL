import { test } from "node:test";
import assert from "node:assert/strict";
test("1. it holds", () => {
  assert.equal(1, 2, "it does not");
});
