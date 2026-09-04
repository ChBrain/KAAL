// Acceptance tests for requirement agent-v1. One per criterion. Surface only:
// the agent directories, the tool as a command.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const A = join(ROOT, "agents");
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
const agents = () =>
  existsSync(A)
    ? readdirSync(A).filter((n) => statSync(join(A, n)).isDirectory())
    : [];
const fm = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(m, "no frontmatter");
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].trim();
  }
  return { data, body: m[2] };
};
const list = (v) =>
  (v ?? "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((s) => s.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
const headings = (body) =>
  body
    .split("\n")
    .filter((l) => /^## /.test(l))
    .map((l) => l.replace(/^## /, "").trim());

test("1. agents/kaal exists with binding, persona, ledger and a fixture", () => {
  const k = join(A, "kaal");
  for (const f of ["AGENT.md", "persona.md", "moves.json", "fixtures"])
    assert.ok(existsSync(join(k, f)), `kaal: no ${f}`);
  const cases = readdirSync(join(k, "fixtures")).filter((c) =>
    statSync(join(k, "fixtures", c)).isDirectory(),
  );
  assert.ok(cases.length >= 1, "no fixture");
  for (const c of cases)
    for (const f of ["ask.md", "expect.md"])
      assert.ok(existsSync(join(k, "fixtures", c, f)), `${c}: no ${f}`);
});

test("2. every binding's frontmatter: seven fields, name, division, resolving loadout and hands, a lane, MIT", () => {
  assert.ok(agents().length >= 1);
  for (const n of agents()) {
    const { data } = fm(readFileSync(join(A, n, "AGENT.md"), "utf8"));
    for (const f of [
      "name",
      "description",
      "division",
      "skills",
      "hands_to",
      "lane",
      "license",
    ])
      assert.ok(f in data, `${n}: no ${f}`);
    assert.equal(data.name, n);
    assert.ok(
      ["human", "nlp", "skill", "script"].includes(data.division),
      `${n}: division ${data.division}`,
    );
    for (const s of list(data.skills))
      assert.ok(
        existsSync(join(ROOT, "skills", s, "SKILL.md")),
        `${n}: skill ${s} does not resolve`,
      );
    for (const h of list(data.hands_to))
      assert.ok(
        existsSync(join(A, h, "AGENT.md")),
        `${n}: hands_to ${h} does not resolve`,
      );
    assert.ok(list(data.lane).length >= 1, `${n}: empty lane`);
    assert.equal(data.license, "MIT");
  }
});

test("3. binding sections and persona chapters in order; persona credits khai and carries no scope", () => {
  assert.ok(
    agents().length >= 1,
    "no agents: a check over none is green on nothing",
  );
  for (const n of agents()) {
    const { body } = fm(readFileSync(join(A, n, "AGENT.md"), "utf8"));
    assert.deepEqual(
      headings(body),
      ["Purpose", "Allowed", "Not allowed", "Input", "Output", "Handoff"],
      `${n}: binding sections`,
    );
    const p = readFileSync(join(A, n, "persona.md"), "utf8");
    const { data, body: pb } = fm(p);
    assert.deepEqual(
      headings(pb),
      ["Projection", "Action", "Shadow", "Tell"],
      `${n}: persona chapters`,
    );
    assert.ok(
      /khai/i.test(data.shape ?? data.credit ?? ""),
      `${n}: persona does not credit khai for its shape`,
    );
    assert.ok(
      !/\bAllowed\b|\bNot allowed\b/.test(pb),
      `${n}: persona carries scope`,
    );
  }
});

test("4. kaal agents accepts the league and refuses the bad agent, naming agent and rule", () => {
  const ok = kaal("agents");
  assert.equal(ok.status, 0, ok.stderr);
  const bad = kaal("agents", join(HERE, "fixtures", "bad-agent"));
  assert.equal(bad.status, 1, "bad agent not refused");
  assert.match(bad.stderr, /x.*name/);
});

test("5. Kaal is Kaal: the four chapters carried, the stamp in the Tell, the wheel in the Action, never edits", () => {
  const p = readFileSync(join(A, "kaal", "persona.md"), "utf8");
  assert.match(p, /## Action[\s\S]*wheel/);
  assert.match(p, /## Tell[\s\S]*stamp/);
  const b = readFileSync(join(A, "kaal", "AGENT.md"), "utf8");
  const notAllowed =
    b.split(/^## /m).find((s) => s.startsWith("Not allowed")) ?? "";
  assert.match(notAllowed, /edit/);
});
