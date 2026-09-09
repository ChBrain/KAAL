// Contract tests for drawing an-architect-names-its-principles. One per
// seam, numbered to match. Seam 1 is driven with text alone and seam 2
// with two fixture roots, one where every citation resolves and one where
// nothing does. Fixture roots only: the league's own drawings carry no
// citations today and the first one that does must not move these numbers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
// The namespace, not the names. A named import of an export the module
// does not have yet fails the whole file to load, and both seams then
// share one red that says nothing about either.
import * as wall from "../../bin/lib/drawings.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
// The acceptance fixture, read rather than copied. A fixture duplicated is
// a fixture that drifts, and this one is the reason seam 2 has an order:
// it holds no requirements at all, so both its drawings are orphans.
const CITES_NOTHING = join(
  ROOT,
  "requirements",
  "an-architect-names-its-principles",
  "fixtures",
  "cites-nothing",
);
const RESOLVES = join(HERE, "fixtures", "resolves");

const cited = (text) => {
  assert.equal(
    typeof wall.citedPrinciples,
    "function",
    "no citedPrinciples export",
  );
  return wall.citedPrinciples(text);
};
const decisions = (...lines) =>
  `## Decisions\n\n${lines.join("\n")}\n\n## Test strategy\n`;
const rules = (root, task) =>
  wall
    .checkDrawing(root, task)
    .map((f) => f.rule)
    .sort();

test("1. the names a decision was weighed against, and the three ways of naming nothing", () => {
  // A comma separated pair, in the order written and without repeats.
  assert.deepEqual(
    cited(
      decisions(
        "- Weighed against: the-two-goods, a-principle-nobody-wrote",
        "- Weighed against: the-two-goods",
      ),
    ),
    ["the-two-goods", "a-principle-nobody-wrote"],
    "a pair, its order, or the repeat was not read as one list",
  );
  // The liberties a seat takes, because these are what `Feeds:` and
  // `Read:` already accept and a seat writes what it has seen.
  assert.deepEqual(
    cited(decisions("- Weighed against: `the-seat-owns-the-lens`.")),
    ["the-seat-owns-the-lens"],
    "backticks or a trailing period were read as part of the name",
  );
  // Nothing, three ways, each asserted on its own. An alternation passes
  // on a reader that handles one of them.
  assert.deepEqual(
    cited(decisions("- Weighed against: none")),
    [],
    "none was read as a principle",
  );
  assert.deepEqual(
    cited(decisions("- Weighed against: None")),
    [],
    "None was read as a principle",
  );
  assert.deepEqual(
    cited(decisions("- Weighed against:")),
    [],
    "an empty value was read as a principle",
  );
  assert.deepEqual(
    cited(decisions("- Chosen: this", "- Reopens if: never")),
    [],
    "a record with no line produced a name",
  );
  // Text in, names out. It is handed a page and never a root, so a reader
  // that needs the tree to answer has taken the wrong side of the seam.
  assert.equal(
    wall.citedPrinciples.length,
    1,
    "the reader takes a second argument",
  );
});

test("2. a name that resolves to no file is a finding, decided before the orphan return", () => {
  assert.ok(
    wall.RULES.includes("principles"),
    `the rule is not in RULES: ${wall.RULES.join(", ")}`,
  );
  // A drawing that is both an orphan and a dangling citation says both.
  // Below the return it would say only the first, and the acceptance
  // fixture is exactly that tree.
  assert.deepEqual(
    rules(CITES_NOTHING, "a-task"),
    ["orphan", "principles", "tests"],
    "an orphan drawing's citation was not read, or another rule fired",
  );
  const found = wall
    .checkDrawing(CITES_NOTHING, "a-task")
    .filter((f) => f.rule === "principles");
  assert.equal(found.length, 1, `expected one finding, got ${found.length}`);
  assert.equal(found[0].task, "a-task", "the finding does not name the task");
  assert.match(
    found[0].message,
    /a-principle-nobody-wrote/,
    `the name is not in the finding: ${found[0].message}`,
  );
  // Citation only, and only the one that fails. The name beside it
  // resolves, so it is not judged and it is not printed.
  assert.doesNotMatch(
    found[0].message,
    /the-two-goods/,
    `a name that resolves was reported: ${found[0].message}`,
  );
  // `none` names nothing. This drawing exists because the one above cites
  // two names and never reaches the answer the template offers.
  assert.deepEqual(
    rules(CITES_NOTHING, "says-none"),
    ["orphan", "tests"],
    "none was resolved as a principle",
  );
  // And the rule is silent as well as loud: a tree that is not an orphan,
  // whose citations resolve, yields nothing at all.
  assert.deepEqual(
    wall.checkDrawings(RESOLVES),
    [],
    "a drawing whose citations resolve was found",
  );
});
