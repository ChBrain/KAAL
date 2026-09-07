import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GUARDED, appliesHere } from "../bin/lib/applies.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FOREIGN = join(
  ROOT,
  "requirements",
  "applies-here",
  "fixtures",
  "foreign",
);
const HALF = join(ROOT, "architecture", "applies-here", "fixtures", "half");

test("the guarded commands are the eight that judge a tree against a league artefact", () => {
  assert.deepEqual(GUARDED, [
    "ledger",
    "drawings",
    "check",
    "agents",
    "retros",
    "boundary",
    "runner",
    "gates",
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
  // The runner is the exception, and it is the design: its first argument is
  // a skill name, so it is asked about the working directory and a foreign
  // path handed to it is not a root. It is driven below, by its cwd.
  const reasons = new Set();
  for (const cmd of GUARDED.filter((c) => c !== "runner")) {
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
