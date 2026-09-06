// Acceptance tests for requirement read-before-drawing. One per criterion.
// Surface only: the architect skill's text, one fixture root through the
// tool as a command, and retros/.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
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
// A fenced block closes at a line of exactly its opening fence.
const blocks = (doc) =>
  [...doc.matchAll(/^(`{3,})[^\n]*\n([\s\S]*?)^\1[ \t]*$/gm)].map((m) => m[2]);
const RETROS = [
  "2026-09-05-architect-eleventh-use.md",
  "2026-09-05-architect-twelfth-use.md",
  "2026-09-05-architect-thirteenth-use.md",
  "2026-09-05-architect-fourteenth-use.md",
  "2026-09-05-architect-fifteenth-use.md",
  "2026-09-05-architect-sixteenth-use.md",
  "2026-09-05-architect-seventeenth-use.md",
  "2026-09-05-architect-eighteenth-use.md",
  "2026-09-05-architect-nineteenth-use.md",
  "2026-09-05-architect-twentieth-use.md",
];

test("1. section 1 says to read the closed requirements that touch the path as constraints before drawing", () => {
  const s = section(text(), "Read the requirement");
  assert.ok(s, "no section 1");
  assert.match(s, /closed\s+requirements/i);
  assert.match(s, /as\s+constraints/i);
  assert.match(s, /acceptance\s+wall\s+reads\s+them/i);
});

test("2. the Seams rule says a shared reader's change is a seam for every reader", () => {
  const b = bullet(section(text(), "Draw the want"), "Seams");
  assert.ok(b, "no Seams bullet");
  assert.match(b, /several\s+seats\s+share/i);
  assert.match(b, /a\s+seam\s+for\s+every\s+reader/i);
  assert.match(b, /names\s+the\s+readers/i);
});

test("3. the Fixed and free rule says a text change's parts are the sentences' places and its fixed words are what the contract reads", () => {
  const b = bullet(section(text(), "Draw the want"), "Fixed and free");
  assert.ok(b, "no Fixed and free bullet");
  assert.match(b, /text\s+change/i);
  assert.match(b, /sentences'\s+places/i);
  assert.match(b, /fixed\s+words\s+are\s+what\s+the\s+contract\s+reads/i);
});

test("4. the eval-runner tree fixture's skill carries a fence, and the runner still renders three blocks with the whole skill in the first", () => {
  const tree = join(ROOT, "architecture", "eval-runner", "fixtures", "tree");
  const skill = readFileSync(join(tree, "skills", "y", "SKILL.md"), "utf8");
  assert.match(skill, /^```/m, "the fixture skill carries no fence");
  const r = spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "runner", "y", "f"],
    {
      cwd: tree,
      encoding: "utf8",
    },
  );
  assert.equal(r.status, 0, r.stderr);
  const b = blocks(r.stdout);
  assert.equal(b.length, 3);
  assert.ok(
    b[0].includes(skill.trim()),
    "the first block lacks the whole skill",
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
