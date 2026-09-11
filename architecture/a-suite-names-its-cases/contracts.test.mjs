// Contract tests for drawing a-suite-names-its-cases. One per seam, numbered
// to match. Two answer from the kind table alone; the rest read a tree, and
// every tree here is built and thrown away, because the thing this drawing
// changes is the tests directory and a case that read the league's own would
// be reading the answer it is asking for.
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

// Imported inside each seam: a namespace import at the top saves a missing
// export and not a module that fails to load, and one absent name would share
// its red across all seven.
const from = async (file, name) => {
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
const scratch = async (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-suite-c-"));
  try {
    put(root, files);
    return await fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
const CASE = "import { test } from 'node:test';\ntest('a', () => {});\n";
const suite = (cases) =>
  `---\ntraces:\n  parent: strategy\n  cases: ${cases}\n---\n\n# Test suite\n`;
const plan = (wall, suites, tail = "") =>
  `---\ntraces:\n  parent: strategy\n  suites: ${suites}\n---\n\n` +
  `# Test plan: ${wall}\n\n## Wall\n\n- Wall: ${wall}\n${tail}`;
const SEATS = [
  { name: "analyst", owns: ["requirements/**"] },
  { name: "developer", owns: ["bin/**"] },
  { name: "tester", owns: ["tests/**"] },
];

test("1. the suites kind resolves a name under tests/suites", async () => {
  const KINDS = await from("traces.mjs", "KINDS");
  assert.ok(KINDS.suites, "the kind table holds no suites row");
  const where = KINDS.suites.where("alpha", {
    dir: "tests",
    artefact: "plans/acceptance",
  });
  assert.equal(
    String(where).split(/[\\/]/).join("/"),
    "tests/suites/alpha.md",
    "a suite name resolves somewhere else",
  );
});

test("2. the cases kind resolves a path to itself, and it pins", async () => {
  const KINDS = await from("traces.mjs", "KINDS");
  assert.ok(KINDS.cases, "the kind table holds no cases row");
  const p = "requirements/alpha/acceptance.test.mjs";
  assert.equal(
    String(KINDS.cases.where(p, { dir: "tests", artefact: "suites/alpha" }))
      .split(/[\\/]/)
      .join("/"),
    p,
    "a case path does not resolve to itself",
  );
  const writePins = await from("traces.mjs", "writePins");
  await scratch(
    {
      "kaal/league.md": "---\ntraces:\n  parent: none\n---\n\n# Scratch\n",
      "tests/strategy.md":
        "---\ntraces:\n  parent: none\n---\n\n# Test strategy\n\n## Root\n\n- Root because: root.\n",
      "tests/suites/alpha.md": suite(p),
      [p]: CASE,
    },
    (root) => {
      writePins(root);
      assert.match(
        readFileSync(join(root, "tests", "suites", "alpha.md"), "utf8"),
        /cases:[^\n]*acceptance\.test\.mjs@[0-9a-f]{8}/,
        "a case carries no pin after writePins",
      );
    },
  );
});

test("3. suitePages answers what each suite covers", async () => {
  const suitePages = await from("plans.mjs", "suitePages");
  await scratch(
    {
      "tests/suites/alpha.md": suite(
        "requirements/a/acceptance.test.mjs@" + "f".repeat(64),
      ),
      "tests/suites/beta.md": suite("nothing"),
    },
    (root) => {
      const pages = suitePages(root);
      assert.equal(pages.length, 2, `expected two suites, got ${pages.length}`);
      const by = new Map(pages.map((p) => [p.name, p.cases]));
      assert.deepEqual(
        by.get("alpha"),
        ["requirements/a/acceptance.test.mjs"],
        "the pin was not stripped, or the case was not read",
      );
      assert.deepEqual(by.get("beta"), [], "`nothing` yielded a case");
    },
  );
});

test("4. caseOwner answers nothing, tests/, or no seat, in that order", async () => {
  const caseOwner = await from("plans.mjs", "caseOwner");
  assert.equal(
    caseOwner("requirements/a/acceptance.test.mjs", SEATS),
    null,
    "an owned case was refused",
  );
  const held = caseOwner("tests/thing.test.mjs", SEATS);
  assert.ok(held, "a case under tests/ was allowed");
  assert.match(
    String(held),
    /tests\/thing\.test\.mjs/,
    "the answer never names the path",
  );
  assert.match(
    String(held),
    /points at|does not hold/i,
    "a case under tests/ answered the wrong one of the two",
  );
  const nobody = caseOwner("nowhere/thing.test.mjs", SEATS);
  assert.ok(nobody, "an unowned case was allowed");
  assert.match(
    String(nobody),
    /nowhere\/thing\.test\.mjs/,
    "the answer never names the path",
  );
  assert.match(
    String(nobody),
    /seat/i,
    "the answer never says no seat owns it",
  );
});

test("5. unnamed answers the files no suite names, only where suites reach", async () => {
  const unnamed = await from("plans.mjs", "unnamed");
  await scratch(
    {
      "requirements/a/acceptance.test.mjs": CASE,
      "requirements/b/acceptance.test.mjs": CASE,
      "elsewhere/c.test.mjs": CASE,
    },
    (root) => {
      const out = unnamed(
        root,
        new Set(["requirements/a/acceptance.test.mjs"]),
      ).map((p) => String(p).split(/[\\/]/).join("/"));
      assert.deepEqual(
        out,
        ["requirements/b/acceptance.test.mjs"],
        `expected only the unnamed file under a reached tree, got ${out.join(", ")}`,
      );
    },
  );
});

test("6. planSuites answers a plan's suites, and a glob left behind is refused", async () => {
  const planSuites = await from("plans.mjs", "planSuites");
  assert.deepEqual(
    planSuites(plan("acceptance", "alpha, beta")).names,
    ["alpha", "beta"],
    "a plan's suites were not read from its trace",
  );
  const withGlob = planSuites(
    plan(
      "acceptance",
      "alpha",
      "\n## Suites\n\nUnder `requirements/*/acceptance.test.mjs`.\n",
    ),
  );
  assert.ok(
    withGlob.findings?.length,
    "a glob left in a plan's prose was not refused",
  );
  assert.match(
    String(withGlob.findings[0]),
    /glob/i,
    "the finding never says what is wrong",
  );
});

test("7. reach answers one row per plan with its suites and cases", async () => {
  const reach = await from("plans.mjs", "reach");
  await scratch(
    {
      "tests/plans/acceptance.md": plan("acceptance", "alpha"),
      "tests/plans/regression.md": plan("acceptance", "alpha"),
      "tests/suites/alpha.md": suite(
        "requirements/a/acceptance.test.mjs, requirements/b/acceptance.test.mjs",
      ),
      "requirements/a/acceptance.test.mjs": CASE,
      "requirements/b/acceptance.test.mjs": CASE,
    },
    (root) => {
      const rows = reach(root);
      assert.equal(
        rows.length,
        2,
        `expected a row per plan, got ${rows.length}`,
      );
      for (const r of rows) {
        assert.equal(
          r.suites,
          1,
          `${r.plan}: expected 1 suite, got ${r.suites}`,
        );
        assert.equal(r.cases, 2, `${r.plan}: expected 2 cases, got ${r.cases}`);
      }
    },
  );
});
