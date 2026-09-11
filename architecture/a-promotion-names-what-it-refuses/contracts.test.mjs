// Contract tests for drawing a-promotion-names-what-it-refuses. One per seam,
// numbered to match. Each drives its seam's own function, because a promotion
// is a sort over answers this tree already gives and a test through the
// command would be judging the printing as well as the sort.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

// Imported inside each seam: a namespace import at the top saves a missing
// export, not a module that fails to load, and one absent file would share
// its red across all eight.
const need = async (file, name) => {
  const mod = await import(`../../bin/lib/${file}`);
  assert.ok(mod[name], `no ${name} export from ${file}`);
  return mod[name];
};

const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const PASSES =
  "import { test } from 'node:test';\ntest('1. it holds', () => {});\n";
const FAILS =
  "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\n" +
  "test('1. it does not hold', () => assert.equal(1, 2));\n";
const EMPTY = "// A suite with no case in it.\n";
const REQUIREMENT = (n) =>
  `---\ntraces:\n  supersedes: nothing\n---\n\n# Requirement: ${n}\n\n` +
  `## Acceptance criteria\n\n1. It holds.\n\n## Handoff\n\n- Task: ${n}\n- People: none\n`;
const CONFIG = (red) =>
  JSON.stringify({
    gates: [
      { name: "quiet", command: 'node -e "process.exit(0)"' },
      ...(red ? [{ name: "loud", command: 'node -e "process.exit(1)"' }] : []),
    ],
    seats: [{ name: "analyst", owns: ["requirements/**"] }],
    lanes: [
      { pattern: "requirement/*", seat: "analyst", allows: [] },
      { pattern: "build/*", seat: "developer", allows: [] },
    ],
    shared: [],
  });
/** A task: its requirement, its suite, and a record where one is wanted. */
const task = (name, body, record) => {
  const suite = `requirements/${name}/acceptance.test.mjs`;
  const files = {
    [`requirements/${name}/requirement.md`]: REQUIREMENT(name),
    [suite]: body,
  };
  if (record)
    files[`tests/runs/${name}.md`] =
      `# Run: ${name}\n\n- Task: ${name}\n- Suite: ${suite}\n- Ran: 2026-09-11\n` +
      `- Suite sha: ${sha(body)}\n- Passing: 1\n- Failing: 0\n`;
  return files;
};
const tree = (files, fn, { red = false } = {}) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-promote-c-"));
  try {
    put(root, {
      "kaal/league.md": "---\ntraces:\n  parent: none\n---\n\n# Scratch\n",
      "kaal.config.json": CONFIG(red),
      ...files,
    });
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

test("1. the two targets, in the order a promotion travels", async () => {
  const TARGETS = await need("targets.mjs", "TARGETS");
  const BASES = await need("targets.mjs", "BASES");
  const PROMOTION_FROM = await need("targets.mjs", "PROMOTION_FROM");
  // The order is the promotion's direction and the fallback order both, which
  // is why one list serves two readers.
  assert.deepEqual(TARGETS, ["release", "main"]);
  assert.deepEqual(BASES, ["origin/release", "origin/main"]);
  assert.equal(PROMOTION_FROM, "release");
});

test("2. what is being asked, from the arguments before the environment", async () => {
  const asked = await need("promote.mjs", "asked");
  const env = { KAAL_BASE: "origin/main", KAAL_BRANCH: "release" };
  // Arguments outrank the environment, both of them, and independently.
  assert.deepEqual(asked(["--into", "release", "--from", "build/x"], env), {
    into: "release",
    from: "build/x",
  });
  assert.deepEqual(asked(["--into", "release"], env), {
    into: "release",
    from: "release",
  });
  // The environment answers where the arguments do not, and it is read as a
  // ref rather than a branch, because that is the shape a gate keeps it in.
  assert.deepEqual(asked([], env), { into: "main", from: "release" });
  // No promotion to judge is its own answer and carries a reason.
  const none = asked([], {});
  assert.ok(
    none.why,
    `no reason given for nothing to judge: ${JSON.stringify(none)}`,
  );
  assert.equal(none.into, undefined);
  // A target that is not a target is usage, and it is not a refusal.
  const bad = asked(["--into", "production"], {});
  assert.ok(
    bad.usage,
    `an unknown target was not usage: ${JSON.stringify(bad)}`,
  );
  assert.equal(bad.into, undefined);
});

test("3. a verdict per task, from the suite now and the record as it stands", async () => {
  const verdicts = await need("promote.mjs", "verdicts");
  tree(
    {
      ...task("alpha", PASSES, true),
      ...task("beta", FAILS, false),
      ...task("gamma", FAILS, true),
      ...task("delta", EMPTY, true),
    },
    (root) => {
      const got = Object.fromEntries(
        verdicts(root).map((v) => [v.task, v.word]),
      );
      assert.deepEqual(got, {
        alpha: "delivered",
        beta: "not delivered",
        gamma: "regressed",
        delta: "nothing ran",
      });
    },
  );
});

test("4. the verdicts a target refuses, and the two targets differ by one word", async () => {
  const refusedVerdicts = await need("promote.mjs", "refusedVerdicts");
  const all = [
    { task: "alpha", word: "delivered" },
    { task: "beta", word: "not delivered" },
    { task: "gamma", word: "regressed" },
    { task: "delta", word: "nothing ran" },
  ];
  const names = (fs) => fs.map((f) => `${f.artefact}: ${f.kind}: ${f.message}`);
  assert.deepEqual(names(refusedVerdicts(all, "release")), [
    "gamma: verdict: regressed",
    "delta: verdict: nothing ran",
  ]);
  assert.deepEqual(names(refusedVerdicts(all, "main")), [
    "beta: verdict: not delivered",
    "gamma: verdict: regressed",
    "delta: verdict: nothing ran",
  ]);
  // And a tree with nothing to refuse refuses nothing, at either target.
  for (const into of ["release", "main"])
    assert.deepEqual(refusedVerdicts([all[0]], into), []);
});

test("5. a head each target will not take", async () => {
  const refusedHead = await need("promote.mjs", "refusedHead");
  const lanes = ["requirement/*", "build/*"];
  // Main takes release and nothing else.
  assert.equal(refusedHead("main", "release", lanes), null);
  const notRelease = refusedHead("main", "build/x", lanes);
  assert.equal(notRelease?.artefact, "build/x");
  assert.equal(notRelease?.kind, "head");
  // Release takes a lane the config holds and nothing else.
  assert.equal(refusedHead("release", "build/x", lanes), null);
  const noLane = refusedHead("release", "wip/x", lanes);
  assert.equal(noLane?.artefact, "wip/x");
  assert.equal(noLane?.kind, "head");
  // And release does not take main: a target is not a lane.
  assert.ok(refusedHead("release", "main", lanes));
});

test("6. the red walls, counted whatever the target", async () => {
  const redWalls = await need("promote.mjs", "redWalls");
  tree({ ...task("alpha", PASSES, true) }, (root) => {
    const none = redWalls(root);
    assert.equal(none.count, 0);
    assert.deepEqual(none.findings, []);
  });
  tree(
    { ...task("alpha", PASSES, true) },
    (root) => {
      const red = redWalls(root);
      assert.equal(red.count, 1);
      assert.equal(red.findings.length, 1);
      assert.equal(red.findings[0].artefact, "loud");
      assert.equal(red.findings[0].kind, "wall");
    },
    { red: true },
  );
});

test("7. every refusal, in one answer, and the count that follows them", async () => {
  const promote = await need("promote.mjs", "promote");
  tree(
    {
      ...task("alpha", PASSES, true),
      ...task("beta", FAILS, false),
      ...task("gamma", FAILS, true),
      ...task("delta", EMPTY, true),
    },
    (root) => {
      // Four reasons at once: three verdicts and a head main will not take.
      const r = promote(root, { into: "main", from: "build/x" });
      assert.equal(r.into, "main");
      assert.ok(r.findings.length >= 4, JSON.stringify(r.findings));
      assert.equal(r.count, r.findings.length);
      const kinds = new Set(r.findings.map((f) => f.kind));
      assert.ok(kinds.has("verdict"), JSON.stringify(r.findings));
      assert.ok(kinds.has("head"), JSON.stringify(r.findings));
      assert.ok(kinds.has("wall"), JSON.stringify(r.findings));
      // Nothing stops at the first: the same tree at release refuses two and
      // names both, and its red walls are counted rather than refused.
      const rel = promote(root, { into: "release", from: "build/x" });
      assert.equal(
        rel.findings.filter((f) => f.kind === "verdict").length,
        2,
        JSON.stringify(rel.findings),
      );
      assert.deepEqual(
        rel.findings.filter((f) => f.kind === "wall"),
        [],
      );
      assert.equal(typeof rel.red, "number");
      assert.ok(rel.red >= 1, `the red wall was not counted: ${rel.red}`);
    },
    { red: true },
  );
});

test("8. a lane, a promotion, or neither", async () => {
  const laneOf = await need("seats.mjs", "laneOf");
  tree({ ...task("alpha", PASSES, true) }, (root) => {
    // A lane is answered as it always was.
    assert.equal(
      laneOf(root, { KAAL_BRANCH: "build/x" }).lane?.pattern,
      "build/*",
    );
    // A branch no lane holds is still nothing, which is what makes it a
    // finding: the promotion's answer must not swallow this one.
    const stray = laneOf(root, { KAAL_BRANCH: "wip/x" });
    assert.equal(stray.lane, null);
    assert.ok(!stray.promotion, JSON.stringify(stray));
    // And the promotion says what it is and whose.
    const promo = laneOf(root, { KAAL_BRANCH: "release" });
    assert.ok(promo.promotion, JSON.stringify(promo));
    assert.equal(promo.lane, null);
    assert.match(String(promo.promotion), /\boperator\b/);
  });
});
