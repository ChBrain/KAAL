// Contract tests for the drawing read-before-drawing. One per seam. Blind
// to the code: the architect skill's text, and the rules wall as a command.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const text = () =>
  readFileSync(join(ROOT, "skills", "architect", "SKILL.md"), "utf8");
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
const fold = (s) => s.replace(/\s+/g, " ");

test("1. section 1 to the drawing's start: the closed-requirements rule is read before drawing, not during", () => {
  const s1 = fold(section(text(), "Read the requirement"));
  assert.ok(s1, "no section 1");
  assert.match(s1, /closed requirements/i);
  assert.match(s1, /as constraints/i);
  assert.match(s1, /acceptance wall reads them/i);
  assert.doesNotMatch(
    fold(section(text(), "Draw the want")),
    /closed requirements/i,
  );
});

test("2. the two bullets to the drawer's lists: each fixed phrase in its bullet and in no other", () => {
  const s2 = section(text(), "Draw the want");
  const seams = bullet(s2, "Seams");
  const fixed = bullet(s2, "Fixed and free");
  assert.ok(seams && fixed, "a bullet is missing");
  assert.match(fold(seams), /several seats share/i);
  assert.match(fold(seams), /a seam for every reader/i);
  assert.match(fold(seams), /names the readers/i);
  assert.match(fold(fixed), /text change/i);
  assert.match(fold(fixed), /sentences' places/i);
  assert.match(fold(fixed), /fixed words are what the contract reads/i);
  const others = fold(s2.replace(seams, "").replace(fixed, ""));
  assert.doesNotMatch(
    others,
    /seam for every reader|sentences' places/i,
    "a sentence sits outside its bullet",
  );
  assert.doesNotMatch(
    fold(fixed),
    /every reader/i,
    "the readers sentence leaked into Fixed and free",
  );
  assert.doesNotMatch(
    fold(seams),
    /sentences' places/i,
    "the text-change sentence leaked into Seams",
  );
});

test("3. the skill's text to the rules wall: kaal check exits 0 on the league's skills", () => {
  const r = spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "check"],
    {
      cwd: ROOT,
      encoding: "utf8",
    },
  );
  assert.equal(r.status, 0, r.stderr);
});
