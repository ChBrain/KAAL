// Contract tests for drawing a-bug-names-where-it-can-be-fixed. One per seam,
// numbered to match. Each drives its seam's own function, on scratch trees,
// because `tests/bugs/` is the place this task builds.
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
const tree = (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-bugs-c-"));
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
const block = (key, names) =>
  names.length
    ? `${key}:\n${names.map((n) => `  ${n}: nothing`).join("\n")}\n`
    : `${key}:\n`;
const suite = (name, cases) =>
  `---\ntraces:\n  parent: strategy\n${block("cases", cases)}---\n\n` +
  `# Test suite: ${name}\n`;
const config = () =>
  JSON.stringify(
    {
      gates: [],
      lanes: [
        { pattern: "build/*", seat: "developer", allows: [] },
        { pattern: "test/*", seat: "tester", allows: [] },
      ],
    },
    null,
    2,
  );
/** A bug page: the four fields, minus any the caller sets to null. */
const bug = (fields = {}) => {
  const all = {
    Case: B,
    Wall: "acceptance",
    Seen: "2026-09-12",
    Lane: "build/*",
    ...fields,
  };
  const lines = Object.entries(all)
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
  return `---\ntraces:\n  parent: strategy\n---\n\n# Bug: a case is red\n\n${lines}\n`;
};
/** A tree with two cases, a suite naming both, and whatever bugs are asked for. */
const whole = ({ beta = FAILS, bugs = {} } = {}) => ({
  "kaal.config.json": config(),
  [A]: PASSES,
  [B]: beta,
  "tests/suites/acceptance.md": suite("acceptance", [A, B]),
  ...bugs,
});

test("1. the pages, read", async () => {
  const bugPages = await need("bugs.mjs", "bugPages");
  // A tree with no such place answers nothing rather than throwing: every
  // other page reader here does, and a wall that crashed on an absent
  // directory would make the fifth kind mandatory the day it is built.
  tree({ "kaal.config.json": config() }, (root) => {
    assert.deepEqual(bugPages(root), []);
  });
  tree(
    whole({
      bugs: {
        "tests/bugs/beta.md": bug(),
        "tests/bugs/gamma.md": bug({ Seen: null, Case: A }),
      },
    }),
    (root) => {
      const pages = bugPages(root);
      assert.equal(pages.length, 2, JSON.stringify(pages));
      const [beta, gamma] = pages.sort((x, y) => (x.name < y.name ? -1 : 1));
      assert.equal(beta.name, "beta");
      assert.deepEqual(
        { ...beta.fields },
        { Case: B, Wall: "acceptance", Seen: "2026-09-12", Lane: "build/*" },
      );
      // A field that is not there reads as absent and never as empty: the
      // caller tells them apart to name which one is missing.
      assert.equal(gamma.fields.Seen, undefined);
      assert.equal(gamma.fields.Case, A);
    },
  );
});

test("2. what is wrong with a page", async () => {
  const checkBugs = await need("bugs.mjs", "checkBugs");
  const msg = (root) => checkBugs(root).map((f) => f.message);
  // A whole page over a red case is a finding about nothing. This is the
  // premise the four below rest on.
  tree(whole({ bugs: { "tests/bugs/beta.md": bug() } }), (root) => {
    assert.deepEqual(checkBugs(root), []);
  });
  // Each field, one at a time, because a page missing all four would go red
  // on the first and say nothing about the other three.
  for (const field of ["Case", "Wall", "Seen", "Lane"]) {
    tree(
      whole({ bugs: { "tests/bugs/beta.md": bug({ [field]: null }) } }),
      (root) => {
        const found = checkBugs(root);
        assert.equal(found.length, 1, JSON.stringify(found));
        assert.equal(found[0].kind, "bug");
        assert.equal(found[0].artefact, "bugs/beta");
        assert.match(found[0].message, new RegExp(field, "i"));
      },
    );
  }
  // A lane the config does not hold, named.
  tree(
    whole({ bugs: { "tests/bugs/beta.md": bug({ Lane: "nonesuch/*" }) } }),
    (root) => {
      const found = msg(root);
      assert.equal(found.length, 1, JSON.stringify(found));
      assert.match(found[0], /nonesuch/);
    },
  );
  // A case no suite names, named by its path. A path with no file behind it
  // is the same finding: the suite layer is what says which cases exist.
  tree(
    whole({
      bugs: {
        "tests/bugs/gamma.md": bug({
          Case: "requirements/gamma/acceptance.test.mjs",
        }),
      },
    }),
    (root) => {
      const found = msg(root);
      assert.equal(found.length, 1, JSON.stringify(found));
      assert.match(found[0], /requirements\/gamma\/acceptance\.test\.mjs/);
    },
  );
  // And the same page over a case that passes, which is the only difference
  // from the premise above.
  tree(
    whole({ beta: PASSES, bugs: { "tests/bugs/beta.md": bug() } }),
    (root) => {
      const found = msg(root);
      assert.equal(found.length, 1, JSON.stringify(found));
      assert.match(found[0], /pass|green|clear/i);
    },
  );
});

test("3. the cases held back", async () => {
  const blocked = await need("bugs.mjs", "blocked");
  tree(whole({ bugs: { "tests/bugs/beta.md": bug() } }), (root) => {
    const held = blocked(root);
    assert.ok(held.has(B), `the case a bug is about is not held: ${[...held]}`);
    assert.ok(!held.has(A), `a case no bug is about is held: ${[...held]}`);
  });
  // A page with a finding against it holds nothing back: a bug that is not
  // well formed is not yet a bug, or a page naming a lane nobody has would
  // stop a wall running a case while saying nothing anyone can act on.
  tree(
    whole({ bugs: { "tests/bugs/beta.md": bug({ Lane: "nonesuch/*" }) } }),
    (root) => {
      assert.ok(
        !blocked(root).has(B),
        "a bug with a finding against it held its case back",
      );
    },
  );
  tree(whole({}), (root) => {
    assert.equal(blocked(root).size, 0);
  });
});

test("4. an entry that was not judged", async () => {
  const runJudged = await need("acceptance.mjs", "runJudged");
  const requirement = (n) =>
    `---\ntraces:\n  supersedes: nothing\n---\n\n# Requirement: ${n}\n\n` +
    `## Acceptance criteria\n\n1. It holds.\n\n## Handoff\n\n- Task: ${n}\n- People: none\n`;
  const files = {
    "requirements/alpha/requirement.md": requirement("alpha"),
    "requirements/beta/requirement.md": requirement("beta"),
  };
  // Absence needs a witness: the same call with no bug runs both, so a runner
  // that ran nothing at all cannot pass this.
  tree({ ...whole({}), ...files }, (root) => {
    const r = runJudged([A, B], root);
    assert.equal(r.results.length, 2, JSON.stringify(r.results));
    assert.ok(!r.results.some((x) => x.blocked));
  });
  tree(
    { ...whole({ bugs: { "tests/bugs/beta.md": bug() } }), ...files },
    (root) => {
      const r = runJudged([A, B], root);
      const held = r.results.find((x) => x.blocked);
      assert.ok(held, `no entry was held back: ${JSON.stringify(r.results)}`);
      assert.equal(held.blocked, B);
      // Not judged: no verdict, and absent from the counts and the summary.
      assert.equal(held.label, undefined);
      assert.equal(held.pass, undefined);
      assert.ok(
        r.results.some((x) => x.name === "alpha" && !x.blocked),
        "the case no bug is about was not run",
      );
      assert.match(r.summary, /1 requirement\(s\)/, r.summary);
      assert.equal(r.passed, 1, `the blocked case was counted: ${r.passed}`);
    },
  );
});

test("5. what is blocked, and whose", async () => {
  const { spawnSync } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const kaal = (root) =>
    spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), "bugs", root], {
      encoding: "utf8",
      cwd: root,
      env: { ...process.env, KAAL_BRANCH: "", KAAL_BASE: "" },
    });
  tree(whole({ bugs: { "tests/bugs/beta.md": bug() } }), (root) => {
    const r = kaal(root);
    const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    assert.doesNotMatch(out, /^usage: kaal/m, `no such command: ${out}`);
    assert.equal(r.status, 1, `a standing bug did not refuse: ${out}`);
    const line = out
      .split("\n")
      .find((l) => l.includes(B) && l.includes("build/*"));
    assert.ok(line, `no line names the case and the lane: ${out}`);
  });
  // A tree with no bug says nothing of the kind and exits 0, or the line
  // above is furniture rather than an answer.
  tree(whole({}), (root) => {
    const r = kaal(root);
    const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    assert.doesNotMatch(out, /^usage: kaal/m, `no such command: ${out}`);
    assert.equal(r.status, 0, `a tree with no bug refused: ${out}`);
    assert.ok(!out.includes(B), `a tree with no bug named one: ${out}`);
  });
});
