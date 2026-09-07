// Contract tests for the drawing a-green-contract-is-declared. One per seam.
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
  "2026-09-06-architect-twenty-fourth-use.md",
  "2026-09-06-architect-twenty-sixth-use.md",
  "2026-09-06-architect-twenty-seventh-use.md",
  "2026-09-07-architect-twenty-ninth-use.md",
  "2026-09-07-architect-thirtieth-use.md",
];

test("1. the closed tests are read before drawing, in the section where that is met", () => {
  const read = section(
    "architect",
    "1\\. Read the requirement, and refuse what is not ready",
  );
  assert.ok(read, "no reading section");
  assert.match(read, /their tests as well as their criteria/i);
  assert.match(read, /fixes shapes no criterion states/i);
  assert.doesNotMatch(
    section("architect", "3\\. Write the proof"),
    /as well as their criteria/i,
  );
});

test("2. a green contract is a kind, and the runner is never driven", () => {
  const proof = section("architect", "3\\. Write the proof");
  assert.ok(proof, "no proof section");
  for (const phrase of [
    /green before the build/i,
    /a guard on a reader or a rule that must not change/i,
    /the reason it is green/i,
    /never drive the runner that runs it/i,
    /runs the contracts/i,
    /prove the case on a fixture/i,
  ])
    assert.match(proof, phrase, "not in the proof section");
  // What architect-v2 fixed in the Seen red bullet is untouched.
  assert.match(
    proof,
    /red for the wrong reason/i,
    "a closed task's sentence moved",
  );
});

test("3. the retros this task consumed are archived, and the counts did not move", () => {
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
