// Contract tests for drawing a-plan-picks-its-suites. One per seam, numbered
// to match. Each drives its seam's own function, on scratch trees, because
// the league's own `tests/` is what this task changes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

// Imported inside each seam: a namespace import at the top saves a missing
// export, not a module that fails to load, and one absent file would share
// its red across all five.
const need = async (file, name) => {
  const mod = await import(`../../bin/lib/${file}`);
  assert.ok(mod[name], `no ${name} export from ${file}`);
  return mod[name];
};

const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};
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
const config = (gates) => JSON.stringify({ gates }, null, 2);
const tree = (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-picks-c-"));
  try {
    put(root, files);
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
const A = "requirements/alpha/acceptance.test.mjs";
const B = "requirements/beta/acceptance.test.mjs";
const PASSES =
  "import { test } from 'node:test';\ntest('1. it holds', () => {});\n";
const FAILS =
  "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\n" +
  "test('1. it does not hold', () => assert.equal(1, 2));\n";

test("1. the cases a plan reaches, each once and sorted", async () => {
  const casesOf = await need("plans.mjs", "casesOf");
  tree(
    {
      "tests/plans/acceptance.md": plan("acceptance", ["alpha", "beta"]),
      "tests/plans/regression.md": plan("regression", ["alpha"]),
      "tests/suites/alpha.md": suite("alpha", [B, A]),
      "tests/suites/beta.md": suite("beta", [B]),
    },
    (root) => {
      // Sorted, so the answer is the same twice; and `beta` is named by both
      // suites, so the plan that reaches both reaches it once.
      assert.deepEqual(casesOf(root, "regression"), [A, B].sort());
      assert.deepEqual(casesOf(root, "acceptance"), [A, B].sort());
      // A plan that names nothing reaches nothing, and a plan that is not
      // there is not a plan reaching nothing: both answer empty and the
      // caller is what tells them apart.
      assert.deepEqual(casesOf(root, "nonesuch"), []);
    },
  );
  // A suite a plan names that is not there is reached past, not crashed on.
  tree(
    {
      "tests/plans/regression.md": plan("regression", ["alpha", "gone"]),
      "tests/suites/alpha.md": suite("alpha", [A]),
    },
    (root) => assert.deepEqual(casesOf(root, "regression"), [A]),
  );
});

test("2. a gate is a test gate two ways", async () => {
  const testGates = await need("plans.mjs", "testGates");
  const names = (root) =>
    testGates(root)
      .map((g) => g.name)
      .sort();
  tree(
    {
      "kaal.config.json": config([
        {
          name: "acceptance",
          command: "node --test requirements/*/acceptance.test.mjs",
        },
        { name: "regression", command: "node bin/kaal.mjs regression" },
        { name: "format", command: "npx prettier --check ." },
      ]),
      "tests/plans/regression.md": plan("regression", ["alpha"]),
      "tests/suites/alpha.md": suite("alpha", [A]),
    },
    (root) => {
      // The glob shape and the plan shape both count; a gate that runs no
      // test still owes nothing.
      assert.deepEqual(names(root), ["acceptance", "regression"]);
    },
  );
  // And a gate naming a plan that is not there owes nothing: the wall's rule
  // is about a wall that runs tests, and this one runs none.
  tree(
    {
      "kaal.config.json": config([
        { name: "regression", command: "node bin/kaal.mjs regression" },
      ]),
    },
    (root) => assert.deepEqual(names(root), []),
  );
});

test("3. a case a plan may not reach", async () => {
  const unrunnable = await need("plans.mjs", "unrunnable");
  const EVAL = "evals/analyse/a-fixture/a-model.md";
  tree(
    {
      "tests/plans/regression.md": plan("regression", ["alpha"]),
      "tests/plans/acceptance.md": plan("acceptance", ["beta"]),
      "tests/suites/alpha.md": suite("alpha", [A, EVAL]),
      "tests/suites/beta.md": suite("beta", [B, EVAL]),
    },
    (root) => {
      const f = unrunnable(root, "regression");
      assert.equal(f.length, 1, JSON.stringify(f));
      assert.ok(
        `${f[0].artefact} ${f[0].message}`.includes(EVAL),
        JSON.stringify(f[0]),
      );
      // Asked about one plan and never about the tree: the same path under a
      // suite another plan names is not this answer's business.
      assert.deepEqual(unrunnable(root, "nonesuch"), []);
    },
  );
  tree(
    {
      "tests/plans/regression.md": plan("regression", ["alpha"]),
      "tests/suites/alpha.md": suite("alpha", [A]),
    },
    (root) => assert.deepEqual(unrunnable(root, "regression"), []),
  );
});

test("4. run these cases, and say how many", async () => {
  const runCases = await need("plans.mjs", "runCases");
  tree({ [A]: PASSES, [B]: FAILS }, (root) => {
    const green = runCases(root, [A]);
    assert.equal(green.ok, true, JSON.stringify(green));
    assert.equal(green.cases, 1);
    assert.deepEqual(green.red, []);
    const red = runCases(root, [A, B]);
    assert.equal(red.ok, false, JSON.stringify(red));
    assert.equal(red.cases, 2);
    assert.ok(red.red.join(" ").includes(B), JSON.stringify(red.red));
  });
  // Nothing to run is not a run that passed: a selection that reaches no case
  // is the vacuous green this league has a task about.
  tree({ [A]: PASSES }, (root) => {
    const none = runCases(root, []);
    assert.equal(none.cases, 0);
    assert.equal(none.ok, false, JSON.stringify(none));
  });
});

test("5. the line naming what a plan reaches", async () => {
  const reached = await need("plans.mjs", "reached");
  tree(
    {
      "tests/plans/regression.md": plan("regression", ["alpha"]),
      "tests/suites/alpha.md": suite("alpha", [A]),
      "tests/suites/beta.md": suite("beta", [B]),
    },
    (root) => {
      const line = reached(root, "regression");
      assert.ok(line.includes(A), line);
      assert.ok(!line.includes(B), line);
      assert.ok(line.includes("regression"), line);
    },
  );
  // A plan reaching nothing says so rather than printing an empty list.
  tree({ "tests/plans/regression.md": plan("regression", []) }, (root) => {
    const line = reached(root, "regression");
    assert.match(line, /\b(no|nothing|0)\b/i, line);
  });
});
