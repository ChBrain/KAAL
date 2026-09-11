// Units for the suite layer's readers. The contracts hold the seams; these
// hold the grammar edges a seam never mentions, which is where a comma list
// read by hand goes wrong: a pin, a backtick, a word meaning none, a field
// that is not there at all.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import {
  checkPlans,
  suitePages,
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
