// Acceptance tests for requirement a-regression-is-a-promise-that-was-kept.
// One per criterion. Surface only: `kaal regression` and `kaal acceptance`,
// on scratch trees, because a record and a requirement have to be real for
// the verdicts to read them.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

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
const CONFIG = JSON.stringify(
  {
    gates: [
      {
        name: "acceptance",
        command:
          "node bin/kaal.mjs acceptance requirements/*/acceptance.test.mjs",
      },
      { name: "regression", command: "node bin/kaal.mjs regression" },
    ],
    seats: [{ name: "tester", owns: ["tests/**"] }],
    lanes: [{ pattern: "test/*", seat: "tester", allows: [] }],
    shared: [],
  },
  null,
  2,
);

const CASE = (n) => `requirements/${n}/acceptance.test.mjs`;
/** A run record, carrying the sha of what it says it ran. */
const record = (n, body) =>
  `# Run: ${n}\n\n- Task: ${n}\n- Suite: ${CASE(n)}\n- Ran: 2026-09-13\n` +
  `- Suite sha: ${createHash("sha256").update(body).digest("hex")}\n` +
  `- Passing: 1\n- Failing: 0\n`;

/**
 * A tree with one task, its case as given, and the regression plan reaching
 * it. `recorded` decides whether a run on record says it once passed.
 */
const scratch = ({ body, recorded }, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-regress-"));
  try {
    put(root, {
      "kaal/league.md": TRUNK,
      "kaal.config.json": CONFIG,
      "tests/strategy.md": STRATEGY,
      "requirements/alpha/requirement.md": REQUIREMENT("alpha"),
      [CASE("alpha")]: body,
      "tests/suites/acceptance.md": suite("acceptance", [CASE("alpha")]),
      "tests/plans/acceptance.md": plan("acceptance", ["acceptance"]),
      "tests/plans/regression.md": plan("regression", ["acceptance"]),
      ...(recorded ? { "tests/runs/alpha.md": record("alpha", body) } : {}),
    });
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

test("1. a case whose task has no run on record is not a regression", () => {
  // The case is red and the task has never been delivered, which is the state
  // every task in flight is in. Its red is news about work in progress.
  scratch({ body: FAILS, recorded: false }, (root) => {
    const r = kaal(root, "regression");
    const out = said(r);
    notUsage(out);
    assert.doesNotMatch(
      out,
      new RegExp(`${CASE("alpha")} is red`),
      `an undelivered task's red was called a regression: ${out}`,
    );
    assert.equal(r.status, 0, `the wall refused: ${out}`);
  });
});

test("2. a case whose task has a record and now fails is reported red", () => {
  // Absence needs a witness: the same tree with a record saying it passed,
  // and the case red now, which is the whole of what a regression is. Without
  // this the first case would pass on a wall that reported nothing ever.
  scratch({ body: FAILS, recorded: true }, (root) => {
    const r = kaal(root, "regression");
    const out = said(r);
    notUsage(out);
    assert.ok(
      out.includes(CASE("alpha")),
      `a regression was not named: ${out}`,
    );
    assert.notEqual(r.status, 0, `a regression did not refuse: ${out}`);
  });
  // And a recorded task that still passes is no finding at all.
  scratch({ body: PASSES, recorded: true }, (root) => {
    const r = kaal(root, "regression");
    const out = said(r);
    notUsage(out);
    assert.equal(r.status, 0, `a kept promise refused: ${out}`);
  });
});

test("3. the two walls do not disagree about one case", () => {
  const both = (root) => ({
    acceptance: said(
      kaal(root, "acceptance", "requirements/*/acceptance.test.mjs"),
    ),
    regression: said(kaal(root, "regression")),
  });
  // Not delivered to one is not a regression to the other.
  scratch({ body: FAILS, recorded: false }, (root) => {
    const { acceptance, regression } = both(root);
    notUsage(acceptance);
    notUsage(regression);
    assert.match(acceptance, /not delivered/, acceptance);
    assert.doesNotMatch(
      regression,
      new RegExp(`${CASE("alpha")} is red`),
      `one wall says not delivered and the other says regression: ${regression}`,
    );
  });
  // Regressed to one is a regression to the other.
  scratch({ body: FAILS, recorded: true }, (root) => {
    const { acceptance, regression } = both(root);
    assert.match(acceptance, /regressed/, acceptance);
    assert.ok(
      regression.includes(CASE("alpha")),
      `one wall says regressed and the other passed it over: ${regression}`,
    );
  });
});

test("4. the answer says how many it ran and how many it did not judge", () => {
  scratch({ body: FAILS, recorded: false }, (root) => {
    const out = said(kaal(root, "regression"));
    notUsage(out);
    // One case reached, and it was not judged, so both numbers are in the
    // answer and a reader does not have to subtract them.
    const line = out
      .split("\n")
      .find((l) => /^regression: /.test(l) && /\d/.test(l));
    assert.ok(line, `no counting line: ${out}`);
    assert.match(
      line,
      /not judged|unjudged|no record/i,
      `the answer does not say any were passed over: ${line}`,
    );
    assert.match(line, /\b1\b/, `the count of one is not there: ${line}`);
  });
});
