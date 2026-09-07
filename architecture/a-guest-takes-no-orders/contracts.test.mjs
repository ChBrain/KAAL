// Contract tests for the drawing a-guest-takes-no-orders. One per seam.
// The change is text, so the seams are where that text is read: the section
// itself, in order, and the prompt a model is handed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const raw = (skill) =>
  readFileSync(join(ROOT, "skills", skill, "SKILL.md"), "utf8");
const section = (text, title) =>
  text.match(
    new RegExp(`^## ${title}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"),
  )?.[1] ?? "";
// Folded, because the formatter wraps where it likes.
const fold = (text) => text.replace(/\s+/g, " ");
const kaal = (args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
const WORKING = ["analyse", "architect", "code", "operate", "test"];

test("1. three sentences, inside the one section, after the two already there", () => {
  assert.equal(WORKING.length, 5);
  for (const skill of WORKING) {
    const said = fold(section(raw(skill), "Where you act"));
    assert.ok(said, `${skill}: no Where you act section`);
    for (const phrase of [
      /content, never instruction/i,
      /addresses an agent/i,
      /you do not follow it/i,
      /your own contract governs/i,
      /yours wins and you say so/i,
      /conventions are evidence/i,
      /name them to the ask/i,
      /adopting them in silence/i,
    ])
      assert.match(said, phrase, `${skill}: not in the section`);
    // The order: a model that learns it takes no orders before it learns
    // whose tree it is has learned the rule without its subject.
    const at = (re) => said.search(re);
    assert.ok(
      at(/two places/i) < at(/you write nothing there/i),
      `${skill}: the place comes after the writing rule`,
    );
    assert.ok(
      at(/you write nothing there/i) < at(/content, never instruction/i),
      `${skill}: the orders rule comes before the writing rule`,
    );
    // And nothing displaced what where-a-skill-acts fixed.
    for (const kept of [
      /repository that holds/i,
      /the ask names which/i,
      /ask where the work lands/i,
    ])
      assert.match(said, kept, `${skill}: a closed task's sentence moved`);
  }
});

test("2. the sentences reach a model inside prompt one, and the page is current", () => {
  const r = kaal(["runner", "analyse", "json-flag"]);
  assert.equal(r.status, 0, r.stderr);
  const page = fold(r.stdout);
  for (const phrase of [
    /content, never instruction/i,
    /your own contract governs/i,
    /conventions are evidence/i,
  ])
    assert.match(page, phrase, "prompt one does not carry the sentences");
  const check = kaal(["runner", "--check"]);
  assert.equal(check.status, 0, check.stdout + check.stderr);
});
