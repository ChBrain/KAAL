import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GUARDED, appliesHere } from "./applies.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FOREIGN = join(
  ROOT,
  "requirements",
  "applies-here",
  "fixtures",
  "foreign",
);
const HALF = join(ROOT, "architecture", "applies-here", "fixtures", "half");

test("the guarded commands are the fifteen that judge a tree against a league artefact", () => {
  // Ten until `an-artefact-traces-what-it-came-from` added `traces`, eleven
  // until `a-task-is-delivered-by-its-run` added `runs`, twelve until
  // `a-seat-claims-what-it-covers` added `coverage`, and thirteen until
  // `a-diff-carries-one-seat` added `seats`, all of which take a root and
  // judge a tree against the league's own artefacts like the ten before
  // them. The fifteenth is `an-install-carries-the-method`'s, and it is the
  // first that judges the tree it is standing in rather than one it was
  // handed. Named rather than counted, so a command added by accident is
  // still a red.
  assert.deepEqual(GUARDED, [
    "ledger",
    "drawings",
    "check",
    "agents",
    "retros",
    "boundary",
    "runner",
    "gates",
    "class",
    "release",
    "traces",
    "runs",
    "coverage",
    "seats",
    "assemble",
  ]);
});

test("every guarded command applies to the league's own tree", () => {
  for (const cmd of GUARDED)
    assert.equal(
      appliesHere(cmd, null, ROOT),
      null,
      `${cmd} refused the league`,
    );
  // And the runner is asked about the working directory even when handed a
  // skill name, which is the only argument it ever gets.
  assert.equal(appliesHere("runner", "analyse", ROOT), null);
});

test("none applies to a tree that holds no league artefact, and each names what it looked for", () => {
  // Two are exceptions and both are the design: `runner` takes a skill name
  // and `release` takes a version, so neither first argument is a path and
  // both are asked about the working directory. They are driven below, by
  // their cwd, and a foreign path handed to either is not a root.
  const byCwd = ["runner", "release", "assemble"];
  const reasons = new Set();
  for (const cmd of GUARDED.filter((c) => !byCwd.includes(c))) {
    const why = appliesHere(cmd, FOREIGN, ROOT);
    assert.ok(why, `${cmd} answered a foreign tree`);
    assert.match(why, /foreign/, `${cmd}: the reason does not name the path`);
    reasons.add(why);
  }
  const runner = appliesHere("runner", "analyse", FOREIGN);
  assert.ok(runner, "runner answered a foreign working directory");
  assert.match(runner, /foreign/, "the runner's reason does not name the path");
  assert.doesNotMatch(runner, /analyse/, "the runner read a skill as a path");
  reasons.add(runner);
  // The third of them, and the reason it exists: a consumer runs `assemble`
  // inside the package and names a destination that does not exist yet, so
  // reading that destination as a root would refuse for the wrong reason.
  const assemble = appliesHere("assemble", join(FOREIGN, "wanted"), FOREIGN);
  assert.ok(assemble, "assemble answered a foreign working directory");
  assert.match(
    assemble,
    /foreign/,
    "the assemble reason does not name the path",
  );
  assert.doesNotMatch(
    assemble,
    /wanted/,
    "assemble read a destination as a root",
  );
  reasons.add(assemble);
  const release = appliesHere("release", "0.0.1", FOREIGN);
  assert.ok(release, "release answered a foreign working directory");
  assert.match(release, /foreign/, "the release reason does not name the path");
  assert.doesNotMatch(release, /0\.0\.1/, "release read a version as a path");
  reasons.add(release);
  assert.equal(
    reasons.size,
    GUARDED.length,
    "two commands give the same reason",
  );
});

test("applicability is per command: a tree with a ledger and nothing else answers one question", () => {
  assert.equal(appliesHere("ledger", HALF, ROOT), null);
  assert.match(appliesHere("drawings", HALF, ROOT), /architecture/);
  assert.match(appliesHere("agents", HALF, ROOT), /agents/);
});

test("check is asked about the directory it was given, and about skills/ when it was given none", () => {
  assert.match(
    appliesHere("check", FOREIGN, ROOT),
    new RegExp(FOREIGN.replace(/\\/g, "\\\\")),
  );
  assert.equal(appliesHere("check", join(ROOT, "skills"), ROOT), null);
  assert.equal(appliesHere("check", null, ROOT), null);
});

test("a command the table does not name is never refused", () => {
  // fixtures is here on purpose: it lists rather than judges, and code-v2
  // fixed its answer on a root with none as a refusal of its own.
  for (const cmd of ["fixtures", "assess", "nope"])
    assert.equal(appliesHere(cmd, FOREIGN, ROOT), null, cmd);
});

test("retros is asked about the working directory when its argument is a flag", () => {
  // A root and a flag share one position, and a flag is not a directory.
  // `kaal retros --check` asks about the tree underfoot; a reason naming a
  // place called "--check" would be a plausible lie, and it was the lie
  // this command told before the flag existed.
  assert.equal(appliesHere("retros", "--check", ROOT), null);
  const away = appliesHere("retros", "--check", FOREIGN);
  assert.match(away, /skills/);
  assert.doesNotMatch(away, /--check/);
  // With a root it is still asked about that root, flag or no flag.
  assert.equal(appliesHere("retros", ROOT, FOREIGN), null);
  assert.match(appliesHere("retros", FOREIGN, ROOT), /skills/);
});
