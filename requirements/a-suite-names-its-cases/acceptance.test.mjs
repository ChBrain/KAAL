// Acceptance tests for requirement a-suite-names-its-cases. One per
// criterion. Surface only: `tests/strategy.md` as a reader meets it, and
// `kaal traces <root>`, which is where this league already reports what a
// plan got wrong.
//
// Every case but the first builds its own tree. The league's own tests
// directory is the thing this task changes, so a case that read it would be
// reading the answer it is meant to be asking for.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  writeFileSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
  });
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;
const notUsage = (out) =>
  assert.doesNotMatch(out, /^usage: kaal/m, `no such command: ${out}`);
const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};

/**
 * A tree is a tree before it is a fixture: the trunk above the three is what
 * the shape check reads, and a scratch tree without one is red for a rule
 * this task is not about.
 */
const TRUNK = "---\ntraces:\n  parent: none\n---\n\n# Scratch\n\nA tree.\n";
const CONFIG = JSON.stringify(
  {
    gates: [
      {
        name: "acceptance",
        command:
          "node bin/kaal.mjs acceptance requirements/*/acceptance.test.mjs",
      },
    ],
    seats: [
      { name: "analyst", owns: ["requirements/**"] },
      { name: "developer", owns: ["bin/**"] },
      { name: "tester", owns: ["tests/**"] },
    ],
    // Four of this league's lanes carry no seat and one of them holds the
    // skills, so a lane's `allows` owns a path exactly as a seat's tree does.
    lanes: [
      { pattern: "build/*", seat: "developer", allows: [] },
      { pattern: "skill/*", seat: null, allows: ["skills/**"] },
    ],
    shared: [],
  },
  null,
  2,
);
const CASE =
  "import { test } from 'node:test';\ntest('1. it holds', () => {});\n";
/** A requirement, so the tree is one `kaal traces` has an answer about. */
const REQUIREMENT = (name) =>
  `---\ntraces:\n  supersedes: nothing\n---\n\n# Requirement: ${name}\n\n` +
  `## Acceptance criteria\n\n1. It holds.\n\n## Handoff\n\n- Task: ${name}\n- People: none\n`;
const STRATEGY =
  "---\ntraces:\n  parent: none\n---\n\n# Test strategy\n\nOne wall runs tests here.\n\n" +
  "## Root\n\n- Root because: it is the test tree's own root.\n";
/**
 * A plan and a suite as this task wants them: the edges are traces of their
 * own, comma lists like `principles:` and never `parent:`, which stays the
 * tree and is the one kind that holds a single name.
 */
const block = (key, names) =>
  names.length
    ? `${key}:\n${names.map((n) => `  ${n}: nothing`).join("\n")}\n`
    : `${key}:\n`;
const plan = (wall, suites) =>
  `---\ntraces:\n  parent: strategy\n${block("suites", suites)}---\n\n` +
  `# Test plan: ${wall}\n\n## Wall\n\n- Wall: ${wall}\n`;
const suite = (name, cases) =>
  `---\ntraces:\n  parent: strategy\n${block("cases", cases)}---\n\n` +
  `# Test suite: ${name}\n`;

const scratch = (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-suite-"));
  try {
    put(root, {
      "kaal/league.md": TRUNK,
      "kaal.config.json": CONFIG,
      "tests/strategy.md": STRATEGY,
      "requirements/alpha/requirement.md": REQUIREMENT("alpha"),
      ...files,
    });
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

/** A tree this task has nothing to say about: one plan, one suite, one case. */
const whole = (cases = ["requirements/alpha/acceptance.test.mjs"]) => ({
  "tests/plans/acceptance.md": plan("acceptance", ["alpha"]),
  "tests/suites/alpha.md": suite("alpha", cases),
  ...Object.fromEntries(cases.map((c) => [c, CASE])),
});

test("1. the strategy names the five kinds tests/ holds", () => {
  const text = readFileSync(join(ROOT, "tests", "strategy.md"), "utf8");
  assert.match(
    text,
    /\bfive\b/i,
    "the strategy never says how many kinds tests/ holds",
  );
  // The three that have a place are read by their place, because a bare word
  // is a word a sentence happens to contain: `re-runs` is not the runs.
  for (const place of ["tests/plans", "tests/suites", "tests/runs"])
    assert.ok(text.includes(place), `the strategy never names ${place}`);
  for (const word of [/\bstrateg/i, /\bbugs?\b/i])
    assert.match(text, word, `the strategy never names ${word}`);
});

test("2. a suite names its cases, and one naming none is a finding", () => {
  scratch(
    { ...whole(), "tests/suites/alpha.md": suite("alpha", []) },
    (root) => {
      const r = kaal("traces", root);
      notUsage(said(r));
      // Not `/case/i`: today an unknown kind answers `cases: no such kind`,
      // which carries the word and says nothing about the criterion.
      assert.match(
        said(r),
        /no case/i,
        `the finding never says the suite names no case: ${said(r)}`,
      );
      assert.match(said(r), /alpha/, "the finding never names the suite");
      assert.equal(r.status, 1, `a suite naming no case passed: ${said(r)}`);
    },
  );
  scratch(whole(), (root) => {
    const ok = kaal("traces", root);
    notUsage(said(ok));
    assert.equal(ok.status, 0, `a whole tree reported: ${said(ok)}`);
  });
});

test("3. a case under tests/ is a finding", () => {
  scratch(
    {
      ...whole(),
      "tests/suites/alpha.md": suite("alpha", ["tests/thing.test.mjs"]),
      "tests/thing.test.mjs": CASE,
    },
    (root) => {
      const r = kaal("traces", root);
      notUsage(said(r));
      assert.equal(r.status, 1, `a case under tests/ passed: ${said(r)}`);
      assert.match(
        said(r),
        /tests\/thing\.test\.mjs/,
        "the finding never names the path",
      );
      assert.match(
        said(r),
        /points at|does not hold|never held/i,
        "the finding never says why tests/ may not hold it",
      );
    },
  );
});

test("4. a case nothing owns is a finding, and a lane owns as a seat does", () => {
  scratch(
    {
      ...whole(),
      "tests/suites/alpha.md": suite("alpha", ["nowhere/thing.test.mjs"]),
      "nowhere/thing.test.mjs": CASE,
    },
    (root) => {
      const r = kaal("traces", root);
      notUsage(said(r));
      assert.equal(r.status, 1, `a case nobody owns passed: ${said(r)}`);
      assert.match(
        said(r),
        /nowhere\/thing\.test\.mjs/,
        "the finding never names the path",
      );
      assert.match(said(r), /own/i, "the finding never says nothing owns it");
    },
  );
  // The witness: a seatless lane's `allows` owns a path, so a case there is
  // no finding. Without this the rule reads as `a seat's tree` and the
  // league's own skills are the one thing the method cannot cover.
  scratch(
    {
      ...whole(),
      "tests/suites/alpha.md": suite("alpha", [
        "skills/analyse/scripts/count.test.mjs",
      ]),
      "skills/analyse/scripts/count.test.mjs": CASE,
    },
    (root) => {
      const r = kaal("traces", root);
      notUsage(said(r));
      assert.equal(
        r.status,
        0,
        `a case a seatless lane allows was refused: ${said(r)}`,
      );
    },
  );
});

test("5. a plan names suites and not a glob, and two plans may name one", () => {
  scratch(
    {
      ...whole(),
      "tests/plans/acceptance.md":
        plan("acceptance", ["alpha"]) +
        "\n## Suites\n\nIts suites live under `requirements/*/acceptance.test.mjs`.\n",
    },
    (root) => {
      const r = kaal("traces", root);
      notUsage(said(r));
      assert.match(
        said(r),
        /glob/i,
        `the finding never says what is wrong: ${said(r)}`,
      );
      assert.equal(r.status, 1, `a plan carrying a glob passed: ${said(r)}`);
    },
  );
  scratch(
    {
      ...whole(),
      "tests/plans/acceptance.md": plan("acceptance", ["alpha"]),
      "tests/plans/regression.md": plan("acceptance", ["alpha"]),
    },
    (root) => {
      const r = kaal("traces", root);
      notUsage(said(r));
      assert.equal(r.status, 0, `one suite in two plans reported: ${said(r)}`);
    },
  );
});

test("6. a named case that is not there, and a case no suite names, both report", () => {
  scratch(
    {
      "tests/plans/acceptance.md": plan("acceptance", ["alpha"]),
      "tests/suites/alpha.md": suite("alpha", [
        "requirements/alpha/acceptance.test.mjs",
      ]),
    },
    (root) => {
      const r = kaal("traces", root);
      notUsage(said(r));
      assert.equal(r.status, 1, `a case that is not there passed: ${said(r)}`);
      assert.match(
        said(r),
        /requirements\/alpha\/acceptance\.test\.mjs/,
        "the finding never names the case",
      );
    },
  );
  scratch(
    { ...whole(), "requirements/beta/acceptance.test.mjs": CASE },
    (root) => {
      const r = kaal("traces", root);
      notUsage(said(r));
      assert.equal(r.status, 1, `a case no suite names passed: ${said(r)}`);
      assert.match(
        said(r),
        /requirements\/beta\/acceptance\.test\.mjs/,
        "the finding never names the file no suite reaches",
      );
    },
  );
});

test("7. the board says how many suites and cases each plan reaches", () => {
  scratch(
    whole([
      "requirements/alpha/acceptance.test.mjs",
      "requirements/beta/acceptance.test.mjs",
    ]),
    (root) => {
      const r = kaal("traces", root);
      notUsage(said(r));
      assert.match(
        said(r),
        /1 suite[^\n]*2 case/i,
        `the counts are not on the line: ${said(r)}`,
      );
      assert.equal(r.status, 0, `a whole tree reported: ${said(r)}`);
    },
  );
});
