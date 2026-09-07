// Acceptance tests for requirement the-surface-is-written-down. One per
// criterion. Surface only: the page, and the tool's own usage line.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PAGE = join(ROOT, "SURFACE.md");
const page = () => readFileSync(PAGE, "utf8");
// The usage line the tool prints when it is given nothing it knows.
const usage = () =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs")], {
    encoding: "utf8",
  }).stderr;
// Every command the usage line offers, read from the line itself.
const commands = () =>
  usage()
    .replace(/^usage: kaal /, "")
    .split("|")
    .map((p) => p.trim().split(/\s/)[0])
    // The line carries "[--write | --check]", so splitting on the bar yields a
    // fragment that is not a command. A command is a lowercase word.
    .filter((c) => /^[a-z][a-z-]*$/.test(c));

test("1. the page names every command, with what it answers and how it ends", () => {
  assert.ok(existsSync(PAGE), "no SURFACE.md");
  const t = page();
  const named = commands();
  assert.ok(named.length >= 8, `the usage line offers ${named.length}`);
  for (const c of named)
    assert.match(
      t,
      new RegExp(`^#+ .*\\b${c}\\b`, "m"),
      `the page has no section for ${c}`,
    );
});

test("2. the exit code vocabulary is stated once, and it is three", () => {
  const t = page().replace(/\s+/g, " ");
  assert.match(t, /0 an answer/i);
  assert.match(t, /1 findings or usage/i);
  assert.match(t, /2 the question is not this tree's/i);
});

test("3. the shapes a caller parses are named", () => {
  const t = page().replace(/\s+/g, " ");
  assert.match(t, /not applicable here: /);
  assert.match(t, /sha256/i);
  assert.match(t, /one line on stderr/i);
});

test("4. the page and the usage line cannot disagree", () => {
  const t = page();
  const named = commands();
  // Every command on the page is one the tool offers: a section heading that
  // names a command the usage line does not know is a promise nobody keeps.
  const headings = [...t.matchAll(/^#+ +`?([a-z-]+)`?/gm)].map((m) => m[1]);
  const known = new Set(named);
  const extra = headings.filter(
    (h) =>
      !known.has(h) &&
      /^(assess|witness|ledger|drawings|check|agents|retros|boundary|runner|gates|fixtures|standard|acceptance|contracts)$/.test(
        h,
      ),
  );
  assert.deepEqual(
    extra,
    [],
    `the page names commands the tool does not: ${extra}`,
  );
  for (const c of named) assert.ok(t.includes(c), `${c} is not on the page`);
});
