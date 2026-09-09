// Contract tests for drawing a-task-is-delivered-by-its-run. One per seam,
// numbered to match. Each drives its seam's own function; the fixture roots
// are the analyst's, beside the requirement, because a verdict is a verdict
// whichever seat is asking and building a second set would be two truths.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  mkdtempSync,
  cpSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = (n) =>
  join(ROOT, "requirements", "a-task-is-delivered-by-its-run", "fixtures", n);
// Imported inside each seam: a namespace import at the top saves a missing
// export, not a module that fails to load, and one absent file would share
// its red across all five.
const need = async (file, name) => {
  const mod = await import(`../../bin/lib/${file}`);
  assert.ok(mod[name], `no ${name} export from ${file}`);
  return mod[name];
};
const copy = (name, fn) => {
  const to = mkdtempSync(join(tmpdir(), "kaal-verdict-"));
  cpSync(F(name), to, { recursive: true });
  try {
    return fn(to);
  } finally {
    rmSync(to, { recursive: true, force: true });
  }
};
const records = (root) =>
  existsSync(join(root, "tests", "runs"))
    ? readdirSync(join(root, "tests", "runs")).filter((n) => n.endsWith(".md"))
    : [];
const suite = (root) =>
  join(root, "requirements", "alpha", "acceptance.test.mjs");

test("1. the record: a task's run read back as its fields, and a field missing is no record", async () => {
  const readRun = await need("runs.mjs", "readRun");
  const got = readRun(F("delivered"), "alpha");
  assert.ok(got, "the delivered fixture's record read as nothing");
  assert.equal(got.task, "alpha");
  assert.match(got.suite, /requirements\/alpha\/acceptance\.test\.mjs$/);
  assert.match(String(got.sha), /^[0-9a-f]{64}$/);
  assert.equal(got.passing, 1);
  assert.equal(got.failing, 0);
  // A task with no record answers nothing, which is different from a record
  // that is unreadable, and a caller must be able to tell them apart.
  assert.equal(readRun(F("not-delivered"), "alpha"), null);
  copy("delivered", (root) => {
    const p = join(root, "tests", "runs", "alpha.md");
    writeFileSync(p, readFileSync(p, "utf8").replace(/^- Suite sha: .*$/m, ""));
    const partial = readRun(root, "alpha");
    assert.ok(
      partial === null || partial.why,
      `a record missing a field read as a record: ${JSON.stringify(partial)}`,
    );
  });
});

test("2. the freshness: a record is about the suite as it stands, read from its sha", async () => {
  const isFresh = await need("runs.mjs", "isFresh");
  const readRun = await need("runs.mjs", "readRun");
  assert.equal(
    isFresh(F("delivered"), readRun(F("delivered"), "alpha")),
    true,
    "a record of the suite as it stands read as stale",
  );
  // The stale fixture records a pass against text the suite no longer holds.
  assert.equal(
    isFresh(F("stale"), readRun(F("stale"), "alpha")),
    false,
    "a record against changed text read as fresh",
  );
  // A record whose suite is gone is not fresh either, and does not throw.
  copy("delivered", (root) => {
    rmSync(suite(root));
    assert.equal(isFresh(root, readRun(root, "alpha")), false);
  });
});

test("3. the verdict: four inputs, four words, one each, and only two of them fail", async () => {
  const verdict = await need("runs.mjs", "verdict");
  const readRun = await need("runs.mjs", "readRun");
  const WORDS = ["delivered", "not delivered", "regressed", "nothing ran"];
  const seen = [];
  for (const [fixture, pass, fail, want, ok] of [
    ["delivered", 1, 0, "delivered", true],
    ["not-delivered", 0, 1, "not delivered", true],
    ["regressed", 0, 1, "regressed", false],
    ["nothing-ran", 0, 0, "nothing ran", false],
    ["stale", 0, 1, "not delivered", true],
    // Green and never recorded: the coder has claimed and the tester has not
    // yet proved, which is the honest state between the two acts.
    ["not-delivered", 1, 0, "not delivered", true],
  ]) {
    const v = verdict(F(fixture), readRun(F(fixture), "alpha"), pass, fail);
    assert.ok(v && v.word, `${fixture} gave no verdict: ${JSON.stringify(v)}`);
    assert.equal(
      v.word,
      want,
      `${fixture} at ${pass}/${fail} read as ${v.word}`,
    );
    assert.equal(
      v.ok,
      ok,
      `${fixture} was ${ok ? "failed" : "passed"} and should not be`,
    );
    seen.push(v.word);
  }
  // One word each and no word standing in for another: `delivered` is a
  // substring of `not delivered`, so the table is read by equality.
  assert.deepEqual([...new Set(seen)].sort(), [...WORDS].sort());
  // And the stale one says so, which is what tells a reader why a record
  // they can see did not count.
  const v = verdict(F("stale"), readRun(F("stale"), "alpha"), 0, 1);
  assert.match(
    String(v.why ?? ""),
    /stale/i,
    `nothing says the record is stale: ${JSON.stringify(v)}`,
  );
});

test("4. the writing: green is recorded, red is not, and the record is fresh after", async () => {
  const writeRuns = await need("runs.mjs", "writeRuns");
  const readRun = await need("runs.mjs", "readRun");
  const isFresh = await need("runs.mjs", "isFresh");
  copy("not-delivered", (root) => {
    assert.deepEqual(writeRuns(root), [], "a red suite was recorded");
    assert.deepEqual(
      records(root),
      [],
      `a red suite left a record: ${records(root)}`,
    );
  });
  copy("nothing-ran", (root) => {
    writeFileSync(
      suite(root),
      'import { test } from "node:test";\ntest("1. it holds", () => {});\n',
    );
    assert.deepEqual(
      writeRuns(root),
      ["alpha"],
      "a green suite was not recorded",
    );
    const got = readRun(root, "alpha");
    assert.ok(got, "the writer wrote a record the reader cannot read");
    // Written against the suite as it stands, or the record is stale the
    // moment it is made.
    assert.equal(
      isFresh(root, got),
      true,
      "the record it wrote was already stale",
    );
    assert.equal(got.passing, 1);
    assert.equal(got.failing, 0);
  });
});

test("5. the walls: both judge from the record, and neither can read a status", async () => {
  const acceptance = await import("../../bin/lib/acceptance.mjs");
  // The readers of the field are gone, which is the half a fixture cannot
  // show: a wall that still holds one would still consult a page.
  assert.equal(
    acceptance.readStatus,
    undefined,
    "acceptance.mjs still exports a reader for the status field",
  );
  assert.equal(
    acceptance.statusForDrawing,
    undefined,
    "acceptance.mjs still exports a status reader for drawings",
  );
  // And the verdict a wall reports comes from the record. The delivered
  // fixture carries one and its page carries no status at all.
  const one = acceptance.runAcceptance([
    join(F("delivered"), "requirements", "alpha", "acceptance.test.mjs"),
  ]);
  const row = one.results?.[0] ?? one[0];
  assert.ok(row, `the wall reported nothing: ${JSON.stringify(one)}`);
  // The line a reader of the board sees, not any field that happens to
  // carry the word. Reading the whole row passed on a leftover the wall
  // never prints, and the break that should have caught it caught nothing.
  assert.ok(
    (one.lines ?? []).some((l) => /\bdelivered\b/.test(l)),
    `no line of the board says delivered: ${JSON.stringify(one.lines)}`,
  );
  assert.match(
    String(row.label ?? ""),
    /\bdelivered\b/,
    `the wall's verdict does not carry the word: ${JSON.stringify(row)}`,
  );
  assert.doesNotMatch(
    readFileSync(
      join(F("delivered"), "requirements", "alpha", "requirement.md"),
      "utf8",
    ),
    /^- Status:/m,
    "the fixture page carries a status, so this proves nothing",
  );
});
