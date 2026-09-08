// Acceptance tests for requirement an-architect-names-its-principles. One
// per criterion. Surface only: the architect skill's text, its references,
// the drawing template, and the drawings command on a fixture root.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const SKILL = join(ROOT, "skills", "architect");
const PRINCIPLES = join(SKILL, "references", "principles");
const fold = (s) => s.replace(/\s+/g, " ");
const text = () => readFileSync(join(SKILL, "SKILL.md"), "utf8");
const template = () =>
  readFileSync(join(SKILL, "references", "drawing.md"), "utf8");
// A paragraph of a named section, so a rule is read where it is stated.
const paras = (heading, re) => {
  const m = text().match(
    new RegExp(
      `^## ${heading}[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`,
      "m",
    ),
  );
  assert.ok(m, `the skill has no section ${heading}`);
  return m[1]
    .split(/\n\s*\n/)
    .map(fold)
    .filter((x) => re.test(x))
    .join(" ");
};
const principle = (name) => {
  const p = join(PRINCIPLES, `${name}.md`);
  assert.ok(existsSync(p), `there is no principle file ${name}.md`);
  return fold(readFileSync(p, "utf8"));
};

test("1. a principle is a file the architect keeps, and the skill says what is in one", () => {
  assert.ok(existsSync(PRINCIPLES), "the architect keeps no principles");
  const files = readdirSync(PRINCIPLES).filter((f) => f.endsWith(".md"));
  assert.ok(files.length >= 1, "the directory holds no principle");
  // The paragraphs of the whole skill that mention a principle, wherever
  // the build puts them. `paras` takes a named section and the build has
  // not chosen a name yet, so this reads the page and slices by paragraph.
  const said = readFileSync(join(SKILL, "SKILL.md"), "utf8")
    .split(/\n\s*\n/)
    .map(fold)
    .filter((x) => /principle/i.test(x))
    .join(" ");
  assert.ok(said, "the skill never says what a principle is");
  const shape = said
    .split(/(?<=\.)\s+/)
    .filter((s) => /pull|tension/i.test(s))
    .join(" ");
  assert.ok(shape, `the two pulls are not asked for: ${said}`);
  assert.match(
    shape,
    /buys?|bought/i,
    `what each pull buys is not asked for: ${shape}`,
  );
  assert.match(
    shape,
    /costs?|spends?/i,
    `what each pull costs is not asked for: ${shape}`,
  );
  assert.match(
    said,
    /which side|which pull|tell(s)? (you )?apart|apart/i,
    `how to tell which side a case is on is not asked for: ${said}`,
  );
});

test("2. the decision record carries what the choice was weighed against", () => {
  const rec = template().match(/^### <decision>\n([\s\S]*?)(?=^## )/m);
  assert.ok(rec, "the template has no decision record");
  assert.match(rec[1], /^- Weighed against: /m, `no line: ${rec[1]}`);
  const line = rec[1].match(/^- Weighed against: (.*)$/m)[1];
  assert.match(line, /none/i, `the line does not offer none: ${line}`);
  assert.match(
    line,
    /principle/i,
    `the line does not name principles: ${line}`,
  );
});

test("3. the wall resolves a cited principle, and reports the one that does not", () => {
  const fx = join(HERE, "fixtures", "cites-nothing");
  const r = spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "drawings", fx],
    { encoding: "utf8" },
  );
  const said = r.stdout + r.stderr;
  assert.equal(r.status, 1, `the wall answered a dangling citation: ${said}`);
  assert.match(said, /a-task/, `the drawing is not named: ${said}`);
  assert.match(
    said,
    /a-principle-nobody-wrote/,
    `the name that resolves to nothing is not named: ${said}`,
  );
  // Citation only. The principle that does resolve is not judged, so its
  // name is not a finding.
  const findings = said.split("\n").filter((l) => /a-task/.test(l));
  assert.ok(
    !findings.some((l) => /the-two-goods/.test(l)),
    `the wall judged a principle that resolves: ${findings.join(" | ")}`,
  );
  // And `none` names nothing. The first fixture cites two principles and
  // never exercised the answer the template offers, so dropping the guard
  // for it reddened no test.
  assert.ok(
    !said.split("\n").some((l) => /says-none/.test(l) && /principles:/.test(l)),
    `the wall read none as a principle: ${said}`,
  );
});

test("4. the architect's retro carries the lens", () => {
  // The closing instruction, not the page: the section that introduces
  // principles says "retro" and "tension" for its own reasons, and a match
  // over the skill was green with the lens deleted.
  const hand = fold(
    readFileSync(join(SKILL, "SKILL.md"), "utf8").match(
      /^## \d+\. Hand off\n([\s\S]*?)(?=^## |(?![\s\S]))/m,
    )?.[1] ?? "",
  );
  assert.ok(hand, "the skill has no hand off section");
  const lens = hand
    .split(/(?<=\.)\s+/)
    .filter((s) => /tension|weigh/i.test(s))
    .join(" ");
  assert.ok(lens, "the retro instruction carries no lens");
  // The instruction to name them, which is the lens. The sentence defining
  // when a tension becomes a principle also says "tension" and "without a
  // name", so it satisfied everything below on its own.
  assert.match(
    hand,
    /name which|say which|names? which/i,
    `the retro is not told to name the tensions: ${hand}`,
  );
  assert.match(
    lens,
    /no name|without a name|unnamed/i,
    `the unnamed tension is not asked for: ${lens}`,
  );
  // And what makes one a candidate, so every drawing does not nominate one.
  const bar = hand
    .split(/(?<=\.)\s+/)
    .filter(
      (s) => /more than once|twice|again/i.test(s) && /principle/i.test(s),
    )
    .join(" ");
  assert.ok(bar, "nothing says when a tension becomes a principle");
});

test("5. the two goods has one home, and the skill cites it", () => {
  const p = principle("the-two-goods");
  assert.match(p, /shortest path/i, "the first pull is missing");
  assert.match(p, /choices open|most choices/i, "the second pull is missing");
  // The skill cites rather than restates: the words that were the principle
  // live in the file now, and a copy in the skill is the two homes this
  // task exists to prevent.
  const t = fold(text());
  assert.match(t, /the-two-goods/, "the skill does not cite the principle");
  assert.doesNotMatch(
    t,
    /Two goods pull at every choice and they are usually in tension/,
    "the principle is still written out in the skill as well",
  );
});

test("6. the seat owns the lens is written as a principle", () => {
  const whole = principle("the-seat-owns-the-lens");
  const from = whole.indexOf("## The pull");
  const to = whole.indexOf("## Where it came from");
  assert.ok(from > -1 && to > from, "the file has no pulls, or no provenance");
  // The pulls, not the provenance: it quotes the asker saying the
  // principle's own name, so a match over the file was green with the pull
  // itself deleted.
  const p = whole.slice(from, to);
  // Both pulls, each asserted on its own: an alternation passes on a file
  // that states one side and calls it a principle.
  assert.match(p, /method/i, `the shared method pull is missing: ${p}`);
  assert.match(
    p,
    /every seat|same way/i,
    `why the method is shared is missing: ${p}`,
  );
  assert.match(
    p,
    /\bseat owns\b|owned by the seat/i,
    `the seat's pull is missing: ${p}`,
  );
  assert.match(
    p,
    /pointed at|its own work|its own layer/i,
    `what the seat owns is not said: ${p}`,
  );
});
