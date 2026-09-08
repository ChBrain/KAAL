// Acceptance tests for requirement a-build-says-what-it-proved. One per
// criterion. Surface only: the code skill's text, the retros directory and
// the tool's own count. Each test reads the section its criterion is about
// and, where a rule states itself and then says why, the rule's own
// sentence: a pattern read across a whole section is satisfied by the half
// that explains it, which has been green while holding nothing four times
// this week.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKILL = join(ROOT, "skills", "code", "SKILL.md");
const fold = (s) => s.replace(/\s+/g, " ");
const text = () => readFileSync(SKILL, "utf8");
const section = (heading) => {
  const m = text().match(
    new RegExp(
      `^## ${heading}[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`,
      "m",
    ),
  );
  assert.ok(m, `the skill has no section ${heading}`);
  return m[1];
};
// The sentences of a section that mention a thing, so a rule is read where
// it is stated and not wherever its words happen to fall.
const about = (heading, re) =>
  fold(section(heading))
    .split(/(?<=\.)\s+/)
    .filter((s) => re.test(s))
    .join(" ");
// The paragraphs of a section that mention a thing. Folding a whole section
// and splitting on full stops makes one pseudo sentence of every heading and
// every fenced block, and three assertions here were green against text
// three sections away because of it. A paragraph is a paragraph.
const paras = (heading, re) =>
  section(heading)
    .split(/\n\s*\n/)
    .map(fold)
    .filter((x) => re.test(x))
    .join(" ");
const RETROS = [
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
  "forty-second",
  "forty-third",
  "forty-fourth",
].map((n) => `2026-09-07-code-${n}-use.md`);

test("1. the handoff is named lines, and one of them is the class", () => {
  const hand = section("5\\. Hand off");
  // Named lines, the shape the other seats' handoffs use, not a sentence
  // listing contents. Read unfolded: a line is a line.
  const lines = [...hand.matchAll(/^- ([A-Z][^:\n]*):/gm)].map((m) => m[1]);
  assert.ok(
    lines.length >= 4,
    `the handoff names ${lines.length} line(s): ${lines.join(", ") || "none"}`,
  );
  assert.ok(
    lines.some((l) => /class/i.test(l)),
    `no line for the change class: ${lines.join(", ")}`,
  );
  // And the class is still the tooling's, never one the seat chose.
  assert.match(
    about("5\\. Hand off", /\bclass\b/i),
    /tooling|computes|computed/i,
    "the class is no longer the one the tooling computes",
  );
});

test("2. a proof that completes elsewhere says so, and where", () => {
  const said = about("5\\. Hand off", /unproven|completes|proves/i);
  assert.ok(said, "the handoff's rules never mention what is unproven");
  assert.match(
    said,
    /unproven|not (yet )?prove/i,
    `what is still unproven is not asked for: ${said}`,
  );
  // The line itself, in the block criterion 1 asks for. The prose beneath
  // states the rule and a reader writing a handoff copies the lines, so a
  // rule with no line to write it on is a rule nobody fills in.
  const named = [
    ...section("5\\. Hand off").matchAll(/^- ([A-Z][^:\n]*):/gm),
  ].map((m) => m[1]);
  assert.ok(
    named.some((l) => /unproven|unfinished|elsewhere/i.test(l)),
    `no handoff line for what is unproven: ${named.join(", ")}`,
  );
  // The three cases the stack named, each on its own: an alternation would
  // pass on a rule that covers one of them.
  const hand = fold(section("5\\. Hand off"));
  assert.match(hand, /runtime/i, "another runtime is not named");
  assert.match(hand, /\bjob\b|after the merge/i, "a later job is not named");
  assert.match(
    hand,
    /history/i,
    "a proof that reads history rather than the tree is not named",
  );
});

test("3. a change to a shared reader carries its sweep, in three parts", () => {
  const build = section("3\\. Build to the proof");
  const bullets = [
    ...build.matchAll(/^- \*\*[\s\S]*?(?=^- \*\*|(?![\s\S]))/gm),
  ].map((m) => fold(m[0]));
  const rule = bullets
    .filter((b) => /fixture/i.test(b) && /generat/i.test(b))
    .join(" ");
  assert.ok(
    rule,
    `no rule covers fixtures and generated files: ${bullets.length} bullet(s)`,
  );
  assert.match(
    rule,
    /owes? the fix|owe the fix/i,
    `the fixtures that owe the fix are not named: ${rule}`,
  );
  // The pinned case, which is the half that is easy to get wrong: moving it
  // breaks the record instead.
  assert.match(
    rule,
    /\bsha\b|pins|pinned/i,
    `a fixture a record pins is not named: ${rule}`,
  );
  assert.match(
    rule,
    /record/i,
    `why a pinned fixture owes nothing is not said: ${rule}`,
  );
  assert.match(
    rule,
    /regenerat|tooling/i,
    `a generated file is not sent to the repository's tooling: ${rule}`,
  );
  assert.match(
    rule,
    /never by hand|not by hand/i,
    `by hand is not refused: ${rule}`,
  );
});

test("4. a record wrong in one sentence is corrected in place, not handed back", () => {
  const said = paras("4\\. Scope", /corrected|in place/i);
  assert.ok(said, "the skill's scope never mentions correcting a record");
  assert.match(said, /in place/i, `correcting in place is not named: ${said}`);
  assert.match(
    said,
    /mark|say so|said so|says so/i,
    `marking it as corrected is not asked for: ${said}`,
  );
  // The boundary, in the same paragraph. Section 4 already said "hand back
  // to the architect when the drawing does not fit" for its own reasons, so
  // a search over the whole section was green with the boundary deleted.
  assert.match(
    said,
    /hand(ing)? (the drawing |it )?back/i,
    `handing back is not the other answer here: ${said}`,
  );
  assert.match(
    said,
    /does not fit|cannot be built|contradicts/i,
    `what handing back is for is not said: ${said}`,
  );
});

test("5. the build looks for a supersede the analyst did not name", () => {
  const said = paras("4\\. Scope", /supersede/i);
  assert.ok(said, "the skill's scope never mentions a supersede");
  // Read, not run. The cheap case is a closed contract going red, and this
  // criterion exists for the seams no wall holds, so `closed contract`
  // matched the sentence describing the cheap case while the instruction to
  // read was deleted. The instruction is asserted on its own.
  assert.match(said, /\bread\b/i, `the build is not told to read: ${said}`);
  assert.match(
    said,
    /closed test/i,
    `the closed tests are not where it looks: ${said}`,
  );
  assert.match(
    said,
    /handoff says|handoff names|says what you found/i,
    `the handoff is not asked to say what was found: ${said}`,
  );
});

test("6. the stack this run consumed is archived, and the tool agrees", () => {
  const live = readdirSync(join(ROOT, "retros"));
  for (const r of RETROS) {
    assert.ok(!live.includes(r), `${r} is still unconsumed`);
    assert.ok(
      existsSync(join(ROOT, "retros", "archive", r)),
      `${r} is not archived`,
    );
  }
  const expected = live.filter((n) => n.includes("code")).length;
  const r = spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "retros", ROOT],
    { encoding: "utf8" },
  );
  assert.match(
    r.stdout,
    new RegExp(`^code: ${expected} unconsumed$`, "m"),
    `the tree holds ${expected}, the tool says: ${r.stdout.trim()}`,
  );
});
