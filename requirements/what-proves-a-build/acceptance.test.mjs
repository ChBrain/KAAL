// Acceptance tests for requirement what-proves-a-build. One per criterion.
// Surface only: the code skill's text, and the tree.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const skill = () =>
  readFileSync(join(ROOT, "skills", "code", "SKILL.md"), "utf8").replace(
    /\s+/g,
    " ",
  );
const MOVED = [
  ...[
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
  ].map((n) => `2026-09-06-code-twenty-${n}-use.md`),
  "2026-09-07-code-twenty-ninth-use.md",
  "2026-09-07-code-thirtieth-use.md",
  "2026-09-07-code-thirty-first-use.md",
];

test("1. a build with no source has no unit layer, and closes on the layers that exist", () => {
  const t = skill();
  assert.match(t, /text and not source/i);
  assert.match(t, /no unit layer/i);
  assert.match(t, /the layers that exist/i);
});

test("2. a text line's proof is its presence and its place, never its meaning", () => {
  const t = skill();
  assert.match(t, /its presence and its place/i);
  assert.match(t, /never its meaning/i);
});

test("3. a unit written after the code is trusted only once the code is broken", () => {
  const t = skill();
  assert.match(t, /has not been seen red/i);
  assert.match(t, /broken and watched to fail/i);
  assert.match(t, /came from the environment rather than the code/i);
});

test("4. the eleven retros this task consumed are archived and gone from the stack", () => {
  assert.equal(MOVED.length, 11);
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
