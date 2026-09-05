// Acceptance tests for requirement analyse-v2. One per criterion. Surface
// only: the analyse skill's text, its template, its fixtures, and retros/.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKILL = join(ROOT, "skills", "analyse");
const text = () => readFileSync(join(SKILL, "SKILL.md"), "utf8");
const section = (t, title) => {
  const m = t.match(
    new RegExp(`^## [^\\n]*${title}[^\\n]*\\n([\\s\\S]*?)(?=^## |\\s*$)`, "m"),
  );
  return m ? m[1] : "";
};
const RETROS = [
  "2026-09-04-analyse-first-use.md",
  "2026-09-04-analyse-second-use.md",
  "2026-09-04-analyse-third-use.md",
  "2026-09-04-analyse-fourth-use.md",
  "2026-09-04-analyse-fifth-use.md",
  "2026-09-04-analyse-sixth-use.md",
  "2026-09-04-analyse-seventh-use.md",
  "2026-09-04-analyse-eighth-use.md",
  "2026-09-04-analyse-ninth-use.md",
  "2026-09-05-analyse-tenth-use.md",
];

test("1. the template's Handoff carries Status, Blocked on, Supersedes; the skill says the analyst owns both ends of the status", () => {
  const tpl = readFileSync(join(SKILL, "references", "requirement.md"), "utf8");
  for (const line of ["Status:", "Blocked on:", "Supersedes:"])
    assert.ok(tpl.includes(line), `template lacks ${line}`);
  const h = section(text(), "Hand off");
  assert.match(h, /open at handoff/i);
  assert.match(h, /closed when/i);
});

test("2. the proof rules say a test that iterates asserts the count first", () => {
  const p = section(text(), "Write the proof");
  assert.match(p, /iterat/i);
  assert.match(p, /nothing|empty/i);
  assert.match(p, /assert/i);
});

test("3. the red-run rule names a timeout and keeps the league's own tree out of the run", () => {
  const p = section(text(), "Write the proof");
  assert.match(p, /timeout/i);
  assert.match(p, /fixture root/i);
  assert.match(p, /KAAL_GATES|runner's marker/);
});

test("4. the red-run rule admits a partial red: already met, and needs a person", () => {
  const p = section(text(), "Write the proof");
  assert.match(p, /already met/i);
  assert.match(p, /person/i);
});

test("5. the vacuous-loop fixture exists with an ask and an expectation on the count", () => {
  const f = join(SKILL, "fixtures", "vacuous-loop");
  assert.ok(existsSync(join(f, "ask.md")), "no ask.md");
  assert.ok(existsSync(join(f, "expect.md")), "no expect.md");
  assert.match(
    readFileSync(join(f, "expect.md"), "utf8"),
    /count|non-empty|at least one/i,
  );
});

test("6. the ten retros are archived and none remains in retros/", () => {
  assert.equal(RETROS.length, 10);
  for (const r of RETROS) {
    assert.ok(
      existsSync(join(ROOT, "retros", "archive", r)),
      `${r} not archived`,
    );
    assert.ok(!existsSync(join(ROOT, "retros", r)), `${r} still in retros/`);
  }
});
