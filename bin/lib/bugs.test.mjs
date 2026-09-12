// Units beside `bugs.mjs`: the behaviour below the seams a contract reads.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { bugPages, blocked, checkBugs, standing, BUGS } from "./bugs.mjs";

const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};
const scratch = (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-bugs-u-"));
  try {
    put(root, files);
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
const page = (lines) =>
  `---\ntraces:\n  parent: strategy\n---\n\n# Bug: a case is red\n\n${lines}\n`;

test("BUGS sits beside the runs and not inside them", () => {
  // The strategy names five kinds and each is a place of its own. A bug under
  // `tests/runs/` would be read by the runs reader as a record of a pass.
  assert.equal(BUGS, join("tests", "bugs"));
});

test("bugPages answers nothing where the place is not there", () => {
  // The fifth kind is a place a tree may not have yet. A reader that threw
  // here would make it mandatory the day it was built, and every wall that
  // asks would be red on a tree that has simply never filed one.
  scratch({}, (root) => assert.deepEqual(bugPages(root), []));
  scratch({ "tests/runs/x.md": "# Run\n" }, (root) =>
    assert.deepEqual(bugPages(root), []),
  );
});

test("bugPages reads only markdown, and names a page by its file", () => {
  scratch(
    {
      "tests/bugs/beta.md": page("- Case: a\n- Wall: w\n- Seen: d\n- Lane: l"),
      "tests/bugs/notes.txt": "- Case: b\n",
      "tests/bugs/alpha.md": page("- Case: b\n- Wall: w\n- Seen: d\n- Lane: l"),
    },
    (root) => {
      // Sorted, so two runs over one tree answer the same order and a caller
      // that prints them prints them the same way twice.
      assert.deepEqual(
        bugPages(root).map((b) => b.name),
        ["alpha", "beta"],
      );
    },
  );
});

test("a field is read from its own line and never from another's value", () => {
  // A page whose prose mentions a field name is not a page carrying it, and a
  // value carrying a colon is read whole. The separator is a space or a tab
  // and never a line, which is the bug that ate a plan page.
  scratch(
    {
      "tests/bugs/beta.md": page(
        "- Case: requirements/a/acceptance.test.mjs\n" +
          "- Wall: acceptance\n" +
          "- Seen: 2026-09-12\n" +
          "- Lane: build/*\n\n" +
          "The Lane: above is the one that owns it.",
      ),
    },
    (root) => {
      const [b] = bugPages(root);
      assert.equal(b.fields.Case, "requirements/a/acceptance.test.mjs");
      assert.equal(b.fields.Lane, "build/*");
      assert.equal(b.fields.Seen, "2026-09-12");
    },
  );
  // A field that is not there is absent and never empty: the caller tells the
  // two apart to name which one a page lacks.
  scratch(
    { "tests/bugs/beta.md": page("- Case: a\n- Wall: w\n- Lane: l") },
    (root) => {
      const [b] = bugPages(root);
      assert.equal(b.fields.Seen, undefined);
      assert.ok("Seen" in b.fields, "the field is not even asked for");
    },
  );
  // And a field whose line is empty is absent too, rather than carrying
  // whatever is written under it. This is what the separator being a space
  // and never a line buys: `\s` crosses one, and a reader that let it would
  // answer `- Lane: l` as the value of `Seen`, which is the shape of the bug
  // that ate a plan page.
  scratch(
    { "tests/bugs/beta.md": page("- Case: a\n- Wall: w\n- Seen:\n- Lane: l") },
    (root) => {
      const [b] = bugPages(root);
      assert.equal(b.fields.Seen, undefined);
      assert.equal(b.fields.Lane, "l");
    },
  );
});

test("a page with no config answers one finding and not four", () => {
  // A config that does not parse, or is not there, is the rules wall's
  // finding. Answering no lanes here is right and it must not cascade: the
  // page is judged on the lane it names, once.
  scratch(
    {
      "tests/bugs/beta.md": page("- Case: a\n- Wall: w\n- Seen: d\n- Lane: l"),
    },
    (root) => {
      const f = checkBugs(root);
      assert.equal(f.length, 1, JSON.stringify(f));
      assert.match(f[0].message, /which no lane in kaal\.config\.json holds/);
    },
  );
});

test("what is held back and what is printed agree, page for page", () => {
  // The board prints one and the runner reads the other, and a tree where
  // they disagreed would report a case as blocked while running it, or run a
  // case nobody was told about.
  const good = page(
    "- Case: requirements/a/acceptance.test.mjs\n- Wall: acceptance\n- Seen: d\n- Lane: build/*",
  );
  const bad = page(
    "- Case: requirements/b/acceptance.test.mjs\n- Wall: acceptance\n- Seen: d",
  );
  scratch(
    {
      "kaal.config.json": JSON.stringify({
        lanes: [{ pattern: "build/*", seat: "developer", allows: [] }],
      }),
      "tests/suites/acceptance.md":
        "---\ntraces:\n  parent: strategy\ncases:\n  requirements/a/acceptance.test.mjs: x\n  requirements/b/acceptance.test.mjs: y\n---\n\n# Test suite: acceptance\n",
      "requirements/a/acceptance.test.mjs":
        "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\ntest('1. red', () => assert.equal(1, 2));\n",
      "requirements/b/acceptance.test.mjs":
        "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\ntest('1. red', () => assert.equal(1, 2));\n",
      "tests/bugs/a.md": good,
      "tests/bugs/b.md": bad,
    },
    (root) => {
      assert.equal(blocked(root).size, 1);
      assert.equal(standing(root).length, 1);
      assert.ok(blocked(root).has("requirements/a/acceptance.test.mjs"));
      assert.ok(
        standing(root)[0].includes("requirements/a/acceptance.test.mjs"),
      );
      // And the page that is not well formed is the one finding, so nothing
      // is both held back and complained about.
      assert.deepEqual(
        checkBugs(root).map((f) => f.artefact),
        ["bugs/b"],
      );
    },
  );
});
