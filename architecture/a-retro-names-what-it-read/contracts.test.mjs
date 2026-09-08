// Contract tests for drawing a-retro-names-what-it-read. One per seam,
// numbered to match. Each drives one side of a seam and reads the other:
// seams 1 and 2 through the counter's exported functions, seam 3 through
// the command. Fixture roots only, because the league's own counts move
// every time anyone files a retro.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
// The namespace, not the two names. A named import of something the module
// does not export yet fails the whole file to load, and three seams then
// share one red that says nothing about any of them.
import * as counter from "../../bin/lib/retros.mjs";

const countRetros = (root) => {
  assert.equal(typeof counter.countRetros, "function", "no countRetros export");
  return counter.countRetros(root);
};
const readFindings = (root) => {
  assert.equal(
    typeof counter.readFindings,
    "function",
    "no readFindings export",
  );
  return counter.readFindings(root);
};

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const GRAMMAR = join(HERE, "fixtures", "grammar");
// The acceptance fixtures are the ones the criteria were written against.
// A contract reads them too rather than copying the tree twice; a fixture
// duplicated is a fixture that drifts.
const ACC = (n) =>
  join(ROOT, "requirements", "a-retro-names-what-it-read", "fixtures", n);
const rows = (root) =>
  Object.fromEntries(countRetros(root).map((r) => [r.skill, r]));
const kaal = (root) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), "retros", root], {
    encoding: "utf8",
  });

test("1. a row per skill carries two numbers, and the array kind holds", () => {
  const all = countRetros(ACC("mixed"));
  // The kind first: a closed unit test asserts this and it may not move.
  assert.ok(Array.isArray(all), "the counter no longer returns an array");
  const skills = readdirSync(join(ACC("mixed"), "skills")).sort();
  assert.deepEqual(
    all.map((r) => r.skill),
    skills,
    "the rows are not one per skill in sorted order",
  );
  for (const r of all) {
    assert.equal(typeof r.count, "number", `${r.skill} has no count`);
    assert.equal(typeof r.read, "number", `${r.skill} has no read`);
  }
  // And the two numbers are different questions: alpha is fed twice and
  // read never; beta is read once by a retro that feeds it nothing.
  const c = rows(ACC("mixed"));
  assert.equal(c.alpha.count, 2, "alpha's unconsumed count moved");
  assert.equal(c.alpha.read, 0, "a Feeds line was counted as a read");
  assert.equal(c.beta.count, 0, "a read was counted as an unconsumed retro");
  assert.equal(c.beta.read, 1, "beta's read was not counted");
  // A consumed retro's read still counts, or a skill goes quiet on the day
  // another skill's stack is run.
  assert.equal(c.gamma.read, 1, "a consumed retro's read was dropped");
});

test("2. the read line's grammar: two liberties, commas, and nothing at all", () => {
  const c = rows(GRAMMAR);
  // `beta` is named once wrapped in backticks with a trailing period and
  // once plain in a comma separated pair. Both spellings count, because
  // both are what `Feeds:` already accepts and a seat writes what it sees.
  assert.equal(c.beta.read, 2, "a backticked or comma separated name was lost");
  assert.equal(c.gamma.read, 1, "the second name in a pair was lost");
  // A line holding nothing, and no line at all, are zero names.
  assert.equal(c.alpha.read, 0, "an empty or absent line produced a name");
  assert.deepEqual(
    readFindings(GRAMMAR),
    [],
    "a well formed tree produced findings",
  );
  // An unknown name is one finding naming both the retro and the name.
  const bad = readFindings(ACC("unknown"));
  assert.equal(bad.length, 1, `expected one finding, got ${bad.length}`);
  assert.equal(bad[0].retro, "one.md");
  assert.equal(bad[0].name, "delta");
});

test("3. the command's answer: two lines a skill, and a finding is an exit code", () => {
  const clean = kaal(ACC("mixed"));
  assert.equal(clean.status, 0, `refused a clean tree: ${clean.stderr}`);
  const lines = clean.stdout.trim().split("\n");
  const skills = readdirSync(join(ACC("mixed"), "skills")).sort();
  assert.equal(
    lines.length,
    skills.length * 2,
    `expected two lines a skill, got: ${clean.stdout}`,
  );
  // Adjacent and in order, unconsumed first. A reader scanning for a skill
  // finds both its numbers together.
  skills.forEach((s, i) => {
    assert.match(
      lines[i * 2],
      new RegExp(`^${s}: \\d+ unconsumed$`),
      lines[i * 2],
    );
    assert.match(
      lines[i * 2 + 1],
      new RegExp(`^${s}: \\d+ read$`),
      lines[i * 2 + 1],
    );
  });
  // A finding is printed and it is an exit code, which is the only place a
  // finding becomes one.
  const bad = kaal(ACC("unknown"));
  assert.equal(bad.status, 1, `answered instead of finding: ${bad.stdout}`);
  const said = bad.stdout + bad.stderr;
  assert.match(said, /one\.md/, said);
  assert.match(said, /delta/, said);
  // And a tree that is not this league's is still not this tree's question.
  const elsewhere = kaal(join(HERE, "fixtures"));
  assert.equal(
    elsewhere.status,
    2,
    `answered a tree it cannot read: ${elsewhere.stdout}`,
  );
});
