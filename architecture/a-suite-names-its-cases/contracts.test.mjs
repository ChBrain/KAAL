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
/** A kind as a block: one entry to a line, keyed by the name. */
const block = (key, value) => {
  // `nothing` is how a line says none; a block says it by holding no entry.
  const entries =
    value && !/^(nothing|none)$/i.test(value) ? value.split(", ") : [];
  return (
    `${key}:\n` +
    entries
      .map((e) => {
        const [n, sha] = e.split("@");
        return `  ${n}: ${sha ?? "nothing"}`;
      })
      .join("\n") +
    (entries.length ? "\n" : "")
  );
};
const suite = (cases) =>
  `---\ntraces:\n  parent: strategy\n${block("cases", cases)}---\n\n# Test suite\n`;
const plan = (wall, suites, tail = "") =>
  `---\ntraces:\n  parent: strategy\n${block("suites", suites)}---\n\n` +
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

test("2. the cases kind resolves a path to itself", async () => {
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
});

test("3. a kind written as a block reads as a list would", async () => {
  const readTrace = await from("traces.mjs", "readTrace");
  const splitTrace = await from("traces.mjs", "splitTrace");
  const sha = "a".repeat(64);
  const asBlock = readTrace(
    `---\ntraces:\n  parent: strategy\ncases:\n  x/one.test.mjs: ${sha}\n  x/two.test.mjs: nothing\n---\n`,
  );
  const asList = readTrace(
    `---\ntraces:\n  parent: strategy\n  cases: x/one.test.mjs@${sha}, x/two.test.mjs\n---\n`,
  );
  assert.deepEqual(
    splitTrace(asBlock.cases).map((e) => e.name),
    splitTrace(asList.cases).map((e) => e.name),
    "a block and a list name different things",
  );
  assert.equal(
    splitTrace(asBlock.cases)[0].pin,
    sha,
    "a block entry's sha is not its pin",
  );
  assert.deepEqual(
    splitTrace(
      readTrace(`---\ntraces:\n  parent: none\ncases:\n---\n`).cases ?? "",
    ),
    [],
    "an empty block named something",
  );
});

test("4. a frontmatter sub key may carry a dot", async () => {
  const parseFrontmatter = await from("frontmatter.mjs", "parseFrontmatter");
  const { data } = parseFrontmatter(
    `---\ncases:\n  requirements/a/acceptance.test.mjs: nothing\n---\nbody\n`,
  );
  assert.deepEqual(
    Object.keys(data.cases ?? {}),
    ["requirements/a/acceptance.test.mjs"],
    "a key with a dot was dropped in silence",
  );
  const { data: d2 } = parseFrontmatter(
    `---\nreviews:\n  requirement/alpha: current\ntraces:\n  parent: none\n---\n`,
  );
  assert.deepEqual(Object.keys(d2.reviews ?? {}), ["requirement/alpha"]);
  assert.deepEqual(d2.traces, { parent: "none" });
});

test("5. writePins writes a sha onto each entry's own line", async () => {
  const writePins = await from("traces.mjs", "writePins");
  await scratch(
    {
      "kaal/league.md": "---\ntraces:\n  parent: none\n---\n\n# Scratch\n",
      "tests/strategy.md":
        "---\ntraces:\n  parent: none\n---\n\n# Test strategy\n\n## Root\n\n- Root because: root.\n",
      "tests/suites/alpha.md": suite("requirements/a/acceptance.test.mjs"),
      "requirements/a/acceptance.test.mjs": CASE,
    },
    (root) => {
      writePins(root);
      const text = readFileSync(
        join(root, "tests", "suites", "alpha.md"),
        "utf8",
      );
      assert.match(
        text,
        /^ {2}requirements\/a\/acceptance\.test\.mjs: [0-9a-f]{64}$/m,
        `no sha on the entry's own line: ${text}`,
      );
      assert.doesNotMatch(text, /^cases:.+$/m, "the block became a line");
    },
  );
});

test("6. suitePages answers what each suite covers", async () => {
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

test("7. owners answers what holds a path, and caseOwner answers in order", async () => {
  const owners = await from("plans.mjs", "owners");
  const caseOwner = await from("plans.mjs", "caseOwner");
  await scratch(
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
      const own = owners(root);
      assert.ok(
        own.includes("requirements/**"),
        `a seat's owns is not an owner: ${own.join(", ")}`,
      );
      assert.ok(
        own.includes("skills/**"),
        `a seatless lane's allows is not an owner: ${own.join(", ")}`,
      );
      assert.equal(
        caseOwner("requirements/a/acceptance.test.mjs", own),
        null,
        "a case a seat holds was refused",
      );
      assert.equal(
        caseOwner("skills/analyse/scripts/count.test.mjs", own),
        null,
        "a case a seatless lane holds was refused",
      );
      const nobody = caseOwner("nowhere/thing.test.mjs", own);
      assert.ok(nobody, "a case nothing holds was allowed");
      assert.match(String(nobody), /nowhere\/thing\.test\.mjs/);
      assert.match(
        String(nobody),
        /own/i,
        "the answer never says nothing owns it",
      );
      // `tests/` is refused before ownership is asked: the tester owns it.
      const held = caseOwner("tests/thing.test.mjs", ["tests/**"]);
      assert.match(
        String(held),
        /points at|does not hold/i,
        "a case under tests/ answered the wrong one of the two",
      );
    },
  );
});

test("8. unnamed answers the files no suite names, only where suites reach", async () => {
  const unnamed = await from("plans.mjs", "unnamed");
  await scratch(
    {
      "requirements/a/acceptance.test.mjs": CASE,
      "requirements/b/acceptance.test.mjs": CASE,
      "elsewhere/c.test.mjs": CASE,
      // A scratch tree built for a case. Its files are that case's data and
      // never cases of their own, and on the league's own tree the first
      // reading of this seam found forty six of them.
      "requirements/a/fixtures/scratch/requirements/t/acceptance.test.mjs":
        CASE,
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
      assert.ok(
        !out.some((p) => p.includes("/fixtures/")),
        `a fixture was asked to be named: ${out.join(", ")}`,
      );
    },
  );
});

test("9. planSuites answers a plan's suites, and a glob left behind is refused", async () => {
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

test("10. reach answers one row per plan with its suites and cases", async () => {
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
