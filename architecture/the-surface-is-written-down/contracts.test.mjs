// Contract tests for the drawing the-surface-is-written-down. One per seam.
// The page is read twice: as a document a person reads, and as an interface
// the class wall will read.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PAGE = join(ROOT, "SURFACE.md");
const page = () => (existsSync(PAGE) ? readFileSync(PAGE, "utf8") : "");
const commands = () =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs")], {
    encoding: "utf8",
  })
    .stderr.replace(/^usage: kaal /, "")
    .split("|")
    .map((p) => p.trim().split(/\s/)[0])
    .filter((c) => /^[a-z][a-z-]*$/.test(c));
// A section as the wall will read it: the heading's first word is the command.
const sections = () => [
  ...page().matchAll(/^## +([a-z][a-z-]*)\b([\s\S]*?)(?=^## |(?![\s\S]))/gm),
];

test("1. every command has its own section, and the vocabulary and shapes are on the page", () => {
  const t = page();
  assert.ok(t, "no SURFACE.md");
  const named = new Map(sections().map((m) => [m[1], m[2]]));
  for (const c of commands()) {
    const body = named.get(c);
    assert.ok(body, `no section for ${c}`);
    assert.match(body, /exit/i, `${c}: its section says nothing about exits`);
  }
  const folded = t.replace(/\s+/g, " ");
  assert.match(folded, /0 an answer/);
  assert.match(folded, /1 findings or usage/);
  assert.match(folded, /2 the question is not this tree's/);
  assert.match(folded, /not applicable here: /);
  assert.match(folded, /sha256/i);
  assert.match(folded, /one line on stderr/i);
  // Every promise cites the task that fixed it.
  assert.match(folded, /applies-here/);
  assert.match(folded, /witness-a-tree/);
});

test("2. the page and the usage line hold the same commands, both ways", () => {
  const fromPage = sections().map((m) => m[1]);
  const fromTool = commands();
  assert.ok(fromTool.length >= 8, `the tool offers ${fromTool.length}`);
  assert.deepEqual(
    [...fromPage].sort(),
    [...fromTool].sort(),
    "the page and the usage line disagree",
  );
});
