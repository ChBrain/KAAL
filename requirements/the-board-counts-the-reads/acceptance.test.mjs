// Acceptance tests for requirement the-board-counts-the-reads. One per
// criterion. Surface only: what `kaal retros` prints and exits with, and
// the text of `kaal.config.json` and `SURFACE.md`. Driven on the fixture
// trees beside `a-retro-names-what-it-read`, which are the trees these
// criteria were written against, never on the league's own, whose counts
// move whenever anyone files a retro.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIX = (n) =>
  join(ROOT, "requirements", "a-retro-names-what-it-read", "fixtures", n);
const kaal = (...args) =>
  spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "retros", ...args],
    {
      encoding: "utf8",
    },
  );
// The board's own form: no root, the flag first, the tree underfoot.
// Passing a root takes a different path through applicability, and the
// first version of this file only ever passed one, so the invocation the
// wall actually makes was the one nothing tested.
const inTree = (dir, ...args) =>
  spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "retros", ...args],
    { encoding: "utf8", cwd: dir },
  );
const surface = () => readFileSync(join(ROOT, "SURFACE.md"), "utf8");
const entry = () => {
  const m = surface().match(/^## retros\n([\s\S]*?)(?=^## )/m);
  assert.ok(m, "the surface page has no retros entry");
  return m[1].replace(/\s+/g, " ");
};

test("1. the check is silent on a tree whose read lines all name a skill", () => {
  for (const r of [
    kaal(FIX("mixed"), "--check"),
    inTree(FIX("mixed"), "--check"),
  ]) {
    assert.equal(r.status, 0, `refused a clean tree: ${r.stdout}${r.stderr}`);
    assert.equal(
      r.stdout.trim(),
      "",
      `the check printed on a clean tree: ${r.stdout}`,
    );
  }
});

test("2. the check names every unresolvable read line, and exits 1", () => {
  const bare = inTree(FIX("unknown"), "--check");
  assert.equal(
    bare.status,
    1,
    `the board's own form did not find it: ${bare.stdout}${bare.stderr}`,
  );
  const r = kaal(FIX("unknown"), "--check");
  assert.equal(r.status, 1, `answered instead of finding: ${r.stdout}`);
  const said = r.stdout + r.stderr;
  assert.match(said, /one\.md/, `the retro is not named: ${said}`);
  assert.match(said, /delta/, `the unknown name is not named: ${said}`);
  // The counts are not the check's business: a wall that prints twelve
  // lines of numbers it does not judge is noise on the board.
  assert.doesNotMatch(
    said,
    /unconsumed|\d+ read/,
    `the check printed counts: ${said}`,
  );
});

test("3. the bare command keeps its lines and its three exit codes", () => {
  const clean = kaal(FIX("mixed"));
  assert.equal(clean.status, 0, clean.stderr);
  assert.match(clean.stdout, /^alpha: \d+ unconsumed$/m, clean.stdout);
  assert.match(clean.stdout, /^alpha: \d+ read$/m, clean.stdout);
  const bad = kaal(FIX("unknown"));
  assert.equal(bad.status, 1, `a finding no longer exits 1: ${bad.stdout}`);
  assert.match(bad.stdout, /^alpha: \d+ unconsumed$/m, bad.stdout);
  // A tree that is not this league's is still not this tree's question.
  const elsewhere = kaal(join(ROOT, "requirements"));
  assert.equal(
    elsewhere.status,
    2,
    `answered a tree it cannot read: ${elsewhere.stdout}`,
  );
});

test("4. the board carries a wall that runs the check", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "kaal.config.json"), "utf8"));
  assert.ok(Array.isArray(cfg.gates), "the config has no gates");
  const gate = cfg.gates.find(
    (g) => /\bretros\b/.test(g.command) && /--check/.test(g.command),
  );
  assert.ok(
    gate,
    `no gate runs the check: ${cfg.gates.map((g) => g.name).join(", ")}`,
  );
  assert.ok(gate.name, "the gate has no name");
  assert.ok(gate.fix, "the gate has no fix");
  // The fix says what to do, not that something is wrong.
  assert.match(
    gate.fix,
    /read|skill|name/i,
    `the fix does not name the read line: ${gate.fix}`,
  );
});

test("5. the surface page describes the command that exists", () => {
  const e = entry();
  // What it answers is the entry's opening sentence, not any sentence in
  // it: `read` appears further down for other reasons, and a match over the
  // whole entry was green with the answer itself deleted.
  const answers = e.split(/(?<=\.)\s+/)[0];
  assert.match(
    answers,
    /consum/i,
    `the unconsumed count is not answered: ${answers}`,
  );
  assert.match(
    answers,
    /\bread(s)?\b/i,
    `the read count is not answered: ${answers}`,
  );
  // A read is never an unconsumed retro, which is the whole reason the two
  // numbers are two numbers.
  assert.match(
    e,
    /never|not counted|nor is|does not/i,
    `a read is not told apart from an unconsumed retro: ${e}`,
  );
  // Archiving: true of one count and false of the other, which is what the
  // page got wrong by saying it of the command.
  const archiving = e
    .split(/(?<=\.)\s+/)
    .filter((s) => /archiv/i.test(s))
    .join(" ");
  assert.ok(archiving, `archiving is not mentioned: ${e}`);
  // `archiv` and `read` both appear in the sentence about the rule of ten,
  // so a sentence holding the pair is not a sentence holding the rule.
  assert.match(
    archiving,
    /\bread\b/i,
    `what archiving does to a read is not said: ${archiving}`,
  );
  assert.match(
    archiving,
    /remove|removes|drop|drops|loses|no longer/i,
    `that archiving takes the read away is not said: ${archiving}`,
  );
  // Three codes, since the command grew one.
  assert.match(e, /Exits 0, 1 (and|or) 2/i, `the exit codes are wrong: ${e}`);
});
