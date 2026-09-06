// Acceptance tests for requirement where-a-skill-acts. One per criterion.
// Surface only: the six skills' text.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// Folded, because the formatter wraps where it likes.
const text = (skill) =>
  readFileSync(join(ROOT, "skills", skill, "SKILL.md"), "utf8").replace(
    /\s+/g,
    " ",
  );
const WORKING = ["analyse", "architect", "code", "operate", "test"];

test("1. each working skill says which of the two places it acts in, and asks when it was not told", () => {
  assert.equal(WORKING.length, 5);
  for (const skill of WORKING) {
    const t = text(skill);
    assert.match(t, /repository that holds/i, skill);
    assert.match(t, /directory (you were|it was) pointed at/i, skill);
    assert.match(t, /the ask names which/i, skill);
    assert.match(t, /ask before you begin/i, skill);
  }
});

test("2. each working skill writes nothing into a directory it was pointed at", () => {
  for (const skill of WORKING) {
    const t = text(skill);
    assert.match(t, /you write nothing there/i, skill);
    assert.match(t, /ask where the work lands/i, skill);
  }
});

test("3. the retro skill files in the league either way, and names the kind of place", () => {
  const t = text("retro-4ls");
  assert.match(t, /filed in the league either way/i);
  assert.match(t, /application of the skill/i);
  assert.match(t, /not about the tree/i);
  assert.match(t, /never the tree/i);
});

test("4. the retro output format carries a Place line beside the Period line", () => {
  const raw = readFileSync(
    join(ROOT, "skills", "retro-4ls", "SKILL.md"),
    "utf8",
  );
  const block = raw.match(
    /^## Output format\n([\s\S]*?)(?=^## |(?![\s\S]))/m,
  )?.[1];
  assert.ok(block, "no output format section");
  assert.match(block, /^Period: /m);
  assert.match(block, /^Place: /m);
  assert.match(block, /pointed at/);
});
