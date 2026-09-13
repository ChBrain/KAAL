import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import {
  readPeople,
  requirementFor,
  judge,
  runAcceptance,
  expand,
  runJudged,
} from "./acceptance.mjs";

const F = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "requirements",
  "status-v1",
  "fixtures",
);
const f = (n) => join(F, n, "acceptance.test.mjs");
const P = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "architecture",
  "a-task-names-its-people",
  "fixtures",
);

const tempTree = (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-acceptance-c-"));
  try {
    for (const [rel, text] of Object.entries(files)) {
      const p = join(root, ...rel.split("/"));
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, text);
    }
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

const config = JSON.stringify(
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

const suite = `---\ntraces:\n  parent: strategy\ncases:\n  requirements/alpha/acceptance.test.mjs: nothing\n  requirements/beta/acceptance.test.mjs: nothing\n---\n\n# Test suite: acceptance\n`;
const passes = "import { test } from 'node:test';\ntest('1. it holds', () => {});\n";
const fails =
  "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\n" +
  "test('1. it does not hold', () => assert.equal(1, 2));\n";
const requirement = (name) =>
  `---\ntraces:\n  supersedes: nothing\n---\n\n# Requirement: ${name}\n\n## Acceptance criteria\n\n1. It holds.\n\n## Handoff\n\n- Task: ${name}\n- People: none\n`;
const bug = `---\ntraces:\n  parent: strategy\n---\n\n# Bug: a case is red\n\n- Case: requirements/beta/acceptance.test.mjs\n- Wall: acceptance\n- Seen: 2026-09-12\n- Lane: build/*\n`;

test("requirementFor: an acceptance test's sibling, a drawing's task under requirements/", () => {
  assert.equal(
    requirementFor(
      join(P, "people-none", "requirements", "t", "acceptance.test.mjs"),
    ),
    join(P, "people-none", "requirements", "t", "requirement.md"),
  );
  assert.equal(
    requirementFor(
      join(P, "people-none", "architecture", "t", "contracts.test.mjs"),
    ),
    join(
      P,
      "people-none",
      "architecture",
      "t",
      "..",
      "..",
      "requirements",
      "t",
      "requirement.md",
    ),
  );
});

test("readPeople reads the People line's value from the test's requirement, and null when absent", () => {
  assert.equal(
    readPeople(
      join(P, "people-none", "requirements", "t", "acceptance.test.mjs"),
    ),
    "none",
  );
  assert.equal(
    readPeople(
      join(P, "people-none", "architecture", "t", "contracts.test.mjs"),
    ),
    "none",
  );
  assert.equal(
    readPeople(
      join(P, "no-people", "requirements", "t", "acceptance.test.mjs"),
    ),
    null,
  );
  assert.equal(
    readPeople(join(P, "orphan", "architecture", "t", "contracts.test.mjs")),
    null,
  );
});

test("judge: no people line is a verdict of its own, and it comes first", () => {
  // The people question is presence and never meaning, and it outranks the
  // verdict: a Handoff that has not answered it has not been read yet.
  const green = { word: "delivered", ok: true };
  assert.match(judge(green, null).label, /^FAIL no people line/);
  assert.equal(judge(green, null).ok, false);
  assert.equal(judge(green, "none").ok, true);
  assert.equal(
    judge(
      { word: "not delivered", ok: true },
      "the data, its record, erased on request",
    ).ok,
    true,
  );
});

test("judge carries the verdict's own word into the label a reader sees", () => {
  for (const [word, ok, head] of [
    ["delivered", true, "ok"],
    ["not delivered", true, "ok"],
    ["regressed", false, "FAIL"],
    ["nothing ran", false, "FAIL"],
  ]) {
    const v = judge({ word, ok }, "none");
    assert.equal(v.ok, ok, `${word} was judged ${v.ok}`);
    assert.match(v.label, new RegExp(`^${head}`), `${word} reads ${v.label}`);
    // The word itself, not a paraphrase: the board's line is where a reader
    // learns which of the four this is.
    assert.ok(v.label.includes(word), `${word} is not in ${v.label}`);
  }
});

test("runJudged keeps a blocked case blocked on Windows-style paths", () => {
  tempTree(
    {
      "kaal.config.json": config,
      "requirements/alpha/requirement.md": requirement("alpha"),
      "requirements/beta/requirement.md": requirement("beta"),
      "requirements/alpha/acceptance.test.mjs": passes,
      "requirements/beta/acceptance.test.mjs": fails,
      "tests/suites/acceptance.md": suite,
      "tests/bugs/beta.md": bug,
    },
    (root) => {
      const out = runJudged(["requirements/*/acceptance.test.mjs"], root);
      assert.equal(out.results.length, 2, JSON.stringify(out.results));
      assert.ok(out.results.some((x) => x.blocked === "requirements/beta/acceptance.test.mjs"), JSON.stringify(out.results));
      assert.ok(
        out.lines.some(
          (line) =>
            line.includes("requirements/beta/acceptance.test.mjs") &&
            /not run|blocked/i.test(line),
        ),
        JSON.stringify(out.lines),
      );
    },
  );
});
