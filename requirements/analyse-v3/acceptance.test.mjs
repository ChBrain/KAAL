// Acceptance tests for requirement analyse-v3. One per criterion. Surface
// only: the analyse skill's text, its template, and retros/.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKILL = join(ROOT, "skills", "analyse");
const text = () => readFileSync(join(SKILL, "SKILL.md"), "utf8");
const section = (t, title) =>
  t.match(
    new RegExp(
      `^## [^\\n]*${title}[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`,
      "m",
    ),
  )?.[1] ?? "";
const bullet = (t, lead) =>
  t.match(
    new RegExp(
      `^- \\*\\*${lead}[^\\n]*\\n?[\\s\\S]*?(?=^- \\*\\*|(?![\\s\\S]))`,
      "m",
    ),
  )?.[0] ?? "";

test("1. the Goal rule names the format as a how that never belongs in the goal", () => {
  const g = bullet(section(text(), "Write the want"), "Goal");
  assert.ok(g, "no Goal bullet");
  assert.match(g, /format/i);
  assert.match(g, /assumption|open question/i);
  assert.match(
    g,
    /never in the goal|not in the goal|never belongs in the goal/i,
  );
});

test("2. the one-test rule and the template say a test's name begins with its criterion's number", () => {
  const b = bullet(
    section(text(), "Write the proof"),
    "One criterion, one test",
  );
  assert.ok(b, "no One criterion, one test bullet");
  assert.match(b, /begins\s+with\s+its\s+criterion's\s+number/i);
  const tpl = readFileSync(join(SKILL, "references", "requirement.md"), "utf8");
  assert.match(tpl, /begins\s+with\s+its\s+criterion's\s+number/i);
});

test("3. the red-run rule refuses a run that is not yet recorded", () => {
  const b = bullet(section(text(), "Write the proof"), "Seen red");
  assert.ok(b, "no Seen red bullet");
  assert.match(b, /not yet recorded/i);
  assert.match(b, /not a red\s+run/i);
  assert.match(b, /not handed\s+off/i);
});

test("4. the retro that found the gaps is archived", () => {
  const name = "2026-09-05-analyse-sixteenth-use.md";
  assert.ok(existsSync(join(ROOT, "retros", "archive", name)), "not archived");
  assert.ok(!existsSync(join(ROOT, "retros", name)), "still in retros/");
});
