// Contract tests for the drawing nothing-stale. One per seam. Blind to the
// code: the code skill's text, and the tool as a command on fixture roots.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const text = () =>
  readFileSync(join(ROOT, "skills", "code", "SKILL.md"), "utf8");
const section = (t, title) =>
  t.match(
    new RegExp(
      `^## [^\\n]*${title}[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`,
      "m",
    ),
  )?.[1] ?? "";
const fold = (s) => s.replace(/\s+/g, " ");
const kaal = (args, cwd) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });

test("1. the skill's text to the developer: each fixed phrase in its own section and in no other", () => {
  const one = fold(section(text(), "Read what is fixed"));
  const three = fold(section(text(), "Build to the proof"));
  const five = fold(section(text(), "Hand off"));
  assert.ok(one && three && five, "a section is missing");
  assert.match(one, /walks every fixture/i);
  assert.match(one, /must stay as they are/i);
  assert.match(three, /reads prose/i);
  assert.match(three, /whitespace folded/i);
  assert.match(three, /generated file/i);
  assert.match(three, /as the formatter would write it/i);
  assert.match(five, /closed in the same change/i);
  assert.doesNotMatch(three, /walks every fixture|closed in the same change/i);
  assert.doesNotMatch(one, /whitespace folded|closed in the same change/i);
  assert.doesNotMatch(five, /whitespace folded|walks every fixture/i);
});

test("2. the tree to the sweep's verdict: stale is named and red, current is named and green, a fixture with no runner is silent", () => {
  const stale = kaal(
    ["runner", "--check"],
    join(HERE, "fixtures", "tree-stale"),
  );
  assert.equal(stale.status, 1, stale.stdout + stale.stderr);
  assert.match(stale.stderr, /skills\/x\/fixtures\/f\/RUNNER\.md is stale/);
  assert.doesNotMatch(stale.stdout + stale.stderr, /fixtures\/g/);
  const current = kaal(["runner", "--check"], join(HERE, "fixtures", "board"));
  assert.equal(current.status, 0, current.stdout + current.stderr);
  assert.match(current.stdout, /skills\/x\/fixtures\/f\/RUNNER\.md is current/);
  assert.doesNotMatch(current.stdout + current.stderr, /fixtures\/g/);
});

test("3. the sweep's verdict to the board: a wall named runners reads ok on a current tree", () => {
  const b = kaal(["gates"], join(HERE, "fixtures", "board"));
  assert.equal(b.status, 0, b.stdout);
  assert.match(b.stdout, /^ok\s+runners\b/m);
});
