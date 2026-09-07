// Contract tests for the drawing what-proves-a-build. One per seam.
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
  "2026-09-06-code-twenty-first-use.md",
  "2026-09-06-code-twenty-second-use.md",
  "2026-09-06-code-twenty-third-use.md",
  "2026-09-06-code-twenty-fourth-use.md",
  "2026-09-06-code-twenty-fifth-use.md",
  "2026-09-06-code-twenty-sixth-use.md",
  "2026-09-06-code-twenty-seventh-use.md",
  "2026-09-06-code-twenty-eighth-use.md",
  "2026-09-07-code-twenty-ninth-use.md",
  "2026-09-07-code-thirtieth-use.md",
  "2026-09-07-code-thirty-first-use.md",
];

test("1. the no source case and the break it rule are where a build begins", () => {
  const start = section("code", "1\\. Read what is fixed, then start red");
  assert.ok(start, "no starting section");
  for (const phrase of [
    /text and not source/i,
    /no unit layer/i,
    /the layers that exist/i,
    /has not been seen red/i,
    /broken and watched to fail/i,
    /came from the environment rather than the code/i,
  ])
    assert.match(start, phrase, "not in the starting section");
});

test("2. a text line's proof is its presence and its place, in the rule it qualifies", () => {
  const build = section("code", "3\\. Build to the proof");
  assert.ok(build, "no build section");
  assert.match(build, /its presence and its place/i);
  assert.match(build, /never its meaning/i);
  // What code-v2 fixed in the Nothing untested bullet is untouched.
  assert.match(
    build,
    /because a test needs it/i,
    "a closed task's sentence moved",
  );
});

test("3. the retros this task consumed are archived, and the counts did not move", () => {
  assert.equal(MOVED.length, 11);
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
      /^Feeds: `?code`?\.?\s*$/m.test(
        readFileSync(join(ROOT, "retros", f), "utf8"),
      ),
    )
    .filter((f) => !named.includes(f)).length;
  const line = r.stdout.match(/^code: (\d+) unconsumed$/m);
  assert.ok(line, r.stdout);
  assert.equal(Number(line[1]), expected, r.stdout);
});
