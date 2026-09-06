// Acceptance test for requirement asks-when-not-told. One per criterion.
// Surface only: the fixture's checklist as a reader receives it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const EXPECT = join(
  ROOT,
  "skills",
  "analyse",
  "fixtures",
  "json-flag",
  "expect.md",
);

test("1. the checklist judges the place question, as an item like the rest", () => {
  const text = readFileSync(EXPECT, "utf8");
  const items = text.split(/^- /m).slice(1);
  assert.ok(items.length > 1, "no checklist items");
  // Folded, because the formatter wraps where it likes.
  const place = items
    .map((i) => i.replace(/\s+/g, " "))
    .filter((i) => /asks which of the two places/i.test(i));
  assert.equal(place.length, 1, "no single item asking about the two places");
  assert.match(place[0], /names no place/i);
  assert.match(place[0], /before it begins/i);
  assert.match(place[0], /does not silently assume/i);
});
