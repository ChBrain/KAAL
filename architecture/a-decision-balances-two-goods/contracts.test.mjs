// Contract tests for the drawing a-decision-balances-two-goods. One per seam.
// Each drives one side and reads the other: the skill's text as an architect
// meets it, the template as a drawing copies it, and the wall as it judges a
// drawing written before the shape grew. Prose is compared with whitespace
// folded, because the formatter wraps where it likes.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKILL = join(ROOT, "skills", "architect");
const fold = (s) => s.replace(/\s+/g, " ");
const skill = () => readFileSync(join(SKILL, "SKILL.md"), "utf8");
const bullet = () => {
  const m = skill().match(/^- \*\*Decisions\.\*\*[\s\S]*?(?=^- \*\*|^## )/m);
  assert.ok(m, "the skill has no Decisions bullet");
  return m[0];
};

test("1. what a record must say, and where", () => {
  const b = fold(bullet());
  // The two goods, in the asker's words, said to pull apart.
  assert.match(b, /shortest path to value/i);
  assert.match(b, /choices open/i);
  assert.match(
    b,
    /(usually|often)[^.]*(tension|contrast|pull)|( tension|contrast|pull)[^.]*(usually|often)/i,
  );
  // What the record names.
  assert.match(b, /bought|buys/i);
  assert.match(b, /spen[dt]|cost/i);
  assert.match(b, /costs? nothing|spends? nothing|neither side/i);
  // The check, and what it is checked against.
  assert.match(b, /foreclos/i);
  const said = fold(bullet())
    .split(/(?<=\.)\s+/)
    .filter((x) => /foreclos/i.test(x))
    .join(" ");
  assert.match(
    said,
    /task|value|deliver/i,
    `the foreclosed side is checked against nothing: ${said}`,
  );
  // The order is a promise: what a decision is comes before what it cost,
  // and the check comes after the price it is a check on.
  const at = (re) => b.search(re);
  assert.ok(
    at(/with no options was not a decision/i) < at(/shortest path to value/i),
    "the price arrives before the question of whether a choice existed",
  );
  assert.ok(
    at(/shortest path to value/i) < at(/foreclos/i),
    "the check arrives before the price it checks",
  );
  // And nowhere else: a rule repeated in two places drifts in one of them.
  const elsewhere = fold(skill().replace(bullet(), ""));
  assert.doesNotMatch(elsewhere, /shortest path to value/i);
});

test("2. the decision shape a drawing copies", () => {
  const t = readFileSync(join(SKILL, "references", "drawing.md"), "utf8");
  // The Decisions section alone: Fixed and free and the Handoff carry
  // labelled lines of their own, and reading the whole page counts those
  // too, which is a test red for a reason that is not the seam's.
  const m = t.match(/^## Decisions\n([\s\S]*?)(?=^## )/m);
  assert.ok(m, "the template has no Decisions section");
  const labels = [...m[1].matchAll(/^- ([A-Z][a-z]+(?: [a-z]+)*):/gm)].map(
    (x) => x[1],
  );
  assert.deepEqual(
    labels,
    ["Chosen", "Not taken", "Because", "Bought", "Reopens if"],
    "the decision shape is not the five labels in that order",
  );
});

test("3. a drawing with no price is still a drawing", () => {
  // A root of its own, because the league's own drawings move and a wall's
  // verdict on them is not a fixed thing to test against.
  const root = mkdtempSync(join(tmpdir(), "kaal-two-goods-"));
  try {
    mkdirSync(join(root, "architecture", "t"), { recursive: true });
    mkdirSync(join(root, "requirements", "t"), { recursive: true });
    writeFileSync(
      join(root, "requirements", "t", "requirement.md"),
      "# Requirement: t\n\n## Acceptance criteria\n\n1. It is so.\n",
    );
    // The four-line decision shape, as thirty-eight drawings in this tree
    // carry it and will go on carrying it.
    writeFileSync(
      join(root, "architecture", "t", "drawing.md"),
      [
        "# Drawing: t",
        "",
        "## Structure",
        "",
        "One part.",
        "",
        "## Seams",
        "",
        "```mermaid",
        "flowchart LR",
        '  A[one] -- "1 a promise" --> B[two]',
        "```",
        "",
        "1. a promise: in, a thing; out, a thing.",
        "",
        "## Fixed and free",
        "",
        "- Fixed: the promise",
        "- Free: the rest",
        "",
        "## Decisions",
        "",
        "### the one door",
        "",
        "- Chosen: this",
        "- Not taken: that",
        "- Because: it is so",
        "- Reopens if: it stops being so",
        "",
        "## Test strategy",
        "",
        "| criterion | layer    | kind          | why  |",
        "| --------- | -------- | ------------- | ---- |",
        "| 1         | contract | deterministic | it is|",
        "",
        "## Handoff",
        "",
        "- Task: t",
        "",
      ].join("\n"),
    );
    writeFileSync(
      join(root, "architecture", "t", "contracts.test.mjs"),
      'import { test } from "node:test";\ntest("1. a promise", () => {});\n',
    );
    const r = spawnSync(
      process.execPath,
      [join(ROOT, "bin", "kaal.mjs"), "drawings", root],
      { cwd: ROOT, encoding: "utf8" },
    );
    assert.equal(r.status, 0, `the wall spoke: ${r.stderr}${r.stdout}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
