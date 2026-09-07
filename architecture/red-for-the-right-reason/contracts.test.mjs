// Contract tests for the drawing red-for-the-right-reason. One per seam.
// The change is text, so the seams are the sections that govern it, plus
// the stack the move touches.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const skill = () =>
  readFileSync(join(ROOT, "skills", "analyse", "SKILL.md"), "utf8");
const section = (title) =>
  skill()
    .match(
      new RegExp(`^## ${title}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"),
    )?.[1]
    ?.replace(/\s+/g, " ") ?? "";
const kaal = (args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
const MOVED = [
  "2026-09-06-analyse-twenty-second-use.md",
  "2026-09-06-analyse-twenty-third-use.md",
  "2026-09-06-analyse-twenty-fourth-use.md",
  "2026-09-06-analyse-twenty-fifth-use.md",
  "2026-09-06-analyse-twenty-ninth-use.md",
  "2026-09-06-analyse-thirtieth-use.md",
];

test("1. the absence rule is a bullet inside the section that governs writing tests", () => {
  const proof = section("3\\. Write the proof");
  assert.ok(proof, "no proof section");
  for (const phrase of [
    /something not happening/i,
    /could have happened/i,
    /coincidence/i,
  ])
    assert.match(proof, phrase, "not in the proof section");
  // A rule about writing tests met at handoff is met too late.
  assert.doesNotMatch(section("5\\. Hand off"), /could have happened/i);
  // And what analyse-v3 fixed here is untouched: the red run sentence lives
  // in this section, beside the rule it belongs to, not in the handoff.
  assert.match(proof, /not yet recorded/i, "a closed task's sentence moved");
});

test("2. the handoff says the red run comes from the run, and names a green test", () => {
  const handoff = section("5\\. Hand off");
  assert.ok(handoff, "no handoff section");
  for (const phrase of [
    /from the run, never from the plan/i,
    /green before the build/i,
    /the reason it is green/i,
  ])
    assert.match(handoff, phrase, "not in the handoff section");
});

test("3. the six are archived, gone from the stack, and the counts did not move", () => {
  assert.equal(MOVED.length, 6);
  for (const f of MOVED) {
    assert.ok(
      existsSync(join(ROOT, "retros", "archive", f)),
      `${f} is not archived`,
    );
    assert.ok(
      !existsSync(join(ROOT, "retros", f)),
      `${f} is still in the stack`,
    );
  }
  const r = kaal(["retros"]);
  assert.equal(r.status, 0, r.stderr);
  // Consumption is by name, so the move changes no count: the requirement
  // that named these six is merged, and analyse reads what it read before.
  const analyse = r.stdout.match(/^analyse: (\d+) unconsumed$/m);
  assert.ok(analyse, r.stdout);
  assert.equal(Number(analyse[1]), 1, r.stdout);
});
