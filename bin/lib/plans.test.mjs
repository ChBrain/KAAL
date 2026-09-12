// Units for this module. The suite layer's readers, whose grammar edges no
// seam mentions and where a comma list read by hand goes wrong: a pin, a
// backtick, a word meaning none, a field that is not there at all. And the
// plans wall below its seams, which knows how the module reads a page and a
// config; that set lived in the tester's tree over this code until item 2 of
// `plan/0.0.2.md` brought it here.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import {
  checkPlans,
  countOf,
  globsOf,
  planPages,
  suitePages,
  suitesUnder,
  testGates,
  wallOf,
  writeCounts,
  owners,
  caseOwner,
  unnamed,
  planSuites,
  reach,
} from "./plans.mjs";

const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};
const scratch = (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-plans-u-"));
  try {
    put(root, files);
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
const suite = (cases) =>
  `---\ntraces:\n  parent: strategy\n  cases: ${cases}\n---\n\n# Test suite\n`;

test("suitePages reads a pin, a backtick and a comma list as the grammar does", () => {
  scratch(
    {
      "tests/suites/a.md": suite("x/one.test.mjs@" + "a".repeat(64)),
      "tests/suites/b.md": suite("`x/two.test.mjs`"),
      "tests/suites/c.md": suite("x/three.test.mjs, x/four.test.mjs"),
      // Both at once, which is the case that was wrong and was then removed
      // from this file rather than fixed. A closing backtick is no longer at
      // the end of the string once a pin follows it.
      "tests/suites/d.md": suite("`x/five.test.mjs`@" + "e".repeat(64)),
    },
    (root) => {
      const by = new Map(suitePages(root).map((s) => [s.name, s.cases]));
      assert.deepEqual(
        by.get("a"),
        ["x/one.test.mjs"],
        "a pin was not stripped",
      );
      assert.deepEqual(
        by.get("b"),
        ["x/two.test.mjs"],
        "a backtick was not stripped",
      );
      assert.deepEqual(
        by.get("c"),
        ["x/three.test.mjs", "x/four.test.mjs"],
        "a comma list was not split",
      );
      assert.deepEqual(
        by.get("d"),
        ["x/five.test.mjs"],
        "a backticked and pinned name kept its backtick",
      );
    },
  );
});

test("suitePages reads nothing, none and a missing field as no case", () => {
  scratch(
    {
      "tests/suites/a.md": suite("nothing"),
      "tests/suites/b.md": suite("None"),
      "tests/suites/c.md":
        "---\ntraces:\n  parent: strategy\n---\n\n# Test suite\n",
    },
    (root) => {
      for (const s of suitePages(root))
        assert.deepEqual(
          s.cases,
          [],
          `${s.name} read a case where there is none`,
        );
    },
  );
});

test("suitePages answers nothing where the place does not exist", () => {
  scratch({ "kaal/league.md": "# Scratch\n" }, (root) => {
    assert.deepEqual(suitePages(root), []);
  });
});

test("caseOwner reads an owns pattern with or without its stars", () => {
  const own = ["requirements/**", "bin/"];
  assert.equal(caseOwner("requirements/a/acceptance.test.mjs", own), null);
  assert.equal(caseOwner("bin/lib/a.test.mjs", own), null);
  assert.match(String(caseOwner("x/a.test.mjs", own)), /nothing owns it/);
  assert.match(String(caseOwner("x/a.test.mjs", [])), /nothing owns it/);
  assert.match(String(caseOwner("x/a.test.mjs")), /nothing owns it/);
});

test("caseOwner refuses tests/ before it asks who owns it", () => {
  // The tester owns `tests/**`, so asking ownership first answers that a case
  // there is fine, which is the opposite of the rule.
  assert.match(
    String(caseOwner("tests/a.test.mjs", ["tests/**"])),
    /points at cases and does not hold them/,
  );
});

test("unnamed answers each file once and sorted, whatever the separator", () => {
  scratch(
    {
      "x/one.test.mjs": "//\n",
      "x/deep/two.test.mjs": "//\n",
      "y/three.test.mjs": "//\n",
    },
    (root) => {
      const out = unnamed(root, new Set(["x/one.test.mjs", "x/one.test.mjs"]));
      assert.deepEqual(out, ["x/deep/two.test.mjs"]);
    },
  );
});

test("unnamed answers nothing where no case is named", () => {
  scratch({ "x/one.test.mjs": "//\n" }, (root) => {
    assert.deepEqual(unnamed(root, new Set()), []);
  });
});

test("planSuites answers no name and no finding for a plan carrying neither", () => {
  const r = planSuites(
    "---\ntraces:\n  parent: strategy\n---\n\n# Test plan\n",
  );
  assert.deepEqual(r.names, []);
  assert.deepEqual(r.findings, []);
});

test("reach counts only the suites a plan names that are there", () => {
  scratch(
    {
      "tests/plans/p.md":
        "---\ntraces:\n  parent: strategy\n  suites: a, gone\n---\n\n# Test plan: p\n\n- Wall: units\n",
      "tests/suites/a.md": suite("x/one.test.mjs, x/two.test.mjs"),
    },
    (root) => {
      assert.deepEqual(reach(root), [{ plan: "p", suites: 1, cases: 2 }]);
    },
  );
});

test("owners gathers a seat's owns and a lane's allows alike", () => {
  scratch(
    {
      "kaal.config.json": JSON.stringify({
        seats: [{ name: "analyst", owns: ["requirements/**"] }],
        lanes: [
          { pattern: "build/*", seat: "developer", allows: [] },
          { pattern: "skill/*", seat: null, allows: ["skills/**"] },
        ],
      }),
    },
    (root) => {
      assert.deepEqual(owners(root), ["requirements/**", "skills/**"]);
    },
  );
});

test("owners answers nothing where the config is missing or broken", () => {
  scratch({ "x.md": "#\n" }, (root) => assert.deepEqual(owners(root), []));
  scratch({ "kaal.config.json": "{ not json" }, (root) =>
    assert.deepEqual(owners(root), []),
  );
});

test("unnamed never asks for a file inside a fixtures directory", () => {
  scratch(
    {
      "x/one.test.mjs": "//\n",
      "x/fixtures/scratch/two.test.mjs": "//\n",
      "x/deep/fixtures/three.test.mjs": "//\n",
    },
    (root) => {
      assert.deepEqual(unnamed(root, new Set(["x/one.test.mjs"])), []);
    },
  );
});

test("checkPlans names the wall where two plans are about it, and neither plan", () => {
  scratch(
    {
      "kaal.config.json": JSON.stringify({
        gates: [{ name: "units", command: "node --test tests/*.test.mjs" }],
      }),
      "tests/plans/first.md":
        "---\ntraces:\n  parent: strategy\n---\n\n# Test plan: first\n\n- Wall: units\n",
      "tests/plans/second.md":
        "---\ntraces:\n  parent: strategy\n---\n\n# Test plan: second\n\n- Wall: units\n",
    },
    (root) => {
      // The pair is the fault, so the finding is of kind `wall` and carries
      // both page names in one sentence. A finding of kind `plan` here would
      // be an accusation against a page that is right on its own.
      const walls = checkPlans(root).filter((f) => f.kind === "wall");
      assert.equal(walls.length, 1);
      assert.equal(walls[0].artefact, "units");
      assert.match(walls[0].message, /\bfirst\b/);
      assert.match(walls[0].message, /\bsecond\b/);
      assert.deepEqual(
        checkPlans(root).filter((f) => f.kind === "plan"),
        [],
      );
    },
  );
});

const tmpTree = () => mkdtempSync(join(tmpdir(), "kaal-plans-"));
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
  const root = tmpTree();
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
  const root = tmpTree();
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
  const root = tmpTree();
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
  const root = tmpTree();
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
  const root = tmpTree();
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
  const root = tmpTree();
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
