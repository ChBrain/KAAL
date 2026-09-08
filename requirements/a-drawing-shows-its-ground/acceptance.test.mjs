// Acceptance tests for requirement a-drawing-shows-its-ground. One per
// criterion. Surface only: the architect skill's text, its drawing template,
// the retros directory and the tool's own count. Prose is compared with
// whitespace folded, because the formatter wraps where it likes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKILL = join(ROOT, "skills", "architect");
const fold = (s) => s.replace(/\s+/g, " ");
const text = () => readFileSync(join(SKILL, "SKILL.md"), "utf8");
const template = () =>
  readFileSync(join(SKILL, "references", "drawing.md"), "utf8");
// The bullets of the skill's list for one section, each read whole: a rule
// states itself and then says why, and reading one sentence is a test about
// punctuation rather than about the rule.
const bullets = (heading) => {
  const t = text();
  const m = t.match(
    new RegExp(`^## ${heading}[^\\n]*\\n([\\s\\S]*?)(?=^## )`, "m"),
  );
  assert.ok(m, `the skill has no section ${heading}`);
  // The lookahead ends at the next bullet or at the end of the section's
  // text. Not `$`, which under the multiline flag is the end of a line and
  // cuts every bullet to its first line.
  return [...m[1].matchAll(/^- \*\*[\s\S]*?(?=^- \*\*|(?![\s\S]))/gm)].map(
    (x) => fold(x[0]),
  );
};
const RETROS = [
  "thirty-first",
  "thirty-second",
  "thirty-third",
  "thirty-fourth",
  "thirty-fifth",
  "thirty-sixth",
  "thirty-seventh",
  "thirty-eighth",
  "thirty-ninth",
  "fortieth",
  "forty-first",
].map((n) => `2026-09-07-architect-${n}-use.md`);

test("1. a run has a place on the page, and the skill sends it there", () => {
  const heads = [...template().matchAll(/^#+ (.+)$/gm)].map((m) => m[1].trim());
  assert.ok(heads.length > 3, `the template has ${heads.length} headings`);
  assert.ok(
    heads.includes("What the runs said"),
    `no "What the runs said" section: ${heads.join(" | ")}`,
  );
  // And the guidance names that same section, or the template has a heading
  // nobody is told to fill. Tied by the heading's own words, because the
  // skill already says "run" for other reasons.
  const drawing = bullets("2\\. Draw the want").join(" ");
  assert.match(
    drawing,
    /What the runs said/,
    "the drawing's sections never name the runs section",
  );
});

test("2. an empty seam or layer is written in the table, not under it", () => {
  const said = bullets("2\\. Draw the want")
    .filter((b) => /test strategy|strategy table|no criterion|empty/i.test(b))
    .join(" ");
  assert.ok(said, "nothing in the drawing's sections mentions the strategy");
  assert.match(
    said,
    /no criterion|serves no|nothing below|empty/i,
    `a seam or layer with nothing in it is not covered: ${said}`,
  );
  assert.match(
    said,
    /table/i,
    `the table is not named as where it goes: ${said}`,
  );
  assert.match(said, /reason|why/i, `the reason is not asked for: ${said}`);
});

test("3. a far side that is not built is a guess, and names the task that answers it", () => {
  const t = fold(text());
  assert.match(
    t,
    /not (yet )?(built|filed|written)|does not exist yet/i,
    "nothing about a far side that is not built",
  );
  const said = fold(text())
    .split(/(?<=\.)\s+/)
    .filter((x) =>
      /not (yet )?(built|filed|written)|does not exist yet|guess/i.test(x),
    )
    .join(" ");
  assert.match(said, /guess/i, `it is not drawn as a guess: ${said}`);
  assert.match(said, /task/i, `no task is named: ${said}`);
  // And the other half: a decision that opens a gap names what closes it.
  const decisions = bullets("2\\. Draw the want")
    .filter((b) => /\*\*Decisions/.test(b))
    .join(" ");
  // Both words, and not an alternation: `closes` alone matches `forecloses`
  // in the rule about pricing a choice, which is a different sentence
  // entirely and made this half green while holding nothing.
  assert.match(
    decisions,
    /\bgap\b/i,
    `a decision that opens a gap is not covered: ${decisions}`,
  );
  assert.match(
    decisions,
    /\btask\b/i,
    `the task that closes it is not named: ${decisions}`,
  );
});

test("4. a contract may assert a count only when it computes it", () => {
  const proof = bullets("3\\. Write the proof").join(" ");
  assert.match(proof, /\bcount\b/i, "the proof's rules never mention a count");
  const said = bullets("3\\. Write the proof")
    .filter((b) => /\bcount\b/i.test(b))
    .join(" ");
  assert.match(
    said,
    /comput|from the (same )?tree|itself/i,
    `the rule does not say the count is computed: ${said}`,
  );
  assert.match(said, /red|fail/i, `what it prevents is not named: ${said}`);
});

test("5. the stack this run consumed is archived, and the count is zero", () => {
  const live = readdirSync(join(ROOT, "retros")).filter((n) =>
    n.includes("architect"),
  );
  assert.deepEqual(live, [], `still unconsumed: ${live.join(", ")}`);
  for (const r of RETROS)
    assert.ok(
      existsSync(join(ROOT, "retros", "archive", r)),
      `${r} is not archived`,
    );
  const r = spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "retros", ROOT],
    { encoding: "utf8" },
  );
  assert.match(
    r.stdout,
    /^architect: 0 unconsumed$/m,
    `the tool counts: ${r.stdout.trim()}`,
  );
});
