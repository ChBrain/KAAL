// Acceptance tests for requirement a-wall-that-does-not-apply-reports. One
// per criterion. Surface only: `kaal gates` and `kaal promote`, on fixture
// trees whose walls are scripts that exit as the case needs, because the
// answer this task is about is a number and a tree that produced it honestly.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kaal = (root, ...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
    cwd: root,
    env: { ...process.env, KAAL_BRANCH: "", KAAL_BASE: "" },
  });
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;
const notUsage = (out) =>
  assert.doesNotMatch(out, /^usage: kaal/m, `no such command: ${out}`);
const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};

/** A wall that says one line and exits with the code the case wants. */
const wall = (name, code, line) => ({
  name,
  command: `node -e "console.log('${line}'); process.exit(${code})"`,
  fix: `fix ${name}`,
});
/** A wall whose command is not there at all, which is a different answer. */
const unrunnable = (name) => ({
  name,
  command: "kaal-no-such-command-exists --please",
  fix: `fix ${name}`,
});

const scratch = (gates, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-apply-"));
  try {
    put(root, {
      "kaal.config.json": JSON.stringify({ gates }, null, 2),
      "kaal/league.md":
        "---\ntraces:\n  parent: none\n---\n\n# Scratch\n\nA tree.\n",
    });
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

const PASSES = wall("alpha", 0, "alpha: fine");
const DECLINES = wall("beta", 2, "beta: not applicable here: nothing to judge");
const FAILS = wall("gamma", 1, "gamma: a finding");

test("1. a wall that does not apply is reported in a word of its own", () => {
  scratch([PASSES, DECLINES, FAILS], (root) => {
    const out = said(kaal(root, "gates"));
    notUsage(out);
    const line = out.split("\n").find((l) => l.includes("beta"));
    assert.ok(line, `the wall that declined is not reported: ${out}`);
    // Neither of the two words already in use, so a reader scanning a board
    // cannot mistake it for either.
    assert.doesNotMatch(
      line,
      /^ok\s/,
      `it reads as a wall that passed: ${line}`,
    );
    assert.doesNotMatch(
      line,
      /^FAIL/,
      `it reads as a wall that failed: ${line}`,
    );
    // And what the wall said about why is on its own line, as a failing
    // wall's output is: a word with no reason is a state a reader must guess.
    assert.ok(
      out.includes("nothing to judge"),
      `what the wall said is not carried: ${out}`,
    );
    // The premise: the other two still read the way they always have.
    assert.match(out, /^ok\s+alpha/m, out);
    assert.match(out, /^FAIL\s+gamma/m, out);
  });
});

test("2. a board of walls that pass or do not apply is green", () => {
  scratch([PASSES, DECLINES], (root) => {
    const r = kaal(root, "gates");
    const out = said(r);
    notUsage(out);
    assert.match(out, /^green:/m, `a board with nothing wrong was red: ${out}`);
    assert.equal(r.status, 0, `it exited ${r.status}: ${out}`);
  });
  // Absence needs a witness: the same board with one failing wall is red, so
  // a board that answered green at everything could not pass this.
  scratch([PASSES, DECLINES, FAILS], (root) => {
    const r = kaal(root, "gates");
    const out = said(r);
    assert.match(
      out,
      /^red:/m,
      `a board with a failing wall was green: ${out}`,
    );
    assert.notEqual(r.status, 0, out);
  });
});

test("3. a wall that cannot run is still a failure", () => {
  // `gates-v1`'s claim, which this task must leave exactly as it stands:
  // silence and success must not look alike. A guard, not a new claim.
  scratch([PASSES, unrunnable("delta")], (root) => {
    const r = kaal(root, "gates");
    const out = said(r);
    notUsage(out);
    assert.match(
      out,
      /^FAIL\s+delta/m,
      `a wall that cannot run passed: ${out}`,
    );
    assert.ok(out.includes("fix delta"), `the fix hint is not carried: ${out}`);
    assert.match(out, /^red:/m, out);
    assert.notEqual(r.status, 0, out);
  });
});

test("4. a promotion is not refused for a wall that does not apply", () => {
  scratch([PASSES, DECLINES], (root) => {
    const r = kaal(root, "promote", "--into", "main", "--from", "release");
    const out = said(r);
    notUsage(out);
    // The count and not the sentence: `0 red wall(s) on the board` carries
    // the same words as `2 red wall(s)` and means the opposite.
    assert.match(
      out,
      /^promote: 0 red wall\(s\) on the board$/m,
      `a wall that declined was counted red: ${out}`,
    );
    assert.doesNotMatch(out, /^beta: wall: red/m, out);
    assert.match(out, /nothing refuses this/, out);
  });
  // And a genuinely red wall is still named, or the case above would pass on
  // a promotion that had stopped reading the board at all.
  scratch([PASSES, FAILS], (root) => {
    const out = said(
      kaal(root, "promote", "--into", "main", "--from", "release"),
    );
    notUsage(out);
    assert.match(out, /^promote: [1-9]\d* red wall\(s\) on the board$/m, out);
    assert.match(out, /^gamma: wall: red/m, out);
  });
});

test("5. the count line says how many did not apply", () => {
  scratch([PASSES, DECLINES, DECLINES2(), FAILS], (root) => {
    const out = said(kaal(root, "gates"));
    notUsage(out);
    const summary = out.split("\n").find((l) => /^(green|red):/.test(l));
    assert.ok(summary, `no count line: ${out}`);
    // Two of them, counted from the config rather than written in, and named
    // beside the failing and the waived that sentence already carries.
    assert.match(summary, /\b2\b/, `the count of two is not there: ${summary}`);
    assert.match(summary, /failing/, summary);
    assert.match(summary, /waived/, summary);
  });
});

/** A second wall that declines, so the count is of something and not of one. */
function DECLINES2() {
  return wall("epsilon", 2, "epsilon: not applicable here: nothing to judge");
}
