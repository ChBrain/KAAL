// Acceptance tests for requirement the-test-tree-is-written-down. One per
// criterion. Surface only: the strategy and the plans as text, the board's
// config, and `kaal traces` run on fixture roots.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, globSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = (n) => join(HERE, "fixtures", n);
const STRATEGY = join(ROOT, "tests", "strategy.md");
const PLANS = join(ROOT, "tests", "plans");
const fold = (s) => s.replace(/\s+/g, " ");
const strategy = () => fold(readFileSync(STRATEGY, "utf8"));
const plans = () =>
  existsSync(PLANS)
    ? readdirSync(PLANS)
        .filter((f) => f.endsWith(".md"))
        .sort()
    : [];
const plan = (n) => fold(readFileSync(join(PLANS, n), "utf8"));
const gates = () =>
  JSON.parse(readFileSync(join(ROOT, "kaal.config.json"), "utf8")).gates;
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
  });
const said = (r) => r.stdout + r.stderr;
const notUsage = (out) =>
  assert.doesNotMatch(
    out,
    /^usage: kaal/m,
    `the command does not exist: ${out}`,
  );

test("1. the strategy names three plans and what motivates each", () => {
  assert.ok(existsSync(STRATEGY), "there is no tests/strategy.md");
  const s = strategy();
  // The three the board already runs, each asserted on its own: an
  // alternation passes on a page that names one and calls it a strategy.
  for (const name of ["acceptance", "contracts", "units"])
    assert.match(s, new RegExp(`\\b${name}\\b`), `the strategy omits ${name}`);
  // And what motivates each, which is the half the ask said the strategy
  // has to capture. Read as three sentences, not three words on a page.
  const sentences = readFileSync(STRATEGY, "utf8")
    .split(/(?<=\.)\s+/)
    .map(fold);
  for (const [wall, motive] of [
    ["acceptance", /requirement/i],
    ["contracts", /architect/i],
    ["units", /\bcode\b/i],
  ]) {
    const near = sentences.filter((x) => new RegExp(`\\b${wall}\\b`).test(x));
    assert.ok(
      near.some((x) => motive.test(x)),
      `nothing says what motivates ${wall}: ${near.join(" | ") || "no sentence names it"}`,
    );
  }
});

test("2. the strategy says what cannot be tested cannot be built", () => {
  const s = strategy();
  const sentences = readFileSync(STRATEGY, "utf8")
    .split(/(?<=\.)\s+/)
    .map(fold)
    .filter((x) => /cannot be tested|not testable|untestable/i.test(x));
  assert.ok(sentences.length, `the rule is not stated: ${s.slice(0, 200)}`);
  const rule = sentences.join(" ");
  assert.match(
    rule,
    /cannot be (built|coded|written)|is not built|no seat/i,
    `the rule says what is untestable and not what follows: ${rule}`,
  );
  // And why, which is the half that makes it a rule rather than a slogan.
  assert.match(
    rule + " " + s,
    /never know|nobody would know|no way to know|whether it (is|were) true/i,
    "nothing says why an untestable thing cannot be trusted",
  );
});

test("3. one plan per wall, each naming its wall, its suites and a case", () => {
  const all = plans();
  assert.ok(all.length >= 3, `found ${all.length} plans under tests/plans/`);
  for (const p of all) {
    const t = plan(p);
    const name = p.replace(/\.md$/, "");
    assert.match(t, new RegExp(`\\b${name}\\b`), `${p} does not name its wall`);
    assert.match(t, /\.test\.mjs/, `${p} does not say where its suites live`);
    assert.match(t, /case/i, `${p} does not say what a case is`);
  }
});

test("4. every wall has a plan and every plan a wall, reported either way", () => {
  const clean = kaal("traces", F("paired"));
  notUsage(said(clean));
  assert.equal(clean.status, 0, `a paired tree was refused: ${said(clean)}`);
  const unplanned = kaal("traces", F("wall-unplanned"));
  const a = said(unplanned);
  notUsage(a);
  assert.equal(unplanned.status, 1, `a wall with no plan passed: ${a}`);
  assert.match(a, /units/, `the wall with no plan is not named: ${a}`);
  const unwalled = kaal("traces", F("plan-unwalled"));
  const b = said(unwalled);
  notUsage(b);
  assert.equal(unwalled.status, 1, `a plan with no wall passed: ${b}`);
  assert.match(b, /smoke/, `the plan with no wall is not named: ${b}`);
  // Two directions, two findings: a reader must know which end is missing.
  assert.notEqual(
    a.replace(/units/g, ""),
    b.replace(/smoke/g, ""),
    "both directions are reported in the same words",
  );
});

test("5. the strategy and the plans are artefacts the trace wall reads", () => {
  const block = (p) =>
    readFileSync(p, "utf8").match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  assert.ok(block(STRATEGY), "the strategy carries no frontmatter block");
  for (const p of plans())
    assert.ok(block(join(PLANS, p)), `${p} carries no frontmatter block`);
  // Read by the wall, not merely present: a tree whose plan traces a name
  // that resolves to nothing is a finding like any other artefact's.
  const r = kaal("traces", ROOT);
  notUsage(said(r));
  assert.equal(r.status, 0, `the league's own traces are red: ${said(r)}`);
});

test("6. each plan's count of suites agrees with what its glob matches", () => {
  const testGates = gates().filter((g) => plans().includes(`${g.name}.md`));
  assert.ok(
    testGates.length >= 3,
    `only ${testGates.length} gates have a plan`,
  );
  for (const g of testGates) {
    const t = plan(`${g.name}.md`);
    const globs = [...t.matchAll(/`([^`]*\*[^`]*\.test\.mjs)`/g)].map(
      (m) => m[1],
    );
    assert.ok(globs.length, `${g.name}.md names no glob for its suites`);
    const found = globs.flatMap((p) => globSync(p, { cwd: ROOT })).length;
    const said = Number(t.match(/(\d+)\s+suite/)?.[1]);
    assert.ok(Number.isInteger(said), `${g.name}.md does not count its suites`);
    assert.equal(
      said,
      found,
      `${g.name}.md says ${said} suites and its glob matches ${found}`,
    );
  }
});
