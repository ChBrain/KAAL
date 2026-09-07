// Acceptance tests for requirement a-drawing-fixes-more-than-structure.
// One per criterion. Surface only: the architect skill's text, and the tree.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const skill = () =>
  readFileSync(join(ROOT, "skills", "architect", "SKILL.md"), "utf8").replace(
    /\s+/g,
    " ",
  );
const MOVED = [
  "2026-09-06-architect-twenty-first-use.md",
  "2026-09-06-architect-twenty-second-use.md",
  "2026-09-06-architect-twenty-third-use.md",
  "2026-09-06-architect-twenty-fifth-use.md",
  "2026-09-07-architect-twenty-eighth-use.md",
];

test("1. a text drawing fixes the section, the order and the words", () => {
  const t = skill();
  assert.match(t, /when the change is text/i);
  assert.match(t, /the section each sentence lives in/i);
  assert.match(t, /its order among the sentences already there/i);
  assert.match(t, /the words the contract reads/i);
});

test("2. an order is a promise, held by where each phrase first appears", () => {
  const t = skill();
  assert.match(t, /an order is a promise/i);
  assert.match(t, /where each phrase first appears/i);
  assert.match(t, /what must not be disturbed/i);
});

test("3. the five retros this task consumed are archived and gone from the stack", () => {
  assert.equal(MOVED.length, 5);
  for (const f of MOVED) {
    assert.ok(
      existsSync(join(ROOT, "retros", "archive", f)),
      `${f} is not archived`,
    );
    assert.ok(
      !existsSync(join(ROOT, "retros", f)),
      `${f} is still in the stack`,
    );
  }
});
