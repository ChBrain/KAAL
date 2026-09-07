// Contract tests for the drawing the-tag-installs-offline. One per seam.
// Both read declarations rather than run installs: the acceptance tests do
// the clone and the offline install, and these hold the two statements those
// installs depend on, so a failure names a declaration and not a network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifest = () =>
  JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
// Every script npm runs on its own during an install. The mechanism keys on
// one being declared at all, never on what it does, so the list is the
// contract and not any single name.
const LIFECYCLE = [
  "preinstall",
  "install",
  "postinstall",
  "prepare",
  "prepublish",
];

test("1. nothing runs at install time", () => {
  const scripts = manifest().scripts ?? {};
  assert.ok(
    Object.keys(scripts).length > 0,
    "the manifest declares no scripts at all, so this proves nothing",
  );
  const declared = LIFECYCLE.filter((n) => n in scripts);
  assert.deepEqual(
    declared,
    [],
    `npm runs a dev install in a clone it is packing for each of these: ${declared.join(", ")}`,
  );
});

test("2. one named step, and the manifest offers it", () => {
  const agents = readFileSync(join(ROOT, "AGENTS.md"), "utf8");
  const board = agents.match(/```\n([\s\S]*?)```/)?.[1] ?? "";
  assert.ok(board, "AGENTS.md has no board block");
  const lines = board
    .split("\n")
    .filter((l) => /wires the pre-push hook/.test(l));
  assert.equal(lines.length, 1, `steps that wire the hook: ${lines.length}`);
  const step = lines[0].split("#")[0].trim();
  // A name, not a command: the board may change what the script does without
  // changing this test, and a board naming a step nobody can run is worse
  // than a board saying nothing, because a contributor believes it.
  const named = step.match(/^npm run ([a-z][a-z-]*)$/);
  assert.ok(named, `the step is not "npm run <name>": ${step}`);
  const scripts = manifest().scripts ?? {};
  assert.ok(
    named[1] in scripts,
    `the board names ${named[1]}, which the manifest does not offer`,
  );
  // And it wires the hook rather than merely being called that.
  assert.match(
    scripts[named[1]],
    /core\.hooksPath/,
    `${named[1]} does not set core.hooksPath: ${scripts[named[1]]}`,
  );
});
