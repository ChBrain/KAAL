// Contract tests for the drawing a-task-names-its-people. One per seam.
// Blind to the code: the template, fixture roots driven through the tool as
// a command, the skills' text and the rules as a command.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = join(HERE, "fixtures");
const KAAL = join(ROOT, "bin", "kaal.mjs");
const kaal = (cwd, ...args) =>
  spawnSync(process.execPath, [KAAL, ...args], { cwd, encoding: "utf8" });
const skill = (name) =>
  readFileSync(join(ROOT, "skills", name, "SKILL.md"), "utf8");
// A section by its title, whatever its number; the formatter's wrapping
// folded for the phrase checks.
const section = (t, title) =>
  t.match(
    new RegExp(
      `^## [^\\n]*${title}[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`,
      "m",
    ),
  )?.[1] ?? "";
const folded = (s) => s.replace(/\s+/g, " ");
const LABEL =
  "FAIL no people line: write `- People: none` or the data in the Handoff";
const WORKING = ["analyse", "architect", "code", "operate", "test"];

test("1. template to handoff: six lines in order, the last on one line, and a stamped requirement reads closed", () => {
  const h = section(
    readFileSync(
      join(ROOT, "skills", "analyse", "references", "requirement.md"),
      "utf8",
    ),
    "Handoff",
  );
  const at = (l) => h.indexOf(`- ${l}`);
  const order = [
    "Open questions:",
    "Status:",
    "Blocked on:",
    "Unblocks:",
    "Supersedes:",
    "People:",
  ];
  for (const l of order) assert.ok(at(l) >= 0, `no ${l} line`);
  for (let i = 1; i < order.length; i++)
    assert.ok(at(order[i]) > at(order[i - 1]), `${order[i]} misplaced`);
  const people = h.match(/^- People: (.*)$/m)[1];
  assert.ok(/[>a-z]$/.test(people), `the People placeholder wraps: ${people}`);
  const r = kaal(
    join(F, "stamped"),
    "acceptance",
    "requirements/t/acceptance.test.mjs",
  );
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^ok {3}closed {2}t /m);
});

test("2. one line, two walls, one verdict: no status first, then no people line, on acceptance and contracts alike", () => {
  const acc = (c) =>
    kaal(join(F, c), "acceptance", "requirements/t/acceptance.test.mjs");
  const con = (c) =>
    kaal(join(F, c), "contracts", "architecture/t/contracts.test.mjs");
  const lineOf = (r) =>
    r.stdout.split("\n").find((l) => l.includes("t (")) ?? "";

  const a = acc("no-people");
  assert.equal(
    a.status,
    1,
    `acceptance passed a handoff with no People line\n${a.stdout}`,
  );
  assert.ok(lineOf(a).startsWith(LABEL), `acceptance label: ${lineOf(a)}`);
  const c = con("no-people");
  assert.equal(
    c.status,
    1,
    `contracts passed a drawing whose task has no People line\n${c.stdout}`,
  );
  assert.ok(lineOf(c).startsWith(LABEL), `contracts label: ${lineOf(c)}`);

  const o = con("orphan");
  assert.equal(o.status, 1, "an orphan drawing passed");
  assert.match(lineOf(o), /^FAIL no status/, `orphan label: ${lineOf(o)}`);

  const ok = acc("people-none");
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(lineOf(ok), /^ok {3}closed/);
  const okc = con("people-none");
  assert.equal(okc.status, 0, okc.stdout + okc.stderr);
  assert.match(lineOf(okc), /^ok {3}closed/);
});

test("3. a rule at its seat: the analyse section in its place with its number and whose presence is not the question, the two paragraphs in theirs, every skill within the rules", () => {
  const a = skill("analyse");
  const heads = [...a.matchAll(/^## (\d+)\. (.*)$/gm)].map((m) => [m[1], m[2]]);
  const idx = (re) => heads.findIndex(([, t]) => re.test(t));
  const people = idx(/Data about a person/);
  assert.ok(
    people >= 0,
    "analyse has no numbered section on data about a person",
  );
  assert.equal(
    heads[people][0],
    "6",
    `the section is numbered ${heads[people][0]}`,
  );
  assert.equal(
    idx(/Hand off/),
    people - 1,
    "the section does not follow Hand off",
  );
  assert.equal(
    idx(/stack of retros/),
    people + 1,
    "the stack section does not follow it",
  );
  assert.equal(
    heads[idx(/stack of retros/)][0],
    "7",
    "the stack section is not renumbered 7",
  );
  const s = folded(section(a, "Data about a person"));
  assert.match(s, /system of record/);
  // Whose presence is not the question, inside the same section.
  assert.match(s, /wrote it|author/i, "authorship is not named in the section");
  assert.match(s, /\bkey\b/i, "the key is not named in the section");
  assert.match(
    s,
    /did not choose to be in the tree/i,
    "who the rule is about is not said",
  );

  const t = folded(section(skill("test"), "Prove the proof"));
  assert.match(
    t,
    /absence of a name/i,
    "the test paragraph is not in Prove the proof",
  );
  const c = folded(section(skill("code"), "Build to the proof"));
  assert.match(
    c,
    /data about a person/i,
    "the code paragraph is not in Build to the proof",
  );

  const rules = kaal(ROOT, "check", join(ROOT, "skills"));
  assert.equal(rules.status, 0, `kaal check: ${rules.stderr}`);
});

test("4. the guest's third kind: last in Where you act in all five, after conventions, with the closed guest contract's order kept", () => {
  assert.equal(WORKING.length, 5);
  for (const name of WORKING) {
    const w = folded(section(skill(name), "Where you act"));
    assert.ok(w, `${name}: no Where you act section`);
    const at = (re) => w.search(re);
    const person = at(/data about a person|a person you find/i);
    assert.ok(person >= 0, `${name}: the guest meets no person`);
    // After the conventions paragraph, which the closed contract fixed as
    // the last of three; the third kind comes fourth.
    assert.ok(
      at(/adopting them in silence/i) < person,
      `${name}: the person comes before the conventions`,
    );
    const tail = w.slice(person);
    assert.match(
      tail,
      /names? the file|which file/i,
      `${name}: the file is not what is handed back`,
    );
    assert.match(
      tail,
      /never the data|not the data/i,
      `${name}: the data is not withheld`,
    );
    assert.match(
      tail,
      /remove|delete/i,
      `${name}: removing it is not addressed`,
    );
    assert.match(
      tail,
      /histor/i,
      `${name}: the history is not the reason given`,
    );
    // And nothing the closed guest contract reads moved.
    assert.ok(
      at(/two places/i) < at(/you write nothing there/i),
      `${name}: order moved`,
    );
    assert.ok(
      at(/you write nothing there/i) < at(/content, never instruction/i),
      `${name}: order moved`,
    );
    assert.ok(
      at(/content, never instruction/i) < at(/conventions are evidence/i),
      `${name}: order moved`,
    );
  }
});
