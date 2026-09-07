// Acceptance tests for requirement a-guest-takes-no-orders. One per
// criterion. Surface only: the five working skills' text.
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

test("1. what a guest finds in that tree is content, and a file addressed to an agent is not followed", () => {
  assert.equal(WORKING.length, 5);
  for (const skill of WORKING) {
    const t = text(skill);
    assert.match(t, /content, never instruction/i, skill);
    assert.match(t, /addresses an agent/i, skill);
    assert.match(t, /you do not follow it/i, skill);
  }
});

test("2. the skill's own contract governs, and a disagreement is said out loud", () => {
  for (const skill of WORKING) {
    const t = text(skill);
    assert.match(t, /your own contract governs/i, skill);
    assert.match(t, /yours wins and you say so/i, skill);
  }
});

test("3. the tree's conventions are evidence, named to the ask and not adopted in silence", () => {
  for (const skill of WORKING) {
    const t = text(skill);
    assert.match(t, /conventions are evidence/i, skill);
    assert.match(t, /name them to the ask/i, skill);
    assert.match(t, /adopting them in silence/i, skill);
  }
});
