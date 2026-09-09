import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { runAcceptance, runContracts } from "../bin/lib/acceptance.mjs";

const F = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "requirements",
  "a-task-is-delivered-by-its-run",
  "fixtures",
);
const suite = (fixture) =>
  join(F, fixture, "requirements", "alpha", "acceptance.test.mjs");

test("runAcceptance reports the verdict from the record, and fails only on two of the four", () => {
  for (const [fixture, word, ok] of [
    ["delivered", "delivered", true],
    ["not-delivered", "not delivered", true],
    ["stale", "not delivered", true],
    ["regressed", "regressed", false],
    ["nothing-ran", "nothing ran", false],
  ]) {
    const r = runAcceptance([suite(fixture)]);
    assert.equal(
      r.results[0].word,
      word,
      `${fixture} read as ${r.results[0].word}`,
    );
    assert.equal(r.ok, ok, `${fixture} was ${r.ok ? "passed" : "failed"}`);
  }
});

test("a stale record says so on the board's own line, and a missing one says something else", () => {
  const stale = runAcceptance([suite("stale")]);
  assert.match(stale.lines.join("\n"), /stale/i, stale.lines.join("\n"));
  const none = runAcceptance([suite("not-delivered")]);
  assert.doesNotMatch(none.lines.join("\n"), /stale/i, none.lines.join("\n"));
});

test("a suite that declares no test at all has run nothing, whatever the runner counts", () => {
  // The runner reports a file with no test in it as one passing test named
  // for the file. A suite whose tests were deleted would otherwise read as
  // green, which is the vacuous pass this league exists to refuse.
  const r = runAcceptance([suite("nothing-ran")]);
  assert.equal(r.results[0].pass, 0, "an empty suite counted a pass");
  assert.equal(r.results[0].word, "nothing ran");
  assert.equal(r.ok, false);
});

test("runContracts judges a drawing by the record of the task it answers", () => {
  // A drawing's suite is not beside a requirement, and its verdict is still
  // its task's: downstream answers upstream, which is how this wall already
  // resolved its status before there were records. Built here rather than
  // added to the fixtures beside the requirement, because those are the
  // analyst's and this is a unit.
  const root = mkdtempSync(join(tmpdir(), "kaal-judged-"));
  try {
    cpSync(join(F, "delivered"), root, { recursive: true });
    const drawing = join(root, "architecture", "alpha", "contracts.test.mjs");
    mkdirSync(dirname(drawing), { recursive: true });
    writeFileSync(
      drawing,
      'import { test } from "node:test";\ntest("1. the seam holds", () => {});\n',
    );
    const r = runContracts([drawing]);
    assert.equal(r.results.length, 1, `the wall reported ${r.results.length}`);
    assert.equal(
      r.results[0].word,
      "delivered",
      `read as ${r.results[0].word}, and the task it answers is on record`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
