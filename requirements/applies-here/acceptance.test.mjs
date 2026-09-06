// Acceptance tests for requirement applies-here. One per criterion. Surface
// only: the tool as a command, on a fixture root and on the league.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FOREIGN = join(HERE, "fixtures", "foreign");
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
// The four commands that judge a tree against a league artefact. `fixtures`
// lists rather than judges, and code-v2 fixed its answer on an empty root.
const FOUR = ["ledger", "drawings", "check", "agents"];

test("1. each of the four says the question does not apply on a tree that holds no league artefact", () => {
  assert.equal(FOUR.length, 4);
  for (const cmd of FOUR) {
    const r = kaal([cmd, FOREIGN]);
    assert.equal(r.status, 2, `${cmd}: expected exit 2, got ${r.status}`);
    assert.equal(r.stdout.trim(), "", `${cmd}: answered on stdout anyway`);
    assert.match(
      r.stderr,
      new RegExp(`^${cmd}: not applicable here: \\S.*$`, "m"),
      `${cmd}: no not-applicable line`,
    );
  }
  // fixtures keeps the refusal code-v2 fixed for it.
  assert.equal(kaal(["fixtures", FOREIGN]).status, 1);
});

test("2. check names no finding against a plain source directory", () => {
  const r = kaal(["check", FOREIGN]);
  assert.doesNotMatch(r.stderr, /^src:/m);
  assert.doesNotMatch(r.stderr, /no SKILL\.md/);
  assert.doesNotMatch(r.stderr, /adversarial fixture/);
});

test("3. the league's own answers are unchanged", () => {
  const answers = {
    ledger: /^ledger: every rung evidenced$/m,
    drawings: /^drawings: every drawing holds its shape$/m,
    check: /^check: every skill obeys the rules$/m,
    agents: /^agents: every agent obeys the rules$/m,
    fixtures: /^requirement architecture\/analyse-v2\/fixtures\//m,
  };
  for (const cmd of [...FOUR, "fixtures"]) {
    const r = kaal([cmd]);
    assert.equal(r.status, 0, `${cmd}: ${r.stderr}`);
    assert.match(r.stdout, answers[cmd], `${cmd}: the summary moved`);
  }
});
