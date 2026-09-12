import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderRunner, runnerPath } from "./runner.mjs";
import { fileSha } from "./sha.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TREE = join(ROOT, "architecture", "eval-runner", "fixtures", "tree");
const blocks = (doc) =>
  [...doc.matchAll(/^(`{3,})[^\n]*\n([\s\S]*?)^\1[ \t]*$/gm)].map((m) => m[2]);

test("runnerPath is RUNNER.md beside the fixture's ask and expect", () => {
  assert.equal(
    runnerPath("/r", "s", "f"),
    join("/r", "skills", "s", "fixtures", "f", "RUNNER.md"),
  );
});

test("renderRunner: three blocks; skill, each reference after its name, the ask; the items and Output; the shas", () => {
  const doc = renderRunner(TREE, "y", "f");
  assert.match(doc.split("\n")[0], /generated/);
  const b = blocks(doc);
  assert.equal(b.length, 3);
  assert.ok(b[0].indexOf("# y") < b[0].indexOf("references/r.md"));
  assert.ok(
    b[0].indexOf("references/r.md") < b[0].indexOf("The reference text."),
  );
  assert.ok(b[0].trimEnd().endsWith("Do the thing."));
  assert.ok(b[1].includes("- Does the thing.\n- Says nothing else."));
  assert.ok(b[1].trimEnd().endsWith("Output:"));
  const fx = join(TREE, "skills", "y", "fixtures", "f");
  assert.ok(b[2].includes(`ask_sha: ${fileSha(join(fx, "ask.md"))}`));
  assert.ok(b[2].includes(`expect_sha: ${fileSha(join(fx, "expect.md"))}`));
  assert.ok(
    b[2].includes(
      `skill_sha: ${fileSha(join(TREE, "skills", "y", "SKILL.md"))}`,
    ),
  );
  assert.match(b[2], /^fixture: f$/m);
  assert.match(b[2], /^setup: </m);
});

test("a fence inside the skill does not close the block: the fence grows past it", () => {
  const doc = renderRunner(ROOT, "analyse", "json-flag");
  const b = blocks(doc);
  assert.equal(b.length, 3);
  assert.ok(
    b[0].includes(
      readFileSync(join(ROOT, "skills", "analyse", "SKILL.md"), "utf8").trim(),
    ),
  );
  assert.doesNotMatch(doc, /[–—]/);
});

test("a missing skill or fixture throws with the path", () => {
  assert.throws(() => renderRunner(TREE, "y", "nope"), /nope/);
});

test("a fixture that ships a tree gets the procedure, and one without gets none", () => {
  const guest = renderRunner(ROOT, "analyse", "pointed-elsewhere");
  const head = guest.slice(0, guest.indexOf("## Prompt 1"));
  assert.match(head, /Copy the tree to a directory outside the repository/);
  assert.match(head, /kaal witness/);
  // Never inside a prompt: the copying is the person's act, not the model's.
  assert.doesNotMatch(
    guest.slice(guest.indexOf("## Prompt 1")),
    /Copy the tree/,
  );
  assert.doesNotMatch(
    renderRunner(ROOT, "analyse", "json-flag"),
    /Copy the tree/,
  );
});
