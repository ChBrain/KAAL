// Contract tests for the drawing pointed-elsewhere. One per seam. Blind to
// the renderer and the reader: the tool as a command, on the fixture and on
// a root of records.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RECORDS = join(
  ROOT,
  "requirements",
  "pointed-elsewhere",
  "fixtures",
  "guest-records",
);
const kaal = (args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
const fold = (s) => s.replace(/\s+/g, " ");
const page = (fixture) => {
  const r = kaal(["runner", "analyse", fixture]);
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
};

test("1. the checklist reaches the reader, and judges a guest", () => {
  const doc = page("pointed-elsewhere");
  const start = doc.indexOf("## Prompt 2: the reading");
  const end = doc.indexOf("## The record's frontmatter");
  assert.ok(start !== -1 && end > start, "no reading prompt on the page");
  const reading = fold(doc.slice(start, end));
  assert.match(reading, /which of the two places/i);
  assert.match(reading, /writes nothing/i);
  assert.match(reading, /where the work lands/i);
});

test("2. the procedure is in the header of a fixture that carries a tree, and nowhere else", () => {
  const doc = page("pointed-elsewhere");
  const head = fold(doc.slice(0, doc.indexOf("## Prompt 1")));
  for (const phrase of [
    /copy the tree/i,
    /outside the repository/i,
    /kaal witness/,
    /--against/,
    /a tree that moved fails the run/i,
  ])
    assert.match(head, phrase, "the procedure is not in the header");
  // Never inside a prompt: a model told to copy a tree would try.
  const prompts = fold(doc.slice(doc.indexOf("## Prompt 1")));
  assert.doesNotMatch(
    prompts,
    /copy the tree/i,
    "the procedure is in a prompt",
  );
  // And a fixture with no tree is given none of it.
  assert.doesNotMatch(fold(page("json-flag")), /copy the tree/i);
});

test("3. only a record that says the tree was untouched counts", () => {
  const r = kaal(["ledger", RECORDS]);
  assert.equal(r.status, 1, r.stdout);
  const said = `${r.stdout}\n${r.stderr}`;
  assert.match(said, /1 of 2 fresh models|1 fresh passing model/);
  for (const dropped of ["beta.md", "gamma.md"]) {
    const line = said
      .split("\n")
      .find((l) => l.includes(dropped) && /witness/i.test(l));
    assert.ok(line, `${dropped} was not named for its witness: ${said}`);
  }
  assert.doesNotMatch(said, /alpha\.md is/, "the clean record was dropped");
});
