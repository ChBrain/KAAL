// Acceptance tests for requirement a-task-is-delivered-by-its-run. One per
// criterion. Surface only: the requirement pages as text, `kaal acceptance`
// and the recording command on fixture roots, and the run records they read.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
  mkdtempSync,
  cpSync,
  rmSync,
  globSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = (n) => join(HERE, "fixtures", n);
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
  });
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout}${r.stderr}`;
const notUsage = (out) =>
  assert.doesNotMatch(
    out,
    /^usage: kaal/m,
    `the command does not exist: ${out}`,
  );
// A fixture is copied before it is run against, because recording writes.
const copy = (name, fn) => {
  const to = mkdtempSync(join(tmpdir(), "kaal-run-"));
  cpSync(F(name), to, { recursive: true });
  try {
    return fn(to);
  } finally {
    rmSync(to, { recursive: true, force: true });
  }
};
const suites = (root) =>
  globSync("requirements/*/acceptance.test.mjs", { cwd: root });
// Inside the runner, which marks every wall with KAAL_GATES=1, this run is
// itself the wall's answer about this tree, and spawning the wall again from
// here would run all 59 suites a second time inside one of them.
const INSIDE = process.env.KAAL_GATES === "1";
const records = (root) =>
  existsSync(join(root, "tests", "runs"))
    ? readdirSync(join(root, "tests", "runs")).filter((n) => n.endsWith(".md"))
    : [];

test("1. no requirement carries a status line, and no wall reads one", () => {
  const carrying = globSync("requirements/*/requirement.md", {
    cwd: ROOT,
  }).filter((rel) => /^- Status:/m.test(readFileSync(join(ROOT, rel), "utf8")));
  assert.deepEqual(
    carrying,
    [],
    `these pages still declare a status: ${carrying.join(", ")}`,
  );
  // And the wall does not ask for one: a tree of pages carrying none answers
  // rather than refusing, which is the half a sweep of this tree cannot show.
  const r = kaal(
    "acceptance",
    join(F("delivered"), "requirements/*/acceptance.test.mjs"),
  );
  const out = said(r);
  notUsage(out);
  assert.doesNotMatch(
    out,
    /no status/i,
    `the wall still asks for a status: ${out}`,
  );
});

test("2. a run record names its task, its suite, when it ran, that suite's sha and its counts", () => {
  // Read from a record the tool wrote, never from the one in the fixture:
  // a fixture I wrote to match the shape I am asserting proves my typing.
  copy("nothing-ran", (root) => {
    writeFileSync(
      join(root, "requirements", "alpha", "acceptance.test.mjs"),
      'import { test } from "node:test";\ntest("1. it holds", () => {});\n',
    );
    const w = kaal("runs", root, "--write");
    notUsage(said(w));
    const kept = records(root);
    assert.equal(
      kept.length,
      1,
      `the tool wrote ${kept.length} records: ${said(w)}`,
    );
    const text = readFileSync(join(root, "tests", "runs", kept[0]), "utf8");
    for (const [what, re] of [
      ["the task", /^- Task: alpha$/m],
      ["the suite", /^- Suite: \S+\.test\.mjs$/m],
      ["when it ran", /^- Ran: \d{4}-\d{2}-\d{2}/m],
      ["the suite's sha", /^- Suite sha: [0-9a-f]{64}$/m],
      ["what passed", /^- Passing: 1$/m],
      ["what failed", /^- Failing: 0$/m],
    ])
      assert.match(text, re, `the record does not name ${what}: ${text}`);
  });
});

test("3. the wall reports delivered, not delivered, regressed or nothing ran", () => {
  const seen = new Map();
  for (const [fixture, word] of [
    ["delivered", /delivered/],
    ["not-delivered", /not delivered/],
    ["regressed", /regressed/],
    ["nothing-ran", /nothing ran/],
  ]) {
    const r = kaal(
      "acceptance",
      join(F(fixture), "requirements/*/acceptance.test.mjs"),
    );
    const out = said(r);
    notUsage(out);
    assert.match(out, word, `${fixture} did not report ${word}: ${out}`);
    seen.set(fixture, out);
  }
  // Four verdicts and not one word doing duty for two: `delivered` is a
  // substring of `not delivered`, so the two must be told apart on purpose.
  assert.doesNotMatch(
    seen.get("delivered"),
    /not delivered/,
    `a delivered task read as not delivered: ${seen.get("delivered")}`,
  );
});

test("4. regressed and nothing ran fail; not delivered is reported and passes", () => {
  for (const [fixture, code] of [
    ["delivered", 0],
    ["not-delivered", 0],
    ["regressed", 1],
    ["nothing-ran", 1],
  ]) {
    const r = kaal(
      "acceptance",
      join(F(fixture), "requirements/*/acceptance.test.mjs"),
    );
    notUsage(said(r));
    assert.equal(r.status, code, `${fixture} exited ${r.status}: ${said(r)}`);
  }
});

test("5. a record is written by a flag, records only what is green, and no wall writes one", () => {
  copy("not-delivered", (root) => {
    assert.deepEqual(records(root), [], "the fixture already holds a record");
    // A wall runs and writes nothing.
    kaal("acceptance", join(root, "requirements/*/acceptance.test.mjs"));
    assert.deepEqual(records(root), [], "the wall wrote a record");
    const w = kaal("runs", root, "--write");
    const out = said(w);
    notUsage(out);
    // Its one suite is red, so there is nothing green to record.
    assert.deepEqual(
      records(root),
      [],
      `a red suite was recorded as a run: ${records(root)}`,
    );
  });
  copy("nothing-ran", (root) => {
    // A tree with a green suite records it, which is the other half.
    writeFileSync(
      join(root, "requirements", "alpha", "acceptance.test.mjs"),
      'import { test } from "node:test";\ntest("1. it holds", () => {});\n',
    );
    const w = kaal("runs", root, "--write");
    notUsage(said(w));
    assert.equal(
      records(root).length,
      1,
      `recorded ${records(root).length} runs`,
    );
  });
});

test("6. a record whose suite moved is stale, and a red suite then reads not delivered", () => {
  const r = kaal(
    "acceptance",
    join(F("stale"), "requirements/*/acceptance.test.mjs"),
  );
  const out = said(r);
  notUsage(out);
  assert.match(out, /stale/i, `the record is not called stale: ${out}`);
  assert.doesNotMatch(
    out,
    /regressed/,
    `a stale record proved a regression: ${out}`,
  );
  assert.equal(r.status, 0, `a stale record failed the wall: ${out}`);
});

test("7. on this tree the board answers what it answers today", (c) => {
  // Outside the runner the wall is spawned once over this tree. Inside it,
  // this suite is one of the 59 the wall is already running, and asking it
  // to run them again is the recursion `gates-v1` named and guarded.
  if (INSIDE) return c.skip("inside the runner: this run is the wall's answer");
  const r = kaal("acceptance", "requirements/*/acceptance.test.mjs");
  const out = said(r);
  notUsage(out);
  // Nothing on this tree is a regression or a suite that ran nothing. The two
  // tasks that are red today read as not delivered, which is what they are.
  const bad = (out.match(/regressed|nothing ran/g) ?? []).length;
  assert.equal(
    bad,
    0,
    `this tree reports ${bad} failures it did not have: ${out}`,
  );
  const lined = (out.match(/^\s*(delivered|not delivered)/gm) ?? []).length;
  assert.equal(
    lined,
    suites(ROOT).length,
    `the wall lined up ${suites(ROOT).length} suites and reported ${lined}: ${out}`,
  );
  assert.equal(r.status, 0, `the wall failed on this tree: ${out}`);
});
