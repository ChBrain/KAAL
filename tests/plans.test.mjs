// Units for the plans wall. Below the seams: these know how the module reads
// a page and a config, which is what a unit is for, and the contract tests
// beside the drawing know none of it.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  checkPlans,
  countOf,
  globsOf,
  planPages,
  suitesUnder,
  testGates,
  wallOf,
  writeCounts,
} from "../bin/lib/plans.mjs";

const scratch = () => mkdtempSync(join(tmpdir(), "kaal-plans-"));
const gate = (name, command) => ({ name, command, fix: "fix it" });
const config = (root, gates) =>
  writeFileSync(join(root, "kaal.config.json"), JSON.stringify({ gates }));
const planPage = (root, name, text) => {
  mkdirSync(join(root, "tests", "plans"), { recursive: true });
  writeFileSync(join(root, "tests", "plans", `${name}.md`), text);
};
const messages = (root) =>
  checkPlans(root).map((f) => `${f.artefact}: ${f.kind}: ${f.message}`);

test("a wall's name is read as a field or as a word in a sentence", () => {
  assert.equal(wallOf("- Wall: acceptance\n"), "acceptance");
  assert.equal(
    wallOf("A fixture. Wall: `contracts`. Suites live at x.\n"),
    "contracts",
  );
  // A heading is not a declaration: the colon is what makes it one.
  assert.equal(wallOf("## Wall\n\nIt is about testing.\n"), null);
  assert.equal(wallOf("nothing here\n"), null);
});

test("globs are read from backticks and sorted, and bare paths are prose", () => {
  const t =
    "Suites live under `tests/*.test.mjs` and `skills/*/scripts/*.test.mjs`.";
  assert.deepEqual(globsOf(t), [
    "skills/*/scripts/*.test.mjs",
    "tests/*.test.mjs",
  ]);
  // A path a sentence happens to contain is not a claim about where suites
  // live, and a glob with no star is a file rather than a place.
  assert.deepEqual(globsOf("Suites live under tests/*.test.mjs."), []);
  assert.deepEqual(globsOf("See `tests/one.test.mjs`."), []);
});

test("a count is a number before the word suite, and absent where none is stated", () => {
  assert.equal(countOf("that matches 58 suites."), 58);
  assert.equal(countOf("that matches 1 suite."), 1);
  assert.equal(countOf("that matches 0 suites."), 0);
  assert.equal(countOf("A case is a numbered test."), null);
});

test("a gate owes a plan when it names a file ending in .test.mjs, and its globs are those files", () => {
  const root = scratch();
  try {
    config(root, [
      gate(
        "acceptance",
        "node bin/kaal.mjs acceptance requirements/*/acceptance.test.mjs",
      ),
      gate("units", "node --test tests/*.test.mjs skills/*/scripts/*.test.mjs"),
      gate("format", "npx prettier --check ."),
      gate("traces", "node bin/kaal.mjs traces"),
    ]);
    const gates = testGates(root);
    assert.deepEqual(
      gates.map((g) => g.name),
      ["acceptance", "units"],
      "a gate that names no test file owes a plan",
    );
    // Sorted, so a plan's list and a gate's compare whatever order either
    // was written in.
    assert.deepEqual(gates[1].globs, [
      "skills/*/scripts/*.test.mjs",
      "tests/*.test.mjs",
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a tree with no config and a config that is not JSON both answer no gates", () => {
  const root = scratch();
  try {
    assert.deepEqual(testGates(root), []);
    writeFileSync(join(root, "kaal.config.json"), "{ not json");
    assert.deepEqual(
      testGates(root),
      [],
      "a broken config threw instead of answering",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("each finding stops its page, so one plan never reports twice", () => {
  const root = scratch();
  try {
    config(root, [
      gate("acceptance", "kaal acceptance requirements/*/acceptance.test.mjs"),
    ]);
    // Wrong wall and wrong globs and a wrong count, all at once: the wall it
    // names is the first thing a reader has to fix, and the rest are about
    // a wall that does not exist.
    planPage(
      root,
      "acceptance",
      "Wall: `nonesuch`. Suites under `tests/*.test.mjs`, matching 9 suites.\n",
    );
    const found = messages(root);
    assert.equal(
      found.filter((m) => m.startsWith("acceptance: plan:")).length,
      1,
      found.join(" | "),
    );
    assert.match(found.join(" "), /nonesuch/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("suitesUnder counts from the root it is given and not from the working directory", () => {
  const root = scratch();
  try {
    mkdirSync(join(root, "tests"));
    for (const n of ["a", "b"])
      writeFileSync(join(root, "tests", `${n}.test.mjs`), "");
    assert.equal(suitesUnder(root, ["tests/*.test.mjs"]), 2);
    assert.equal(suitesUnder(root, ["nowhere/*.test.mjs"]), 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("writeCounts rewrites a stated number and leaves a page it cannot judge alone", () => {
  const root = scratch();
  try {
    config(root, [gate("units", "node --test tests/*.test.mjs")]);
    mkdirSync(join(root, "tests"), { recursive: true });
    writeFileSync(join(root, "tests", "a.test.mjs"), "");
    planPage(
      root,
      "units",
      "- Wall: units\n\nUnder `tests/*.test.mjs`, matching 9 suites.\n",
    );
    // A plan about a wall the board does not hold: writing a number into it
    // would hide the finding that says it is about the wrong thing.
    planPage(
      root,
      "stray",
      "- Wall: nonesuch\n\nUnder `tests/*.test.mjs`, matching 9 suites.\n",
    );
    assert.deepEqual(writeCounts(root), ["units"]);
    const pages = Object.fromEntries(
      planPages(root).map((p) => [p.name, p.text]),
    );
    assert.match(pages.units, /matching 1 suite/);
    assert.match(pages.stray, /matching 9 suites/);
    // And it settles: a second run writes nothing.
    assert.deepEqual(writeCounts(root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("both directions are reported, and neither in the other's words", () => {
  const root = scratch();
  try {
    config(root, [
      gate("acceptance", "kaal acceptance requirements/*/acceptance.test.mjs"),
      gate("units", "node --test tests/*.test.mjs"),
    ]);
    planPage(
      root,
      "acceptance",
      "- Wall: acceptance\n\nUnder `requirements/*/acceptance.test.mjs`.\n",
    );
    planPage(root, "smoke", "- Wall: smoke\n\nUnder `tests/*.test.mjs`.\n");
    const found = messages(root);
    const plan = found.find((m) => m.startsWith("smoke: plan:"));
    const wall = found.find((m) => m.startsWith("units: wall:"));
    assert.ok(plan, `no finding names the plan: ${found.join(" | ")}`);
    assert.ok(wall, `no finding names the wall: ${found.join(" | ")}`);
    assert.notEqual(
      plan.replace(/smoke/g, ""),
      wall.replace(/units/g, ""),
      "the two directions are reported in the same words",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
