// Acceptance tests for requirement a-bug-names-where-it-can-be-fixed. One per
// criterion. Surface only: `kaal traces` and `kaal gates`, on scratch trees,
// because the league's own `tests/` is where this kind would live and a case
// reading it would be reading the answer it asks for.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kaal = (root, ...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
    cwd: root,
    env: { ...process.env, KAAL_BRANCH: "", KAAL_BASE: "" },
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

const TRUNK = "---\ntraces:\n  parent: none\n---\n\n# Scratch\n\nA tree.\n";
const STRATEGY =
  "---\ntraces:\n  parent: none\n---\n\n# Test strategy\n\nWalls run tests here.\n\n" +
  "## Root\n\n- Root because: it is the test tree's own root.\n";
const PASSES =
  "import { test } from 'node:test';\ntest('1. it holds', () => {});\n";
const FAILS =
  "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\n" +
  "test('1. it does not hold', () => assert.equal(1, 2));\n";
const REQUIREMENT = (n) =>
  `---\ntraces:\n  supersedes: nothing\n---\n\n# Requirement: ${n}\n\n` +
  `## Acceptance criteria\n\n1. It holds.\n\n## Handoff\n\n- Task: ${n}\n- People: none\n`;
/** A block of a kind, one entry to a line, which is how a long list is written. */
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

const ALPHA = "requirements/alpha/acceptance.test.mjs";
const BETA = "requirements/beta/acceptance.test.mjs";
// The gate names the engine by absolute path: a scratch root holds no `bin/`
// of its own, and what a gate runs is data the fixture writes. The glob is
// left relative so the shell expands it against the scratch root.
const ACCEPTANCE_GATE = {
  name: "acceptance",
  command: `node ${join(ROOT, "bin", "kaal.mjs")} acceptance requirements/*/acceptance.test.mjs`,
};
const CONFIG = (gates) =>
  JSON.stringify(
    {
      gates,
      seats: [
        { name: "analyst", owns: ["requirements/**"] },
        { name: "tester", owns: ["tests/**"] },
        { name: "developer", owns: ["bin/**"] },
      ],
      lanes: [
        { pattern: "requirement/*", seat: "analyst", allows: [] },
        { pattern: "test/*", seat: "tester", allows: [] },
        { pattern: "build/*", seat: "developer", allows: [] },
      ],
      shared: [],
    },
    null,
    2,
  );

const scratch = (files, fn, { gates = [ACCEPTANCE_GATE] } = {}) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-bugs-"));
  try {
    put(root, {
      "kaal/league.md": TRUNK,
      "kaal.config.json": CONFIG(gates),
      "tests/strategy.md": STRATEGY,
      ...files,
    });
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

/** A task: its requirement and its case, green or red. */
const task = (name, body) => ({
  [`requirements/${name}/requirement.md`]: REQUIREMENT(name),
  [`requirements/${name}/acceptance.test.mjs`]: body,
});
/** A tree with two tasks, one suite naming both, and a plan over them. */
const tree = ({ alpha = PASSES, beta = FAILS, bugs = {} } = {}) => ({
  ...task("alpha", alpha),
  ...task("beta", beta),
  "tests/suites/acceptance.md": suite("acceptance", [ALPHA, BETA]),
  "tests/plans/acceptance.md": plan("acceptance", ["acceptance"]),
  ...bugs,
});
/** A bug page: the four fields, minus any the caller drops. */
const bug = (fields = {}) => {
  const all = {
    Case: BETA,
    Wall: "acceptance",
    Seen: "2026-09-12",
    Lane: "build/*",
    ...fields,
  };
  const lines = Object.entries(all)
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
  // A page under `tests/` is an artefact and the trace wall asks every
  // artefact for a frontmatter block. A fixture that skipped it would be red
  // for a rule this task is not about.
  return `---\ntraces:\n  parent: strategy\n---\n\n# Bug: a case is red\n\n${lines}\n`;
};
/** A finding is `<artefact>: <kind>: <message>`; read the artefact and kind. */
const finding = (out, artefact, kind) =>
  out
    .split("\n")
    .filter((l) => l.startsWith(`${artefact}: ${kind}: `))
    .map((l) => l.slice(`${artefact}: ${kind}: `.length));

test("1. a bug carries its case, its wall, when it was seen and the lane that owns it", () => {
  // A whole page is a finding about nothing: this is the premise the six
  // below rest on, so it is asserted before any of them is trusted.
  scratch(tree({ bugs: { "tests/bugs/beta.md": bug() } }), (root) => {
    const out = said(kaal(root, "traces"));
    notUsage(out);
    assert.deepEqual(
      finding(out, "bugs/beta", "bug"),
      [],
      `a whole bug page was a finding: ${out}`,
    );
  });
  // And each field, dropped one at a time, is its own finding naming it. One
  // at a time, because a page missing all four would go red on the first and
  // say nothing about the other three.
  for (const field of ["Case", "Wall", "Seen", "Lane"]) {
    scratch(
      tree({ bugs: { "tests/bugs/beta.md": bug({ [field]: null }) } }),
      (root) => {
        const out = said(kaal(root, "traces"));
        notUsage(out);
        const found = finding(out, "bugs/beta", "bug");
        assert.equal(
          found.length,
          1,
          `a bug with no ${field} answered ${found.length} findings: ${out}`,
        );
        assert.match(
          found[0],
          new RegExp(field, "i"),
          `the finding does not name the missing field: ${found[0]}`,
        );
      },
    );
  }
});

test("2. a bug naming a lane the config does not hold is a finding naming the lane", () => {
  scratch(
    tree({ bugs: { "tests/bugs/beta.md": bug({ Lane: "nonesuch/*" }) } }),
    (root) => {
      const out = said(kaal(root, "traces"));
      notUsage(out);
      const found = finding(out, "bugs/beta", "bug");
      assert.equal(found.length, 1, `expected one finding: ${out}`);
      assert.match(found[0], /nonesuch/, `the lane is not named: ${found[0]}`);
    },
  );
  // A lane the config does hold is no finding, or the case above would pass
  // on any lane at all.
  scratch(
    tree({ bugs: { "tests/bugs/beta.md": bug({ Lane: "test/*" }) } }),
    (root) => {
      const out = said(kaal(root, "traces"));
      notUsage(out);
      assert.deepEqual(
        finding(out, "bugs/beta", "bug"),
        [],
        `a lane the config holds was a finding: ${out}`,
      );
    },
  );
});

test("3. a bug about a case that now passes is a finding saying so", () => {
  // The case the bug is about is green here and red in every other case in
  // this file, and nothing else differs: a bug clears by the case going
  // green, which is the tree noticing rather than a person asserting.
  scratch(
    tree({ beta: PASSES, bugs: { "tests/bugs/beta.md": bug() } }),
    (root) => {
      const out = said(kaal(root, "traces"));
      notUsage(out);
      const found = finding(out, "bugs/beta", "bug");
      assert.equal(found.length, 1, `a bug over a green case passed: ${out}`);
      assert.match(
        found[0],
        /pass|green|clear/i,
        `the finding does not say the case passes: ${found[0]}`,
      );
    },
  );
});

test("4. a bug about a case no suite names is a finding naming the path", () => {
  // A path with no file behind it. A case that is in the tree and named by no
  // suite is already a finding of the suites wall, so a fixture built that way
  // would prove a rule this task is not about.
  const stray = "requirements/gamma/acceptance.test.mjs";
  scratch(
    tree({ bugs: { "tests/bugs/gamma.md": bug({ Case: stray }) } }),
    (root) => {
      const out = said(kaal(root, "traces"));
      notUsage(out);
      const found = finding(out, "bugs/gamma", "bug");
      assert.ok(
        found.some((m) => m.includes(stray)),
        `a bug over a case no suite names passed: ${out}`,
      );
    },
  );
});

test("5. a board carrying a standing bug does not answer green", () => {
  // The premise first: this tree's board is green with no bug on it, so the
  // case below is about the bug and not about a tree that was red anyway.
  scratch(tree({ beta: PASSES }), (root) => {
    const out = said(kaal(root, "gates"));
    notUsage(out);
    assert.match(
      out,
      /^green:/m,
      `the tree was not green to begin with: ${out}`,
    );
  });
  // And the bug is about a case that is genuinely red. A bug over a green one
  // would trip criterion 3 as well, and two rules in one fixture prove
  // neither.
  scratch(tree({ bugs: { "tests/bugs/beta.md": bug() } }), (root) => {
    const out = said(kaal(root, "gates"));
    notUsage(out);
    assert.doesNotMatch(
      out,
      /^green:/m,
      `a board carrying a bug answered green: ${out}`,
    );
  });
});

test("6. the board names each standing bug, its case and its lane", () => {
  scratch(tree({ bugs: { "tests/bugs/beta.md": bug() } }), (root) => {
    const out = said(kaal(root, "gates"));
    notUsage(out);
    const line = out
      .split("\n")
      .find((l) => l.includes(BETA) && l.includes("build/*"));
    assert.ok(
      line,
      `no line names the blocked case and the lane that owns it: ${out}`,
    );
  });
  // And a tree with no bug says nothing of the kind, or the line above would
  // be furniture rather than an answer.
  scratch(tree({}), (root) => {
    const out = said(kaal(root, "gates"));
    notUsage(out);
    assert.ok(
      !out.split("\n").some((l) => l.includes(BETA) && l.includes("build/*")),
      `a tree with no bug named one anyway: ${out}`,
    );
  });
});

test("7. a case a standing bug is about is not re-run, and the answer says so", () => {
  // Absence needs a witness: the wall must be shown running the other case in
  // the same suite, or a wall that ran nothing at all would pass this.
  // The wall is the surface here and not the board: a board prints a wall's
  // own lines only where it failed, so it cannot witness which cases ran.
  scratch(tree({ bugs: { "tests/bugs/beta.md": bug() } }), (root) => {
    const out = said(
      kaal(root, "acceptance", "requirements/*/acceptance.test.mjs"),
    );
    notUsage(out);
    assert.ok(
      out.includes("alpha"),
      `the wall did not run the case no bug is about: ${out}`,
    );
    const line = out
      .split("\n")
      .find((l) => l.includes(BETA) && /not run|skipped|blocked/i.test(l));
    assert.ok(
      line,
      `the answer does not say the blocked case was not run: ${out}`,
    );
  });
});
