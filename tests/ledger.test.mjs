import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkLedgers } from "../bin/lib/ledger.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const A = join(ROOT, "architecture", "push-v1", "fixtures");
const R = join(ROOT, "requirements", "push-v1", "fixtures");

test("the league's own ledgers carry no findings", () => {
  assert.deepEqual(checkLedgers(ROOT), []);
});

test("a good root: script rung resolves relative to the skill, skill rung to fresh records", () => {
  assert.deepEqual(checkLedgers(join(A, "ledger")), []);
});

test("a rung claimed with no test is a finding", () => {
  const f = checkLedgers(join(R, "bad-ledger"));
  assert.equal(f.length, 1);
  assert.match(f[0].message, /no test/);
});

test("stale records count for nothing", () => {
  const f = checkLedgers(join(R, "stale-ledger"));
  assert.equal(f.length, 1);
  assert.match(f[0].message, /fresh/);
});

test("an unknown rung is a finding", () => {
  const f = checkLedgers(join(A, "ledger"), {
    moves: [{ name: "odd", rung: "magic" }],
    skill: "good",
  });
  assert.ok(f.some((x) => /rung/.test(x.message)));
});

test("standings: one line per candidate, fresh models out of two, read over evals/<skill>/* when no test is named", async () => {
  const { standings } = await import("../bin/lib/ledger.mjs");
  const F = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "architecture",
    "push-v1",
    "fixtures",
    "ledger",
  );
  const s = standings(F);
  assert.deepEqual(s, [
    { skill: "good", move: "a candidate move", fresh: 2, need: 2, stale: [] },
  ]);
  const S = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "architecture",
    "honest-records",
    "fixtures",
    "stale-standing",
  );
  assert.deepEqual(standings(S), [
    {
      skill: "x",
      move: "a candidate",
      fresh: 0,
      need: 2,
      stale: [{ file: "evals/x/f/alpha.md", why: "skill moved" }],
    },
  ]);
});
