// Contract tests for the drawing analyse-v3. One per seam. Blind to the
// code: the skill's text and its template.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("1. Goal rule to the goal: the sentence is inside the Goal bullet and names format, assumption or question, and the goal", () => {
  const s2 = section(text(), "Write the want");
  const g = bullet(s2, "Goal");
  assert.match(g, /format/i);
  assert.match(g, /assumption/i);
  assert.match(g, /open question/i);
  assert.match(g, /goal/i);
  const others = s2.replace(g, "");
  assert.doesNotMatch(
    others,
    /never in the goal|never belongs in the goal/i,
    "the sentence sits outside the Goal bullet",
  );
});

test("2. numbering rule to the tests: the same sentence in the skill and the template", () => {
  const b = bullet(
    section(text(), "Write the proof"),
    "One criterion, one test",
  );
  const m = b
    .replace(/\s+/g, " ")
    .match(/A test's name begins with its criterion's number[^.]*\./i);
  assert.ok(m, "no numbering sentence in the bullet");
  const tpl = readFileSync(join(SKILL, "references", "requirement.md"), "utf8");
  assert.ok(
    tpl.replace(/\s+/g, " ").includes(m[0].replace(/\s+/g, " ")),
    "the template does not carry the same sentence",
  );
});

test("3. red-run rule to the handoff: the words stand in the Seen red bullet", () => {
  const b = bullet(section(text(), "Write the proof"), "Seen red");
  assert.match(b, /"not yet recorded"/);
  assert.match(b, /is not a red\s+run/);
  assert.match(b, /not handed\s+off/);
});
