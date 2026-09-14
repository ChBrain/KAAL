// Acceptance tests for retro-4ls-counts-what-it-feeds. One per criterion.
// They discover the counter from the skill's public move record and execute
// it as a copied skill. They never import the existing engine implementation.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { join, dirname, relative } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FIX = (name) => join(HERE, "fixtures", name);
const SKILL = () =>
  process.env.RETRO_4LS_SKILL_DIR ?? join(ROOT, "skills", "retro-4ls");
const said = (r) => `${r.stdout ?? ""}${r.stderr ?? ""}`;

const declaredCounter = (skill = SKILL()) => {
  const ledger = JSON.parse(readFileSync(join(skill, "moves.json"), "utf8"));
  const moves = ledger.moves ?? [];
  assert.ok(moves.length, "retro-4ls declares no moves");
  const move = moves.find((m) => /ten unconsumed retros/i.test(String(m.name)));
  assert.ok(move, "retro-4ls declares no unconsumed-retro counting move");
  assert.equal(
    move.rung,
    "script",
    `the unconsumed-retro counter is at ${move.rung}, not script`,
  );
  assert.ok(move.script, "the unconsumed-retro counter declares no script");
  assert.ok(move.test, "the unconsumed-retro counter declares no test");
  for (const [kind, rel] of [
    ["script", move.script],
    ["test", move.test],
  ]) {
    const outside = relative(skill, join(skill, rel)).startsWith("..");
    assert.ok(!outside, `the declared ${kind} is outside retro-4ls: ${rel}`);
    assert.ok(
      existsSync(join(skill, rel)),
      `the declared ${kind} is absent: ${rel}`,
    );
  }
  return { skill, move, script: join(skill, move.script) };
};

const runCounter = (name, root, skill = SKILL()) => {
  const { script } = declaredCounter(skill);
  return spawnSync(process.execPath, [script, name, root], {
    encoding: "utf8",
    cwd: skill,
  });
};

const count = (r, skill) => {
  assert.equal(r.status, 0, `counter failed: ${said(r)}`);
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = r.stdout.match(
    new RegExp(`^${escaped}: (\\d+) unconsumed$`, "m"),
  );
  assert.ok(match, `no unconsumed answer for ${skill}: ${said(r)}`);
  return Number(match[1]);
};

const kaal = (root) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), "retros", root], {
    encoding: "utf8",
  });

test("1. a copy of retro-4ls counts without bin", () => {
  const place = mkdtempSync(join(tmpdir(), "retro-4ls-alone-"));
  try {
    const copy = join(place, "retro-4ls");
    cpSync(SKILL(), copy, { recursive: true });
    assert.ok(
      !existsSync(join(place, "bin")),
      "the copy unexpectedly carries bin/",
    );
    assert.equal(
      count(runCounter("alpha", FIX("top-level"), copy), "alpha"),
      1,
    );
  } finally {
    rmSync(place, { recursive: true, force: true });
  }
});

test("2. the counter can be pointed at a root with no KAAL install", () => {
  const root = FIX("top-level");
  assert.ok(
    !existsSync(join(root, "bin")),
    "the fixture carries a KAAL engine",
  );
  assert.ok(
    !existsSync(join(root, "kaal.config.json")),
    "the fixture carries a KAAL configuration",
  );
  assert.equal(count(runCounter("alpha", root), "alpha"), 1);
});

test("3. a top-level Feeds line contributes one", () => {
  assert.equal(count(runCounter("alpha", FIX("top-level")), "alpha"), 1);
});

test("4. retros/archive does not contribute", () => {
  assert.equal(count(runCounter("alpha", FIX("archive")), "alpha"), 1);
});

test("5. a requirement naming the filename consumes the retro", () => {
  assert.equal(count(runCounter("alpha", FIX("consumed")), "alpha"), 1);
});

test("6. plain, backticked and optionally punctuated Feeds names count", () => {
  assert.equal(count(runCounter("alpha", FIX("grammar")), "alpha"), 4);
});

test("7. Read stays separate from Feeds", () => {
  const root = FIX("reads");
  assert.equal(count(runCounter("alpha", root), "alpha"), 0);
  assert.equal(count(runCounter("beta", root), "beta"), 1);
});

test("8. the standalone and end-to-end answers cannot differ", () => {
  const roots = readdirSync(join(HERE, "fixtures"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => FIX(entry.name));
  assert.ok(roots.length, "there are no fixture roots to compare");
  for (const root of roots) {
    const skills = readdirSync(join(root, "skills"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    assert.ok(skills.length, `${root} carries no named skills`);
    const endToEnd = kaal(root);
    assert.equal(endToEnd.status, 0, `kaal retros failed: ${said(endToEnd)}`);
    for (const skill of skills)
      assert.equal(
        count(runCounter(skill, root), skill),
        count(endToEnd, skill),
        `${skill} differs on ${root}`,
      );
  }
});

test("9. retro-4ls owns the executable and its passing cases", () => {
  const { skill, move } = declaredCounter();
  const r = spawnSync(process.execPath, ["--test", join(skill, move.test)], {
    encoding: "utf8",
    cwd: skill,
  });
  assert.equal(r.status, 0, `the skill-owned counter cases fail: ${said(r)}`);
});

test("10. the observed manage count is zero and absence stays red", () => {
  const root = FIX("zero");
  const endToEnd = kaal(root);
  assert.equal(endToEnd.status, 0, `kaal retros failed: ${said(endToEnd)}`);
  assert.equal(count(endToEnd, "manage"), 0, said(endToEnd));
  assert.equal(count(runCounter("manage", root), "manage"), 0);
});
