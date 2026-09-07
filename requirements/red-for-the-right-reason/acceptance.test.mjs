// Acceptance tests for requirement red-for-the-right-reason. One per
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
  "2026-09-06-analyse-twenty-second-use.md",
  "2026-09-06-analyse-twenty-third-use.md",
  "2026-09-06-analyse-twenty-fourth-use.md",
  "2026-09-06-analyse-twenty-fifth-use.md",
  "2026-09-06-analyse-twenty-ninth-use.md",
  "2026-09-06-analyse-thirtieth-use.md",
];

test("1. a criterion about something not happening needs a test that could have failed", () => {
  const t = skill();
  assert.match(t, /something not happening/i);
  assert.match(t, /could have happened/i);
  assert.match(t, /coincidence/i);
});

test("2. the red run is written from the run, and a green test is named with its reason", () => {
  const t = skill();
  assert.match(t, /from the run, never from the plan/i);
  assert.match(t, /green before the build/i);
  assert.match(t, /the reason it is green/i);
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
