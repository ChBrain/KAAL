// Acceptance tests for requirement a-plan-picks-its-suites. One per
// criterion. Surface only: `kaal traces` and the gate the regression plan
// names, on scratch trees, because the league's own `tests/` is what this
// task changes and a case that read it would be reading the answer it asks
// for.
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
const CONFIG = (gates) =>
  JSON.stringify(
    {
      gates,
      seats: [
        { name: "analyst", owns: ["requirements/**"] },
        { name: "tester", owns: ["tests/**"] },
      ],
      lanes: [
        { pattern: "requirement/*", seat: "analyst", allows: [] },
        { pattern: "test/*", seat: "tester", allows: [] },
        // A lane owns `evals/`, as this league's own does, so a path there is
        // not a finding for being unowned. Without it the fifth case passes
        // on the ownership rule and says nothing about verification.
        { pattern: "eval/*", seat: null, allows: ["evals/**"] },
      ],
      shared: [],
    },
    null,
    2,
  );
const ACCEPTANCE_GATE = {
  name: "acceptance",
  command: "node bin/kaal.mjs acceptance requirements/*/acceptance.test.mjs",
};
/** The gate the regression plan names, however it comes to read it. */
const REGRESSION_GATE = {
  name: "regression",
  command: "node bin/kaal.mjs regression",
};

const scratch = (
  files,
  fn,
  { gates = [ACCEPTANCE_GATE, REGRESSION_GATE] } = {},
) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-regression-"));
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

/** A task: its requirement and its suite, green or red. */
const task = (name, body) => ({
  [`requirements/${name}/requirement.md`]: REQUIREMENT(name),
  [`requirements/${name}/acceptance.test.mjs`]: body,
});
const ALPHA = "requirements/alpha/acceptance.test.mjs";
const BETA = "requirements/beta/acceptance.test.mjs";
/** A tree with two tasks, two suites, an acceptance plan and a regression one. */
const whole = (picks, { beta = PASSES } = {}) => ({
  ...task("alpha", PASSES),
  ...task("beta", beta),
  "tests/suites/alpha.md": suite("alpha", [ALPHA]),
  "tests/suites/beta.md": suite("beta", [BETA]),
  "tests/plans/acceptance.md": plan("acceptance", ["alpha", "beta"]),
  "tests/plans/regression.md": plan("regression", picks),
});

test("1. a regression plan names the suites it picks, and one naming none says so", () => {
  scratch(whole(["alpha"]), (root) => {
    const r = kaal(root, "traces");
    const out = said(r);
    notUsage(out);
    assert.doesNotMatch(
      out,
      /^regression: /m,
      `a plan that picks a suite was a finding: ${out}`,
    );
  });
  scratch(whole([]), (root) => {
    const out = said(kaal(root, "traces"));
    assert.match(
      out,
      /^regression: .*names no suite/m,
      `a regression plan picking nothing was not a finding: ${out}`,
    );
  });
});

test("2. a suite named by two plans is a finding in neither direction", () => {
  // `alpha` is named by the acceptance plan and by the regression plan. This
  // is the many to many the suite layer declared and has never had an
  // instance of.
  scratch(whole(["alpha"]), (root) => {
    const r = kaal(root, "traces");
    const out = said(r);
    notUsage(out);
    for (const name of ["alpha", "acceptance", "regression"])
      assert.doesNotMatch(
        out,
        new RegExp(`^(suites/)?${name}: (plan|suite|wall): `, "m"),
        `${name} was a finding: ${out}`,
      );
    // And the counts do not subtract: each plan reaches what it names.
    assert.match(out, /acceptance: 2 suite\(s\), 2 case\(s\)/, out);
    assert.match(out, /regression: 1 suite\(s\), 1 case\(s\)/, out);
  });
});

test("3. the board says which cases the regression plan reaches, by path", () => {
  scratch(whole(["alpha"]), (root) => {
    const r = kaal(root, "traces");
    const out = said(r);
    notUsage(out);
    assert.ok(
      out.includes(ALPHA),
      `the case the regression plan reaches is not named: ${out}`,
    );
    assert.ok(
      !out.includes(BETA),
      `a case no regression suite names was named as reached: ${out}`,
    );
  });
});

test("4. a gate runs what the regression plan reaches and nothing else", () => {
  // `beta` is red and no regression suite names it, so the regression gate
  // has nothing to fail on; the acceptance wall still does.
  scratch(whole(["alpha"], { beta: FAILS }), (root) => {
    const r = kaal(root, "regression");
    const out = said(r);
    notUsage(out);
    assert.equal(r.status, 0, `a case outside the selection failed it: ${out}`);
    assert.match(
      out,
      /\b1\b[^\n]*case/,
      `it does not say how many it ran: ${out}`,
    );
  });
  // And with the red case picked, the same gate fails and names it.
  scratch(whole(["alpha", "beta"], { beta: FAILS }), (root) => {
    const r = kaal(root, "regression");
    const out = said(r);
    assert.equal(r.status, 1, `a red case inside the selection passed: ${out}`);
    assert.ok(out.includes(BETA), `the red case is not named: ${out}`);
  });
});

test("5. what the regression plan reaches is verification only", () => {
  // A model's reading cannot be re-run to the same answer twice, so it is
  // evidence and never a gate. The strategy page says so and this asks the
  // board to.
  scratch(
    {
      ...whole(["alpha"]),
      "evals/analyse/a-fixture/a-model.md":
        "---\nverdict: pass\n---\n\n# Output\n",
      "tests/suites/alpha.md": suite("alpha", [
        ALPHA,
        "evals/analyse/a-fixture/a-model.md",
      ]),
    },
    (root) => {
      const out = said(kaal(root, "traces"));
      notUsage(out);
      assert.ok(
        out.includes("evals/analyse/a-fixture/a-model.md"),
        `a path under evals/ reached by the regression plan was not a finding: ${out}`,
      );
    },
  );
});

test("6. what is re-run changes with a diff in tests/ alone", () => {
  // The same config, the same cases, two regression plans. What is protected
  // differs and nothing outside `tests/` does.
  const reach = (picks) =>
    scratch(whole(picks, { beta: FAILS }), (root) => {
      const r = kaal(root, "regression");
      return { status: r.status, out: said(r) };
    });
  const one = reach(["alpha"]);
  const two = reach(["alpha", "beta"]);
  notUsage(one.out);
  assert.equal(one.status, 0, one.out);
  assert.equal(two.status, 1, two.out);
  assert.ok(!one.out.includes(BETA), one.out);
  assert.ok(two.out.includes(BETA), two.out);
});
