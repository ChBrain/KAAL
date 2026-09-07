// Contract tests for the drawing what-a-closed-task-fixes. One per seam.
// The change is text, so the seams are the sections that govern it, plus
// the stack the move touches.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
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
  "2026-09-06-analyse-twenty-sixth-use.md",
  "2026-09-06-analyse-twenty-seventh-use.md",
  "2026-09-06-analyse-twenty-eighth-use.md",
  "2026-09-06-analyse-thirty-first-use.md",
  "2026-09-06-analyse-thirty-second-use.md",
  "2026-09-06-analyse-thirty-third-use.md",
];

test("1. the reading rule sits in the section where it is met, before anything is written", () => {
  const read = section("1\\. Read the ask, and count it");
  assert.ok(read, "no reading section");
  assert.match(read, /their tests as well as their criteria/i);
  assert.match(read, /fixes shapes no criterion states/i);
  // A rule about what to read before writing, met at handoff, is met too late.
  assert.doesNotMatch(section("5\\. Hand off"), /as well as their criteria/i);
});

test("2. the handoff says what a supersede names and which way gives way", () => {
  const handoff = section("5\\. Hand off");
  assert.ok(handoff, "no handoff section");
  for (const phrase of [
    /the exact claim that moves/i,
    /the principle that permits it/i,
    /pushes the other way/i,
    /your criterion gives way/i,
  ])
    assert.match(handoff, phrase, "not in the handoff section");
  // The field itself is still described, as analyse-v3 fixed it.
  assert.match(handoff, /`- Supersedes:`/, "the field's own sentence moved");
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
  // Consumption is by name, so the move changes no count. The expected count
  // is read from the tree here rather than carved into the test: a number
  // that was true on the day is not a promise about the mechanism.
  const r = kaal(["retros"]);
  assert.equal(r.status, 0, r.stderr);
  const named = readdirSync(join(ROOT, "requirements"))
    .map((d) => join(ROOT, "requirements", d, "requirement.md"))
    .filter(existsSync)
    .map((p) => readFileSync(p, "utf8"))
    .join("\n");
  const expected = readdirSync(join(ROOT, "retros"))
    .filter((f) => f.endsWith(".md"))
    .filter((f) =>
      /^Feeds: `?analyse`?\.?\s*$/m.test(
        readFileSync(join(ROOT, "retros", f), "utf8"),
      ),
    )
    .filter((f) => !named.includes(f)).length;
  const analyse = r.stdout.match(/^analyse: (\d+) unconsumed$/m);
  assert.ok(analyse, r.stdout);
  assert.equal(Number(analyse[1]), expected, r.stdout);
});
