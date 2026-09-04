// Acceptance tests for requirement skills-v1. One per criterion, numbered to
// match. Surface only: the files under skills/ and retros/. Nothing here
// knows how a skill is written, only what it must contain.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKILLS = join(ROOT, "skills");
const EXPECTED = [
  "analyse",
  "architect",
  "code",
  "test",
  "operate",
  "retro-4ls",
].sort();
const DELIVERY = EXPECTED.filter((n) => n !== "retro-4ls");
const VENDORS = [
  /claude\.ai/i,
  /\bclaude code\b/i,
  /\bcopilot\b/i,
  /\bchatgpt\b/i,
  /\bopenai\b/i,
  /\bgemini\b/i,
  /\bperplexity\b/i,
];

const dirs = () =>
  existsSync(SKILLS)
    ? readdirSync(SKILLS)
        .filter((n) => statSync(join(SKILLS, n)).isDirectory())
        .sort()
    : [];
const skillMd = (n) => readFileSync(join(SKILLS, n, "SKILL.md"), "utf8");
const frontmatter = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(m, "no frontmatter");
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1");
  }
  return { data, body: m[2] };
};
const headings = (body) =>
  body
    .split("\n")
    .filter((l) => /^##+ /.test(l))
    .map((l) => l.toLowerCase());
const walkMd = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? walkMd(join(dir, e.name))
      : e.name.endsWith(".md")
        ? [join(dir, e.name)]
        : [],
  );

test("1. skills/ holds exactly the six skills", () => {
  assert.deepEqual(dirs(), EXPECTED);
});

test("2. frontmatter: name matches directory, description bounded, license MIT", () => {
  for (const n of EXPECTED) {
    const { data } = frontmatter(skillMd(n));
    assert.equal(data.name, n, `${n}: name`);
    assert.ok(
      data.description && data.description.length <= 1024,
      `${n}: description`,
    );
    assert.equal(data.license, "MIT", `${n}: license`);
  }
});

test("3. body under 500 lines, references one level deep", () => {
  for (const n of EXPECTED) {
    const text = skillMd(n);
    assert.ok(text.split("\n").length < 500, `${n}: body length`);
    for (const m of text.matchAll(/\]\(([^)]+)\)/g)) {
      const t = m[1];
      if (/^[a-z]+:/.test(t)) continue;
      assert.ok(t.split("/").length <= 2, `${n}: link too deep: ${t}`);
    }
  }
});

test("4. no vendor or runtime named, no en-dash or em-dash", () => {
  for (const n of EXPECTED)
    for (const f of walkMd(join(SKILLS, n))) {
      const text = readFileSync(f, "utf8");
      for (const re of VENDORS) assert.ok(!re.test(text), `${f}: names ${re}`);
      assert.ok(!/[\u2013\u2014]/.test(text), `${f}: dash`);
    }
});

test("5. every delivery skill carries want, proof, scope (allowed, not allowed), handoff", () => {
  for (const n of DELIVERY) {
    const { body } = frontmatter(skillMd(n));
    const h = headings(body).join("\n");
    assert.ok(/\bwant\b/.test(h), `${n}: no want heading`);
    assert.ok(/\bproof\b/.test(h), `${n}: no proof heading`);
    assert.ok(/\bscope\b/.test(h), `${n}: no scope heading`);
    assert.ok(/hand ?off/.test(h), `${n}: no handoff heading`);
    assert.ok(
      /^Allowed:/m.test(body) && /^Not allowed:/m.test(body),
      `${n}: scope lists`,
    );
  }
});

test("6. operate does not deploy to production without the human's key", () => {
  const { body } = frontmatter(skillMd("operate"));
  const scope = body.split(/^## /m).find((s) => /^[^\n]*scope/i.test(s)) ?? "";
  assert.ok(
    /production/i.test(scope) && /human/i.test(scope) && /\bkey\b/i.test(scope),
    "limit not stated in scope",
  );
});

test("7. moves.json: every move named, on a known rung, no unevidenced skill or script", () => {
  for (const n of EXPECTED) {
    const p = join(SKILLS, n, "moves.json");
    assert.ok(existsSync(p), `${n}: no moves.json`);
    const { moves } = JSON.parse(readFileSync(p, "utf8"));
    assert.ok(Array.isArray(moves) && moves.length > 0, `${n}: no moves`);
    for (const m of moves) {
      assert.ok(m.name, `${n}: unnamed move`);
      assert.ok(
        ["human", "nlp", "skill", "script"].includes(m.rung),
        `${n}: rung ${m.rung}`,
      );
      if (m.rung === "skill" || m.rung === "script")
        assert.ok(m.test, `${n}: ${m.name} claims ${m.rung} with no test`);
    }
  }
});

test("8. every skill has a fixture with ask.md and expect.md", () => {
  for (const n of EXPECTED) {
    const f = join(SKILLS, n, "fixtures");
    assert.ok(existsSync(f), `${n}: no fixtures`);
    const cases = readdirSync(f).filter((c) =>
      statSync(join(f, c)).isDirectory(),
    );
    assert.ok(cases.length >= 1, `${n}: no fixture case`);
    for (const c of cases)
      for (const file of ["ask.md", "expect.md"])
        assert.ok(existsSync(join(f, c, file)), `${n}/${c}: no ${file}`);
  }
});

test("9. a retro on a real use exists and analyse carries an edit traced to it", () => {
  const R = join(ROOT, "retros");
  assert.ok(existsSync(R), "no retros/");
  const retros = readdirSync(R).filter((f) => f.endsWith(".md"));
  assert.ok(retros.length >= 1, "no retro filed");
  const named = retros.filter((f) =>
    /analyse/.test(readFileSync(join(R, f), "utf8")),
  );
  assert.ok(named.length >= 1, "no retro names a skill");
  assert.ok(
    /retros\//.test(skillMd("analyse")),
    "analyse does not trace an edit to a retro",
  );
});
