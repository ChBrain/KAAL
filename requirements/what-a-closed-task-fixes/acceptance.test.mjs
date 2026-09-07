// Acceptance tests for requirement what-a-closed-task-fixes. One per
// criterion. Surface only: the analyse skill's text, and the retros tree.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// Folded, because the formatter wraps where it likes.
const skill = () =>
  readFileSync(join(ROOT, "skills", "analyse", "SKILL.md"), "utf8").replace(
    /\s+/g,
    " ",
  );
const ARCHIVED = [
  "2026-09-06-analyse-twenty-sixth-use.md",
  "2026-09-06-analyse-twenty-seventh-use.md",
  "2026-09-06-analyse-twenty-eighth-use.md",
  "2026-09-06-analyse-thirty-first-use.md",
  "2026-09-06-analyse-thirty-second-use.md",
  "2026-09-06-analyse-thirty-third-use.md",
];

test("1. the closed tests are read, not only the closed criteria", () => {
  const t = skill();
  assert.match(t, /their tests as well as their criteria/i);
  assert.match(t, /fixes shapes no criterion states/i);
});

test("2. a supersede names the task, the claim that moves, and the principle", () => {
  const t = skill();
  assert.match(t, /the exact claim that moves/i);
  assert.match(t, /the principle that permits it/i);
  assert.match(t, /pushes the other way/i);
  assert.match(t, /your criterion gives way/i);
});

test("3. the six retros this task consumed are archived and gone from the stack", () => {
  assert.equal(ARCHIVED.length, 6);
  for (const f of ARCHIVED) {
    assert.ok(
      existsSync(join(ROOT, "retros", "archive", f)),
      `${f} is not archived`,
    );
    assert.ok(
      !existsSync(join(ROOT, "retros", f)),
      `${f} still sits in the stack`,
    );
  }
});
