// Contract tests for the drawing a-drawing-fixes-more-than-structure. One per seam.
// The change is text, so the seams are the places that govern it, plus the
// stack the move touches.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const section = (skill, title) =>
  readFileSync(join(ROOT, "skills", skill, "SKILL.md"), "utf8")
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
  "2026-09-06-architect-twenty-first-use.md",
  "2026-09-06-architect-twenty-second-use.md",
  "2026-09-06-architect-twenty-third-use.md",
  "2026-09-06-architect-twenty-fifth-use.md",
  "2026-09-07-architect-twenty-eighth-use.md",
];

test("1. the Fixed and free bullet fixes the section, the order and the words", () => {
  const draw = section("architect", "2\\. Draw the want");
  assert.ok(draw, "no Draw the want section");
  for (const phrase of [
    /when the change is text/i,
    /the section each sentence lives in/i,
    /its order among the sentences already there/i,
    /the words the contract reads/i,
    /an order is a promise/i,
    /where each phrase first appears/i,
    /what must not be disturbed/i,
  ])
    assert.match(draw, phrase, "not in the Draw the want section");
  // A rule about drawing, met while writing the proof, is met too late.
  assert.doesNotMatch(
    section("architect", "3\\. Write the proof"),
    /an order is a promise/i,
  );
  // What architect-v2 fixed in this bullet is untouched.
  assert.match(
    draw,
    /the sentences' places/i,
    "a closed task's sentence moved",
  );
});

test("2. the retros this task consumed are archived, and the counts did not move", () => {
  assert.equal(MOVED.length, 5);
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
  // The expected count is read from the tree, never carried: a number true on
  // the day a test is written is not a promise about the mechanism.
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
      /^Feeds: `?architect`?\.?\s*$/m.test(
        readFileSync(join(ROOT, "retros", f), "utf8"),
      ),
    )
    .filter((f) => !named.includes(f)).length;
  const line = r.stdout.match(/^architect: (\d+) unconsumed$/m);
  assert.ok(line, r.stdout);
  assert.equal(Number(line[1]), expected, r.stdout);
});
