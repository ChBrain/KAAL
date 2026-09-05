import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readStatus,
  judge,
  runAcceptance,
  expand,
} from "../bin/lib/acceptance.mjs";

const F = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "requirements",
  "status-v1",
  "fixtures",
);
const f = (n) => join(F, n, "acceptance.test.mjs");

test("readStatus reads open or closed from the sibling requirement, and null when absent", () => {
  assert.equal(readStatus(f("open-red")), "open");
  assert.equal(readStatus(f("closed-green")), "closed");
  assert.equal(readStatus(f("no-status")), null);
});

test("judge applies the four verdicts", () => {
  assert.equal(judge("closed", 1, 1).ok, false);
  assert.equal(judge("closed", 2, 0).ok, true);
  assert.equal(judge("open", 1, 1).ok, true);
  assert.match(judge("open", 1, 1).label, /^open/);
  assert.equal(judge("open", 1, 0).ok, false);
  assert.match(judge("open", 1, 0).label, /close/i);
  assert.equal(judge(null, 1, 0).ok, false);
  assert.match(judge(null, 1, 0).label, /status/i);
});

test("runAcceptance runs the files, reads counts, and fails on any FAIL", () => {
  const r = runAcceptance([f("open-red"), f("closed-green")]);
  assert.equal(r.ok, true);
  assert.deepEqual(
    r.results.map((x) => [x.pass, x.fail]),
    [
      [1, 1],
      [1, 0],
    ],
  );
  assert.equal(runAcceptance([f("closed-red")]).ok, false);
  assert.equal(runAcceptance([]).ok, false, "no files is not a pass");
});

test("expand: a glob becomes its sorted matches, a plain path passes through, nothing matched is nothing", () => {
  const G = join(F, "..", "..", "gates-v2", "fixtures", "globs");
  const got = expand([join(G, "requirements", "*", "acceptance.test.mjs")]);
  assert.deepEqual(
    got.map((p) => p.split(/[\\/]/).at(-2)),
    ["alpha", "beta"],
  );
  assert.deepEqual(expand(["a/plain/path.mjs"]), ["a/plain/path.mjs"]);
  assert.deepEqual(expand([join(G, "nowhere", "*", "x.mjs")]), []);
});
