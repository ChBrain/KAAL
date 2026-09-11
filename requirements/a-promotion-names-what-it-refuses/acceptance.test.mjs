// Acceptance tests for requirement a-promotion-names-what-it-refuses. One per
// criterion. Surface only: `kaal promote` on scratch trees, because a
// promotion is asked about a tree and this tree is the one that would answer
// about itself.
//
// Every case builds its own tree. A verdict is computed from a suite that is
// run and a record that is read, so a fixture carries both: a tiny acceptance
// suite under `requirements/<task>/` and, where the case needs one, a record
// under `tests/runs/` pinned to that suite's sha.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kaal = (root, ...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
    cwd: root,
    // A promotion reads the pull request from the environment where it is not
    // told one, and a test that inherited this runner's would be asking about
    // whatever opened it. Every case says what it wants and nothing else.
    env: { ...process.env, GITHUB_BASE_REF: "", GITHUB_HEAD_REF: "" },
  });
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;
const notUsage = (out) =>
  assert.doesNotMatch(out, /^usage: kaal/m, `no such command: ${out}`);
/** A finding is `<artefact>: <kind>: <message>`; read the first two. */
const finding = (out, artefact, kind) =>
  out
    .split("\n")
    .filter((l) => new RegExp(`^${artefact}: ${kind}: `).test(l.trim()));

const PASSES =
  "import { test } from 'node:test';\ntest('1. it holds', () => {});\n";
const FAILS =
  "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\n" +
  "test('1. it does not hold', () => assert.equal(1, 2));\n";
const EMPTY = "// A suite with no case in it.\n";
const REQUIREMENT = (name) =>
  `---\ntraces:\n  supersedes: nothing\n---\n\n# Requirement: ${name}\n\n` +
  `## Acceptance criteria\n\n1. It holds.\n\n## Handoff\n\n- Task: ${name}\n- People: none\n`;
const TRUNK = "---\ntraces:\n  parent: none\n---\n\n# Scratch\n\nA tree.\n";
/**
 * Two gates and neither runs a test, so no plan is owed and the board's own
 * colour is the fixture's to choose. `red` is asked for by name.
 */
const CONFIG = (red) =>
  JSON.stringify(
    {
      gates: [
        { name: "quiet", command: 'node -e "process.exit(0)"' },
        ...(red
          ? [{ name: "loud", command: 'node -e "process.exit(1)"' }]
          : []),
      ],
      seats: [{ name: "analyst", owns: ["requirements/**"] }],
      lanes: [
        { pattern: "requirement/*", seat: "analyst", allows: [] },
        { pattern: "build/*", seat: "developer", allows: [] },
      ],
      shared: [],
    },
    null,
    2,
  );

const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
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
      `- Suite sha: ${sha(body)}\n- Passing: ${record.passing}\n- Failing: ${record.failing}\n`;
  return files;
};

const scratch = (files, fn, { red = false } = {}) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-promote-"));
  try {
    put(root, {
      "kaal/league.md": TRUNK,
      "kaal.config.json": CONFIG(red),
      ...files,
    });
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

/** The four verdicts, each as the smallest tree that produces it. */
const DELIVERED = task("alpha", PASSES, { passing: 1, failing: 0 });
const NOT_DELIVERED = task("beta", FAILS, null);
const REGRESSED = task("gamma", FAILS, { passing: 1, failing: 0 });
const NOTHING_RAN = task("delta", EMPTY, { passing: 1, failing: 0 });

test("1. the target is named back, and a target it does not know is usage", () => {
  scratch({ ...DELIVERED }, (root) => {
    const r = kaal(root, "promote", "--into", "release", "--from", "build/x");
    const out = said(r);
    notUsage(out);
    assert.match(
      out,
      /^promote: into release$/m,
      `the answer never says which target it judged: ${out}`,
    );
    // And the other one, so the line is read from the flag rather than fixed.
    const m = kaal(root, "promote", "--into", "main", "--from", "release");
    assert.match(said(m), /^promote: into main$/m, said(m));
    // A third target is usage, and usage judges nothing: the tree here is
    // clean, so an exit of 1 that came from a verdict would look the same.
    const bad = kaal(root, "promote", "--into", "production", "--from", "x");
    const badOut = said(bad);
    assert.equal(bad.status, 1, `an unknown target was judged: ${badOut}`);
    assert.match(
      badOut,
      /\brelease\b/,
      `the targets it knows are not said: ${badOut}`,
    );
    assert.match(
      badOut,
      /\bmain\b/,
      `the targets it knows are not said: ${badOut}`,
    );
    assert.doesNotMatch(
      badOut,
      /^promote: into production$/m,
      `an unknown target was judged anyway: ${badOut}`,
    );
  });
});

test("2. reaching release refuses a claim that was true and is not, and nothing else", () => {
  scratch(
    { ...DELIVERED, ...NOT_DELIVERED, ...REGRESSED, ...NOTHING_RAN },
    (root) => {
      const r = kaal(root, "promote", "--into", "release", "--from", "build/x");
      const out = said(r);
      notUsage(out);
      assert.equal(r.status, 1, `a regressed task reached release: ${out}`);
      assert.deepEqual(finding(out, "gamma", "verdict"), [
        "gamma: verdict: regressed",
      ]);
      assert.deepEqual(finding(out, "delta", "verdict"), [
        "delta: verdict: nothing ran",
      ]);
      // The tester's licence, and a task that is done, are not findings here.
      assert.deepEqual(finding(out, "beta", "verdict"), []);
      assert.deepEqual(finding(out, "alpha", "verdict"), []);
    },
  );
});

test("3. reaching main refuses those two and the tester's licence as well", () => {
  scratch({ ...DELIVERED, ...NOT_DELIVERED }, (root) => {
    // The same tree twice, which is the whole of the difference between the
    // two gates: nothing about it changes, only what it is asked.
    const toRelease = kaal(
      root,
      "promote",
      "--into",
      "release",
      "--from",
      "build/x",
    );
    assert.deepEqual(finding(said(toRelease), "beta", "verdict"), []);
    const r = kaal(root, "promote", "--into", "main", "--from", "release");
    const out = said(r);
    notUsage(out);
    assert.equal(r.status, 1, `a not delivered task reached main: ${out}`);
    assert.deepEqual(finding(out, "beta", "verdict"), [
      "beta: verdict: not delivered",
    ]);
    assert.deepEqual(finding(out, "alpha", "verdict"), []);
  });
});

test("4. main takes only release, and release takes only a lane", () => {
  scratch({ ...DELIVERED }, (root) => {
    // Every verdict here is clean, so a refusal can only be about the head.
    const clean = kaal(root, "promote", "--into", "main", "--from", "release");
    assert.deepEqual(finding(said(clean), "release", "head"), []);
    const r = kaal(root, "promote", "--into", "main", "--from", "build/x");
    const out = said(r);
    notUsage(out);
    assert.equal(r.status, 1, `main took a head that is not release: ${out}`);
    assert.equal(
      finding(out, "build/x", "head").length,
      1,
      `no head finding names build/x: ${out}`,
    );
    // Release takes a lane the config holds, and nothing else.
    const lane = kaal(
      root,
      "promote",
      "--into",
      "release",
      "--from",
      "build/x",
    );
    assert.deepEqual(finding(said(lane), "build/x", "head"), []);
    const stray = kaal(root, "promote", "--into", "release", "--from", "wip/x");
    const strayOut = said(stray);
    assert.equal(
      stray.status,
      1,
      `release took a head no lane holds: ${strayOut}`,
    );
    assert.equal(
      finding(strayOut, "wip/x", "head").length,
      1,
      `no head finding names wip/x: ${strayOut}`,
    );
  });
});

test("5. a red wall stands below release and never above it", () => {
  scratch(
    { ...DELIVERED },
    (root) => {
      const r = kaal(root, "promote", "--into", "main", "--from", "release");
      const out = said(r);
      notUsage(out);
      assert.equal(r.status, 1, `main took a red board: ${out}`);
      assert.equal(
        finding(out, "loud", "wall").length,
        1,
        `no wall finding names the red wall: ${out}`,
      );
      assert.deepEqual(finding(out, "quiet", "wall"), []);
      // The same tree reaches release, and is not silent about the wall.
      const rel = kaal(
        root,
        "promote",
        "--into",
        "release",
        "--from",
        "build/x",
      );
      const relOut = said(rel);
      assert.equal(
        rel.status,
        0,
        `a red wall stopped a branch reaching release: ${relOut}`,
      );
      assert.match(
        relOut,
        /\b1\b[^\n]*\bwall/,
        `release is silent about the red wall: ${relOut}`,
      );
    },
    { red: true },
  );
});

test("6. every refusal is said, and the last line counts them", () => {
  scratch(
    { ...DELIVERED, ...NOT_DELIVERED, ...REGRESSED, ...NOTHING_RAN },
    (root) => {
      // Four reasons at once: three verdicts and a head that is not release.
      const r = kaal(root, "promote", "--into", "main", "--from", "build/x");
      const out = said(r);
      notUsage(out);
      assert.equal(r.status, 1, `four refusals passed: ${out}`);
      for (const [name, word] of [
        ["beta", "not delivered"],
        ["gamma", "regressed"],
        ["delta", "nothing ran"],
      ])
        assert.deepEqual(finding(out, name, "verdict"), [
          `${name}: verdict: ${word}`,
        ]);
      assert.equal(finding(out, "build/x", "head").length, 1, out);
      const last = out.trim().split("\n").at(-1).trim();
      const n = Number(
        last.match(/^promote: into main: (\d+) finding\(s\)$/)?.[1],
      );
      assert.equal(
        n,
        out.split("\n").filter((l) => /^\S+: \S+: /.test(l.trim())).length,
        `the last line does not count what was said: ${out}`,
      );
      assert.ok(n >= 4, `fewer than four refusals were named: ${out}`);
    },
  );
});

test("7. no promotion to judge is not this tree's question", () => {
  scratch({ ...DELIVERED }, (root) => {
    const r = kaal(root, "promote");
    const out = said(r);
    notUsage(out);
    assert.equal(
      r.status,
      2,
      `a desk with no pull request was judged anyway: ${out}`,
    );
    // And it says so rather than answering nothing, because a board carrying
    // this wall prints what every other wall prints.
    assert.match(out, /\bnot\b/i, `nothing says why it did not judge: ${out}`);
    assert.doesNotMatch(
      out,
      /^promote: into /m,
      `it named a target it was never given: ${out}`,
    );
  });
});

test("8. a promotion is not a lane's diff, and the seat rule says so", () => {
  // The seat rule reads a lane off the branch the tree is on and refuses one
  // it does not hold. A promotion's branch is `release`, which is no lane and
  // never will be: it carries every seat's work, which is what a promotion
  // is. So the fixture is a tree with history, and the branch is real.
  scratch({ ...DELIVERED }, (root) => {
    const git = (...a) => spawnSync("git", a, { cwd: root, encoding: "utf8" });
    git("init", "-q", "-b", "main");
    git("config", "user.email", "scratch@example.invalid");
    git("config", "user.name", "Scratch");
    git("add", "-A");
    git("commit", "-qm", "a tree");
    // The base it reads by default is the remote's, which a scratch tree is
    // given rather than fetched: offline is a constraint here too.
    git("update-ref", "refs/remotes/origin/main", "HEAD");
    // And something to place. A branch carrying no change is placed by
    // neither rule, so it would pass both ways for no reason of its own.
    const on = (branch) => {
      git("checkout", "-q", "-B", branch);
      put(root, { "requirements/alpha/note.md": `# ${branch}\n` });
      return kaal(root, "seats");
    };
    const stray = on("wip/x");
    const strayOut = said(stray);
    assert.equal(stray.status, 1, `a branch no lane holds passed: ${strayOut}`);
    assert.match(
      strayOut,
      /wip\/x/,
      `the finding names another branch: ${strayOut}`,
    );

    const r = on("release");
    const out = said(r);
    notUsage(out);
    assert.equal(r.status, 2, `a promotion was judged as a lane: ${out}`);
    assert.doesNotMatch(
      out,
      /matches no lane/,
      `the promotion was reported as a branch that missed: ${out}`,
    );
    assert.match(
      out,
      /\boperator\b/,
      `nothing says whose the promotion is: ${out}`,
    );
  });
});
