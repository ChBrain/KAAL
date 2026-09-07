// Contract tests for the drawing nothing-passes-vacuously. One per seam.
// Blind to the table: the tool as a command, on a foreign tree, on a tree
// that adopted one question, and on the league.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FOREIGN = join(
  ROOT,
  "requirements",
  "applies-here",
  "fixtures",
  "foreign",
);
const CONFIG_ONLY = join(
  ROOT,
  "requirements",
  "nothing-passes-vacuously",
  "fixtures",
  "config-only",
);
const HALF = join(ROOT, "architecture", "applies-here", "fixtures", "half");
const CLEAN = join(
  ROOT,
  "requirements",
  "assess-boundary",
  "fixtures",
  "clean-assess",
);
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
// All eight, as a caller types them: the four applies-here guarded and the
// four this task brings in.
const EIGHT = [
  ["ledger"],
  ["drawings"],
  ["check"],
  ["agents"],
  ["retros"],
  ["boundary"],
  ["runner", "--check"],
  ["gates"],
];
const name = (args) => args[0];

test("1. the table grew and did not move: eight refuse a foreign tree and answer the league", () => {
  assert.equal(EIGHT.length, 8);
  for (const args of EIGHT)
    assert.equal(
      kaal(args, FOREIGN).status,
      2,
      `${name(args)} answered a foreign tree`,
    );
  // The league answers seven of them here. `gates` on the league runs the
  // whole board, which runs this file, so no test may drive it: its answer
  // is proved on a root that holds a config, below, and on every board run.
  for (const args of EIGHT.filter((a) => a[0] !== "gates")) {
    const r = kaal(args, ROOT);
    assert.equal(r.status, 0, `${name(args)} refused the league: ${r.stderr}`);
  }
  // A tree that adopted one question: the config is the gates question and
  // nobody else's.
  const gates = kaal(["gates"], CONFIG_ONLY);
  assert.equal(gates.status, 0, gates.stdout + gates.stderr);
  for (const args of [["retros"], ["boundary"], ["runner", "--check"]])
    assert.equal(
      kaal(args, CONFIG_ONLY).status,
      2,
      `${name(args)} answered a tree holding only a config`,
    );
});

test("2. the reason to the caller, and a skill name is not a path", () => {
  for (const args of [
    ["retros"],
    ["boundary"],
    ["runner", "--check"],
    ["gates"],
  ]) {
    const r = kaal(args, FOREIGN);
    assert.equal(r.status, 2);
    assert.equal(r.stdout, "", `${name(args)} wrote to stdout`);
    const lines = r.stderr.trim().split("\n");
    assert.equal(lines.length, 1, `${name(args)}: ${r.stderr}`);
    assert.match(
      lines[0],
      new RegExp(`^${name(args)}: not applicable here: \\S`),
      lines[0],
    );
  }
  // The one a table like this gets wrong: the runner's first argument is a
  // skill, so a reason naming a directory called "analyse" is a plausible lie.
  const r = kaal(["runner", "analyse", "json-flag"], FOREIGN);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.doesNotMatch(r.stderr, /analyse[/\\]/, r.stderr);
  assert.doesNotMatch(r.stderr, /[/\\]analyse\b/, r.stderr);
});

test("3. a root given as an argument beats the working directory", () => {
  const retros = kaal(["retros", HALF]);
  assert.equal(retros.status, 0, retros.stderr);
  assert.match(retros.stdout, /^x: 0 unconsumed$/m);
  assert.doesNotMatch(retros.stdout, /^analyse:/m, "it read the league");
  const boundary = kaal(["boundary", CLEAN]);
  assert.equal(boundary.status, 0, boundary.stderr);
  const gates = kaal(["gates", CONFIG_ONLY]);
  assert.equal(gates.status, 0, gates.stdout + gates.stderr);
  assert.match(gates.stdout, /nothing/);
  assert.doesNotMatch(gates.stdout, /acceptance/, "it ran the league's board");
});
