// Contract tests for drawing a-regression-is-a-promise-that-was-kept. One per
// seam, numbered to match. Each drives its seam's own side on a scratch tree,
// because a record and a requirement have to be real for the reader to read
// them.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Imported inside each seam: a namespace import at the top saves a missing
// export, not a module that fails to load, and one absent file would share
// its red across all three.
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
const kaal = (root, ...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
    cwd: root,
    env: { ...process.env, KAAL_BRANCH: "", KAAL_BASE: "" },
  });
const said = (r) => `${r.stdout ?? ""}${r.stderr ?? ""}`;

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
const CASE = (n) => `requirements/${n}/acceptance.test.mjs`;
const record = (n, body) =>
  `# Run: ${n}\n\n- Task: ${n}\n- Suite: ${CASE(n)}\n- Ran: 2026-09-13\n` +
  `- Suite sha: ${createHash("sha256").update(body).digest("hex")}\n` +
  `- Passing: 1\n- Failing: 0\n`;

/** A tree of tasks: each name mapped to its body and whether it has a record. */
const tree = (tasks, fn, { picks = null } = {}) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-promise-c-"));
  try {
    const names = Object.keys(tasks);
    const files = {
      "kaal/league.md":
        "---\ntraces:\n  parent: none\n---\n\n# Scratch\n\nA tree.\n",
      "kaal.config.json": JSON.stringify(
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
      ),
      "tests/strategy.md":
        "---\ntraces:\n  parent: none\n---\n\n# Test strategy\n\nWalls run tests here.\n\n" +
        "## Root\n\n- Root because: it is the test tree's own root.\n",
      "tests/suites/acceptance.md": suite("acceptance", names.map(CASE)),
      "tests/plans/acceptance.md": plan("acceptance", ["acceptance"]),
      "tests/plans/regression.md": plan("regression", picks ?? ["acceptance"]),
    };
    for (const [n, { body, recorded }] of Object.entries(tasks)) {
      files[`requirements/${n}/requirement.md`] = REQUIREMENT(n);
      files[CASE(n)] = body;
      if (recorded) files[`tests/runs/${n}.md`] = record(n, body);
    }
    put(root, files);
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

test("1. does a record still speak for this case", async () => {
  const promised = await need("runs.mjs", "promised");
  tree(
    {
      kept: { body: PASSES, recorded: true },
      never: { body: PASSES, recorded: false },
    },
    (root) => {
      assert.equal(promised(root, CASE("kept")), true);
      assert.equal(promised(root, CASE("never")), false);
      // A path that answers to no task at all: a unit has no requirement and
      // can have no record, so nothing ever promised it.
      assert.equal(promised(root, "bin/lib/anything.test.mjs"), false);
      assert.equal(promised(root, "not/a/path/at/all.mjs"), false);
    },
  );
  // And a record whose suite has moved no longer speaks: the sha is what says
  // so, and this reader must not have a second opinion about it.
  tree({ moved: { body: PASSES, recorded: true } }, (root) => {
    assert.equal(promised(root, CASE("moved")), true);
    writeFileSync(
      join(root, ...CASE("moved").split("/")),
      `${PASSES}\n// edited\n`,
    );
    assert.equal(
      promised(root, CASE("moved")),
      false,
      "a record whose suite moved still spoke for it",
    );
  });
});

test("2. which of the red are regressions", async () => {
  await need("runs.mjs", "promised");
  // Red with a record is named and refuses.
  tree({ kept: { body: FAILS, recorded: true } }, (root) => {
    const r = kaal(root, "regression");
    const out = said(r);
    assert.ok(out.includes(CASE("kept")), `a regression was not named: ${out}`);
    assert.notEqual(r.status, 0, out);
  });
  // Red with no record is named by nothing and does not refuse.
  tree({ never: { body: FAILS, recorded: false } }, (root) => {
    const r = kaal(root, "regression");
    const out = said(r);
    assert.ok(
      !out.includes(`${CASE("never")} is red`),
      `an undelivered task's red was named: ${out}`,
    );
    assert.equal(r.status, 0, out);
  });
  // Both at once, so the wall is shown telling them apart rather than
  // answering the same way to whatever it is given.
  tree(
    {
      kept: { body: FAILS, recorded: true },
      never: { body: FAILS, recorded: false },
    },
    (root) => {
      const out = said(kaal(root, "regression"));
      assert.ok(out.includes(`${CASE("kept")} is red`), out);
      assert.ok(!out.includes(`${CASE("never")} is red`), out);
    },
  );
});

test("3. how many ran, how many went unjudged", async () => {
  await need("runs.mjs", "promised");
  tree(
    {
      kept: { body: PASSES, recorded: true },
      never: { body: PASSES, recorded: false },
      alsoNever: { body: PASSES, recorded: false },
    },
    (root) => {
      const out = said(kaal(root, "regression"));
      const line = out.split("\n").find((l) => /^regression: ran /.test(l));
      assert.ok(line, `no counting line: ${out}`);
      // Three reached and two of them unjudged, both read from the tree the
      // test built rather than written into the assertion twice.
      assert.match(line, /\b3\b/, `what it ran is not there: ${line}`);
      assert.match(line, /\b2\b/, `what went unjudged is not there: ${line}`);
    },
  );
  // And a tree where everything is promised says so without a second number
  // that a reader has to interpret as none.
  tree({ kept: { body: PASSES, recorded: true } }, (root) => {
    const out = said(kaal(root, "regression"));
    assert.match(out, /^regression: ran /m, out);
  });
});
