import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { countRetros, readFindings } from "../bin/lib/retros.mjs";

const F = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "architecture",
  "push-v1",
  "fixtures",
  "retros-root",
);

test("consumed and archived retros are not counted; a skill with none counts zero", () => {
  const c = Object.fromEntries(countRetros(F).map((r) => [r.skill, r.count]));
  assert.equal(c.a, 1);
  assert.equal(c.b, 0);
});

test("a root with no retros directory counts zero for every skill and does not throw", () => {
  const c = countRetros(join(F, "..", "rules"));
  assert.ok(Array.isArray(c));
  assert.ok(c.every((r) => r.count === 0));
});

// A read line's names, read off the row rather than off a printed line.
const READS = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "architecture",
  "a-retro-names-what-it-read",
  "fixtures",
  "grammar",
);

test("a name survives both liberties the Feeds line already takes", () => {
  const c = Object.fromEntries(countRetros(READS).map((r) => [r.skill, r]));
  // Backticked with a trailing period, and plain in a comma separated pair.
  // The period comes off before the backticks or the closing one survives
  // into the name and the retro counts nowhere.
  assert.equal(c.beta.read, 2);
  assert.equal(c.gamma.read, 1);
});

test("no read line, and a read line holding nothing, are no names", () => {
  const c = Object.fromEntries(countRetros(READS).map((r) => [r.skill, r]));
  assert.equal(c.alpha.read, 0);
  assert.deepEqual(readFindings(READS), []);
});

test("a name that is no skill in the tree is a finding naming both", () => {
  const bad = readFindings(
    join(
      READS,
      "..",
      "..",
      "..",
      "..",
      "requirements",
      "a-retro-names-what-it-read",
      "fixtures",
      "unknown",
    ),
  );
  assert.deepEqual(bad, [{ retro: "one.md", name: "delta" }]);
});

test("a root with no retros directory finds nothing and does not throw", () => {
  assert.deepEqual(readFindings(join(F, "..", "rules")), []);
});
