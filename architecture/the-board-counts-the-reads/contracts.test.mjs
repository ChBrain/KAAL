// Contract tests for drawing the-board-counts-the-reads. One per seam,
// numbered to match. Fixture roots only: the trees beside
// `a-retro-names-what-it-read` are the ones these promises were drawn
// against, and the league's own counts move whenever anyone files a retro.
// Nothing here drives the board, which runs the contracts.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIX = (n) =>
  join(ROOT, "requirements", "a-retro-names-what-it-read", "fixtures", n);
const kaal = (dir, ...args) =>
  spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "retros", ...args],
    { encoding: "utf8", cwd: dir },
  );

test("1. a flag is not a root, whichever reader is asked", () => {
  // The form the board uses: the flag first, no root, the tree underfoot.
  // Applicability is asked before the command reads anything, so a reader
  // that takes `--check` for a directory answers 2 and the wall fails
  // without ever looking at a retro.
  const here = kaal(FIX("mixed"), "--check");
  assert.notEqual(
    here.status,
    2,
    `the flag was read as a root: ${here.stdout}${here.stderr}`,
  );
  assert.doesNotMatch(
    here.stderr,
    /--check/,
    `a reason named the flag as a place: ${here.stderr}`,
  );
  // And with a root, the root is the tree and the flag is still a flag.
  const there = kaal(ROOT, FIX("mixed"), "--check");
  assert.notEqual(there.status, 2, there.stderr);
  // A tree with no skills is still not this tree's question, flag or not.
  for (const args of [["--check"], [join(ROOT, "requirements"), "--check"]]) {
    const away = kaal(join(ROOT, "requirements"), ...args);
    assert.equal(
      away.status,
      2,
      `a tree with no skills was answered: ${away.stdout}`,
    );
  }
});

test("2. the check answers with findings alone, on one of three codes", () => {
  const clean = kaal(FIX("mixed"), "--check");
  assert.equal(clean.status, 0, `refused a clean tree: ${clean.stderr}`);
  assert.equal(clean.stdout.trim(), "", `it printed: ${clean.stdout}`);
  const bad = kaal(FIX("unknown"), "--check");
  assert.equal(bad.status, 1, `a finding did not set the code: ${bad.stdout}`);
  const said = bad.stdout + bad.stderr;
  assert.match(said, /one\.md/, said);
  assert.match(said, /delta/, said);
  assert.doesNotMatch(
    said,
    /unconsumed|\d+ read\b/,
    `the check printed counts the board does not judge: ${said}`,
  );
  // Without the flag, the command prints what it prints today. The counts
  // are read from the fixture rather than written here, so this cannot go
  // red on the day the fixture grows a retro.
  const bare = kaal(FIX("mixed"));
  assert.equal(bare.status, 0, bare.stderr);
  const skills = ["alpha", "beta", "gamma"];
  for (const s of skills) {
    assert.match(
      bare.stdout,
      new RegExp(`^${s}: \\d+ unconsumed$`, "m"),
      bare.stdout,
    );
    assert.match(
      bare.stdout,
      new RegExp(`^${s}: \\d+ read$`, "m"),
      bare.stdout,
    );
  }
  assert.equal(
    bare.stdout.trim().split("\n").length,
    skills.length * 2,
    `the bare command's lines moved: ${bare.stdout}`,
  );
});

test("3. the gate the board runs finds what it was added for", () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, "kaal.config.json"), "utf8"));
  const gate = cfg.gates.find((g) => /\bretros\b/.test(g.command));
  assert.ok(
    gate,
    `no gate runs the command: ${cfg.gates.map((g) => g.name).join(", ")}`,
  );
  assert.ok(gate.name && gate.fix, "the gate has no name or no fix");
  // The command the config names, pointed at a tree where it should fail.
  // An entry that exists proves nothing about whether it finds anything,
  // and a gate whose command cannot find the thing it was added for is a
  // wall in name only. Run from the league, because the command's own path
  // to the binary is the league's; the tree under test goes in as the root
  // argument, right after the subcommand, where the command takes it.
  const [bin, ...args] = gate.command.split(/\s+/);
  const at = args.indexOf("retros") + 1;
  assert.ok(at > 0, `the gate's command does not name retros: ${gate.command}`);
  const run = (dir) =>
    spawnSync(
      bin === "node" ? process.execPath : bin,
      [...args.slice(0, at), dir, ...args.slice(at)],
      { encoding: "utf8", cwd: ROOT, shell: false },
    );
  const bad = run(FIX("unknown"));
  assert.equal(
    bad.status,
    1,
    `the gate's own command passed a tree with a bad read line: ${bad.stdout}${bad.stderr}`,
  );
  const clean = run(FIX("mixed"));
  assert.equal(
    clean.status,
    0,
    `the gate's own command failed a clean tree: ${clean.stdout}${clean.stderr}`,
  );
});
