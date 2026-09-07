// Acceptance tests for requirement nothing-passes-vacuously. One per
// criterion. Surface only: the four commands, on trees that hold none, some
// and all of what they read.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FOREIGN = join(
  ROOT,
  "requirements",
  "applies-here",
  "fixtures",
  "foreign",
);
const CONFIG_ONLY = join(HERE, "fixtures", "config-only");
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
// The four that read the working directory, as a caller types them.
const FOUR = [["retros"], ["boundary"], ["runner", "--check"], ["gates"]];
const name = (args) => args[0];

test("1. on a tree that holds none of what they read, all four say so on exit 2", () => {
  for (const args of FOUR) {
    const r = kaal(args, FOREIGN);
    assert.equal(r.status, 2, `${name(args)}: ${r.stdout}${r.stderr}`);
    assert.equal(r.stdout, "", `${name(args)} wrote to stdout`);
    const lines = r.stderr.trim().split("\n");
    assert.equal(lines.length, 1, `${name(args)}: ${r.stderr}`);
    assert.match(
      lines[0],
      new RegExp(`^${name(args)}: not applicable here: \\S`),
      lines[0],
    );
  }
});

test("2. applicability is per command: a config alone answers one of the four", () => {
  const gates = kaal(["gates"], CONFIG_ONLY);
  assert.equal(gates.status, 0, gates.stdout + gates.stderr);
  for (const args of FOUR.filter((a) => a[0] !== "gates")) {
    const r = kaal(args, CONFIG_ONLY);
    assert.equal(
      r.status,
      2,
      `${name(args)} answered a tree with only a config`,
    );
  }
  // Three on the league. `gates` there runs the whole board, which runs this
  // file, so no test may drive it; its answer is the run above, on a tree
  // that holds a config, and every board run the repository makes.
  for (const args of FOUR.filter((a) => a[0] !== "gates")) {
    const r = kaal(args, ROOT);
    assert.equal(r.status, 0, `${name(args)} refused the league: ${r.stderr}`);
  }
});

test("3. three of them take a root and answer about it", () => {
  const retros = kaal(["retros", HALF]);
  assert.equal(retros.status, 0, retros.stderr);
  assert.match(retros.stdout, /^x: 0 unconsumed$/m);
  const boundary = kaal(["boundary", CLEAN]);
  assert.equal(boundary.status, 0, boundary.stderr);
  const gates = kaal(["gates", CONFIG_ONLY]);
  assert.equal(gates.status, 0, gates.stdout + gates.stderr);
  assert.match(gates.stdout, /nothing/);
  // The runner keeps its positional arguments: a skill and a fixture.
  const runner = kaal(["runner", "analyse", "json-flag", "--check"]);
  assert.equal(runner.status, 0, runner.stderr);
});
