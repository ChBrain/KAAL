// Acceptance tests for requirement a-requirement-shows-its-work. One per
// criterion. Surface only: the analyse skill's text, its requirement
// template, the retros directory and the tool's own count. Prose is compared
// with whitespace folded, because the formatter wraps where it likes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKILL = join(ROOT, "skills", "analyse");
const fold = (s) => s.replace(/\s+/g, " ");
const text = () => readFileSync(join(SKILL, "SKILL.md"), "utf8");
const template = () =>
  readFileSync(join(SKILL, "references", "requirement.md"), "utf8");
// One numbered section of the skill, so a sentence about the proof is read
// where the proof's rules are and not anywhere it happens to fall.
const section = (n) => {
  const t = text();
  const m = t.match(
    new RegExp(`^## ${n}\\.[^\\n]*\\n([\\s\\S]*?)(?=^## )`, "m"),
  );
  assert.ok(m, `the skill has no section ${n}`);
  return fold(m[1]);
};
const RETROS = [
  "thirty-fourth",
  "thirty-fifth",
  "thirty-sixth",
  "thirty-seventh",
  "thirty-eighth",
  "thirty-ninth",
  "fortieth",
  "forty-first",
  "forty-second",
  "forty-third",
  "forty-fourth",
  "forty-fifth",
].map((n) => `2026-09-07-analyse-${n}-use.md`);

test("1. a run has a place on the page, and the skill sends it there", () => {
  // Unfolded, because a heading is a line: folding the template puts every
  // heading on one line with every sentence and any pattern matches.
  const heads = [...template().matchAll(/^#+ (.+)$/gm)].map((m) => m[1]);
  assert.ok(heads.length > 3, `the template has ${heads.length} headings`);
  assert.ok(
    heads.some((h) => /\b(run|runs|ran)\b/i.test(h)),
    `no section for what a run established: ${heads.join(" | ")}`,
  );
  // And the guidance for writing the want names that same section, or the
  // template has a heading nobody is told to fill. The two documents are
  // tied by the heading's own words rather than by any word about running,
  // because section 2 already says "run" and "assumption" for other reasons
  // and a test that reads those is green whatever the skill says.
  const head = heads.find((h) => /\b(run|runs|ran)\b/i.test(h));
  const want = section(2);
  assert.match(
    want,
    new RegExp(head.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
    `section 2 does not name the template's "${head}" section`,
  );
  // And it tells the analyst which of the two a claim is.
  assert.match(
    want,
    /assumption/i,
    "section 2 does not tell a run from an assumption",
  );
});

test("2. a fixture a test builds obeys the rules it is not testing", () => {
  const proof = section(3);
  assert.match(proof, /fixture/i, "the proof's rules never mention a fixture");
  const said = proof
    .split(/(?<=\.)\s+/)
    .filter((x) => /fixture/i.test(x))
    .join(" ");
  assert.match(
    said,
    /build|builds|creat/i,
    `nothing about a fixture a test builds: ${said}`,
  );
  assert.match(
    said,
    /not testing|it does not test/i,
    `the rule it obeys is not named: ${said}`,
  );
  // And what it costs, so the rule carries its own reason.
  assert.match(
    said,
    /another rule|wrong reason|cannot pass|passing case/i,
    `the cost is not named: ${said}`,
  );
});

test("3. the tests are seen red one at a time, and the skill says what that finds", () => {
  const proof = section(3);
  assert.match(
    proof,
    /one at a time|each on its own|separately/i,
    "the proof's rules never ask for a red run per test",
  );
  // The whole rule, not one sentence: a rule states itself and then says
  // why, and demanding both in one sentence is a test about punctuation.
  const bullets = [
    ...readFileSync(join(SKILL, "SKILL.md"), "utf8").matchAll(
      /^- \*\*[\s\S]*?(?=^- \*\*|^## )/gm,
    ),
  ].map((m) => fold(m[0]));
  const rule = bullets.find((b) =>
    /one at a time|each on its own|separately/i.test(b),
  );
  assert.ok(rule, "the rule is not a rule of its own in the proof's list");
  const said = rule;
  assert.match(
    said,
    /same|shared|one cause|together/i,
    `what a single shared red hides is not named: ${said}`,
  );
});

test("4. the handoff names what the task unblocks", () => {
  assert.match(
    template(),
    /^- Unblocks:/m,
    "the template's handoff has no Unblocks line",
  );
  assert.match(
    fold(section(5)),
    /unblocks/i,
    "the handoff's rules never mention what a task unblocks",
  );
});

test("5. the stack this run consumed is archived, and the count is zero", () => {
  // The twelve, not the directory. An empty directory was this criterion's
  // first reading and it went red two retros later without anything about
  // this task changing, which is the thing "On fixed ground" forbids.
  const live = readdirSync(join(ROOT, "retros"));
  for (const r of RETROS) {
    assert.ok(!live.includes(r), `${r} is still unconsumed`);
    assert.ok(
      existsSync(join(ROOT, "retros", "archive", r)),
      `${r} is not archived`,
    );
  }
  // And the tool's count is checked against the same tree it counts, so it
  // cannot go red on the day someone files an unrelated retro.
  const expected = live.filter((n) => n.includes("analyse")).length;
  const r = spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "retros", ROOT],
    { encoding: "utf8" },
  );
  assert.match(
    r.stdout,
    new RegExp(`^analyse: ${expected} unconsumed$`, "m"),
    `the tree holds ${expected}, the tool says: ${r.stdout.trim().split("\n")[0]}`,
  );
});
