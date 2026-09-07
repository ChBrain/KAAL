// Acceptance tests for requirement a-decision-balances-two-goods. One per
// criterion. Surface only: the architect skill's text and its drawing
// template. Prose is compared with whitespace folded, because the formatter
// wraps where it likes and a line break is not a change of meaning.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKILL = join(ROOT, "skills", "architect");
const fold = (s) => s.replace(/\s+/g, " ");
const text = () => fold(readFileSync(join(SKILL, "SKILL.md"), "utf8"));
const template = () =>
  fold(readFileSync(join(SKILL, "references", "drawing.md"), "utf8"));
// The guidance for one section of the drawing, so a sentence about decisions
// is read where decisions are described and not anywhere it happens to fall.
const decisions = () => {
  const t = readFileSync(join(SKILL, "SKILL.md"), "utf8");
  const m = t.match(/^- \*\*Decisions\.\*\*[\s\S]*?(?=^- \*\*|^## )/m);
  assert.ok(m, "the skill has no Decisions bullet in the drawing's sections");
  return fold(m[0]);
};

test("1. the two goods are named where decisions are described, and said to pull apart", () => {
  const d = decisions();
  assert.match(d, /shortest path to value/i, "the first good is not named");
  assert.match(d, /choices open/i, "the second good is not named");
  assert.match(
    d,
    /usually|often/i,
    "nothing says the two are usually in tension",
  );
  assert.match(d, /tension|contrast|pull/i, "nothing says they pull apart");
});

test("2. a record names which good it bought and what it spent on the other", () => {
  const d = decisions();
  assert.match(
    d,
    /bought|buys/i,
    "the record is not told to name what it bought",
  );
  assert.match(
    d,
    /spen[dt]|cost|price/i,
    "the record is not told to name the price",
  );
  // The other half of the rule: when nothing is spent there was no decision,
  // which the skill already says about options and not about price.
  assert.match(
    d,
    /costs? nothing|spends? nothing|neither side/i,
    "nothing says a choice that costs nothing on either side is not a decision",
  );
});

test("3. the foreclosed side is checked against what the task is for", () => {
  const t = text();
  assert.match(t, /foreclos/i, "nothing tells the architect what to check");
  // Read the sentences that talk about foreclosing rather than the whole
  // page: a rule and its reason have to sit together or a reader meets one
  // without the other.
  const said = t
    .split(/(?<=\.)\s+/)
    .filter((x) => /foreclos/i.test(x))
    .join(" ");
  assert.match(
    said,
    /task|value|deliver|was for|exists/i,
    `nothing checks the foreclosed side against what the task is for: ${said}`,
  );
});

test("4. the template's decision shape carries a line for the price", () => {
  const t = template();
  // The template's decision shape is the four labelled lines; a fifth joins
  // them, so a record written to the template without a price is short by
  // one line rather than complete.
  for (const label of ["Chosen:", "Not taken:", "Because:", "Reopens if:"])
    assert.ok(t.includes(label), `the template lost ${label}`);
  assert.match(
    t,
    /- (Bought|Buys|Price|Spent|Costs):/i,
    "the template's decision shape has no line for the price",
  );
});
