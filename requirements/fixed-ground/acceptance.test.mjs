// Acceptance tests for requirement fixed-ground. One per criterion. Surface
// only: the analyse skill's text and retros/.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
const RETROS = [
  "2026-09-05-analyse-eleventh-use.md",
  "2026-09-05-analyse-twelfth-use.md",
  "2026-09-05-analyse-thirteenth-use.md",
  "2026-09-05-analyse-fourteenth-use.md",
  "2026-09-05-analyse-fifteenth-use.md",
  "2026-09-05-analyse-seventeenth-use.md",
  "2026-09-05-analyse-eighteenth-use.md",
  "2026-09-05-analyse-nineteenth-use.md",
  "2026-09-05-analyse-twentieth-use.md",
  "2026-09-05-analyse-twenty-first-use.md",
];

test("1. the stand-in rule says a text criterion is proven on a stand-in copy of the file", () => {
  const b = bullet(
    section(text(), "Write the proof"),
    "Seen green on a stand-in",
  );
  assert.ok(b, "no stand-in bullet");
  assert.match(b, /text\s+criteri/i);
  assert.match(b, /stand-in\s+copy/i);
  assert.match(b, /needs\s+the\s+stand-in\s+most/i);
});

test("2. the criteria rule fixes a finding's or an output line's format in the requirement", () => {
  const b = bullet(section(text(), "Write the want"), "Acceptance criteria");
  assert.ok(b, "no Acceptance criteria bullet");
  assert.match(b, /finding|output\s+line/i);
  assert.match(b, /fixes\s+(that|the|its)\s+(line's\s+)?format/i);
  assert.match(b, /before\s+any\s+code/i);
});

test("3. a proof rule says a test reads a fixture root, never the league's tree for a state that will move", () => {
  const s = section(text(), "Write the proof");
  assert.ok(s, "no proof section");
  assert.match(s, /fixture\s+root/i);
  assert.match(
    s,
    /a\s+state\s+that\s+a\s+rerun\s+or\s+a\s+later\s+change\s+will\s+move/i,
  );
});

test("4. the criteria rule says where a file the task creates lives is a criterion", () => {
  const b = bullet(section(text(), "Write the want"), "Acceptance criteria");
  assert.ok(b, "no Acceptance criteria bullet");
  assert.match(
    b,
    /where\s+a\s+file\s+the\s+task\s+creates\s+lives\s+is\s+a\s+criterion/i,
  );
});

test("5. the ten retros are archived and none remains in retros/", () => {
  assert.equal(RETROS.length, 10);
  for (const r of RETROS) {
    assert.ok(
      existsSync(join(ROOT, "retros", "archive", r)),
      `${r} not archived`,
    );
    assert.ok(!existsSync(join(ROOT, "retros", r)), `${r} still in retros/`);
  }
});
