// Contract tests for the drawing fixed-ground. One per seam. Blind to the
// code: the analyse skill's text, and the rules wall as a command.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const text = () =>
  readFileSync(join(ROOT, "skills", "analyse", "SKILL.md"), "utf8");
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

test("1. proof rules to the tests: the stand-in bullet and the fixed-ground bullet carry the fixed words, and nowhere else", () => {
  const s3 = section(text(), "Write the proof");
  const standIn = bullet(s3, "Seen green on a stand-in");
  assert.ok(standIn, "no stand-in bullet");
  assert.match(fold(standIn), /text criterion/i);
  assert.match(fold(standIn), /stand-in copy/i);
  const ground = bullet(s3, "On fixed ground");
  assert.ok(ground, "no On fixed ground bullet");
  assert.match(fold(ground), /fixture root/i);
  assert.match(fold(ground), /will move/i);
  const others = fold(s3.replace(standIn, "").replace(ground, ""));
  assert.doesNotMatch(
    others,
    /stand-in copy/i,
    "the stand-in sentence sits outside its bullet",
  );
  assert.doesNotMatch(
    others,
    /a state that a rerun/i,
    "the fixed-ground sentence sits outside its bullet",
  );
});

test("2. want rule to the criteria: the Acceptance criteria bullet carries the two fixed phrases, and no other bullet does", () => {
  const s2 = section(text(), "Write the want");
  const b = bullet(s2, "Acceptance criteria");
  assert.ok(b, "no Acceptance criteria bullet");
  assert.match(fold(b), /fixes that line's format/i);
  assert.match(fold(b), /before any code exists/i);
  assert.match(fold(b), /where a file the task creates lives is a criterion/i);
  const others = fold(s2.replace(b, ""));
  assert.doesNotMatch(
    others,
    /line's format|creates lives/i,
    "a sentence sits outside the criteria bullet",
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
