// A suite that fails, on purpose and forever. It exists so the unit about a
// red wall staying red has a red wall of its own: that unit used to run
// `requirements/push-v1/acceptance.test.mjs`, which was red because nobody
// had delivered it, and the day somebody did the unit went green and proved
// nothing.
//
// It sits under `tests/fixtures/` and not beside the units, so the units
// wall's glob (`tests/*.test.mjs`, one level) never runs it and the suite
// wall never asks who names it.
import { test } from "node:test";
import assert from "node:assert/strict";

test("1. this suite is red, which is the whole of what it is for", () => {
  assert.equal("red", "green", "this failure is the fixture");
});
