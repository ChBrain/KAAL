// Acceptance tests for requirement a-green-contract-is-declared. One per
// criterion. Surface only: the architect skill's text, and the tree.
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
  "2026-09-06-architect-twenty-fourth-use.md",
  "2026-09-06-architect-twenty-sixth-use.md",
  "2026-09-06-architect-twenty-seventh-use.md",
  "2026-09-07-architect-twenty-ninth-use.md",
  "2026-09-07-architect-thirtieth-use.md",
];

test("1. a green contract is a kind, and it is named in the handoff", () => {
  const t = skill();
  assert.match(t, /green before the build/i);
  assert.match(t, /a guard on a reader or a rule that must not change/i);
  assert.match(t, /the reason it is green/i);
});

test("2. the closed tests are read, not only the closed criteria", () => {
  const t = skill();
  assert.match(t, /their tests as well as their criteria/i);
  assert.match(t, /fixes shapes no criterion states/i);
});

test("3. a contract never drives the runner that runs it", () => {
  const t = skill();
  assert.match(t, /never drive the runner that runs it/i);
  assert.match(t, /runs the contracts/i);
  assert.match(t, /prove the case on a fixture/i);
});

test("4. the five retros this task consumed are archived and gone from the stack", () => {
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
