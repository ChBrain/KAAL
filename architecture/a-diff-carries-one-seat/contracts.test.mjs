// Contract tests for drawing a-diff-carries-one-seat. One per seam, numbered
// to match. Every fixture is a scratch git repository built here, because a
// fixture that is a git repository cannot be committed inside one, and
// because four of the five seams are about what git says.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
// Imported inside each seam: a namespace import at the top saves a missing
// export, not a module that fails to load, and one absent file would share
// its red across all five.
const need = async (name) => {
  const mod = await import("../../bin/lib/seats.mjs");
  assert.ok(mod[name], `no ${name} export from seats.mjs`);
  return mod[name];
};
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout}${r.stderr}`;
const git = (cwd, ...args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${said(r)}`);
  return r;
};
const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};
/** A declaration of the shape seam 1 answers, for the seams that take one. */
const DECLARED = {
  seats: [
    { name: "analyst", owns: ["requirements/**"] },
    { name: "architect", owns: ["architecture/**"] },
    { name: "tester", owns: ["tests/**"] },
    { name: "developer", owns: ["bin/**", "SURFACE.md"] },
  ],
  lanes: [
    { pattern: "requirement/*", seat: "analyst", allows: [] },
    { pattern: "build/*", seat: "developer", allows: [] },
    { pattern: "governance/*", seat: null, allows: ["AGENTS.md"] },
  ],
  shared: ["retros/**"],
};

/**
 * A scratch repository: `base` committed on main, `branch` checked out, then
 * `change` written over it and left in the working tree. `-B` and not `-b`,
 * because one case stays on main to prove the clause criterion 4 has for it.
 */
function repo({ branch = "build/alpha", base = {}, change = {}, add = false }) {
  const root = mkdtempSync(join(tmpdir(), "kaal-seats-c-"));
  git(root, "init", "--quiet", "-b", "main");
  git(root, "config", "user.email", "fixture@example.invalid");
  git(root, "config", "user.name", "fixture");
  put(root, {
    "kaal.config.json": JSON.stringify(DECLARED, null, 2),
    ...base,
  });
  git(root, "add", "-A");
  git(root, "commit", "--quiet", "-m", "base");
  git(root, "checkout", "--quiet", "-B", branch);
  put(root, change);
  if (add) git(root, "add", "-A");
  return root;
}
const scratch = (opts, fn) => {
  const root = repo(opts);
  try {
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

test("1. the declaration: seats, lanes and shared out; one path for two seats and one lane for two seats are findings", async () => {
  const readSeats = await need("readSeats");
  scratch({ branch: "build/alpha" }, (root) => {
    const d = readSeats(root);
    assert.deepEqual(
      d.findings ?? [],
      [],
      `a sound declaration found something: ${JSON.stringify(d.findings)}`,
    );
    assert.equal(d.seats.length, 4, "the seats did not come back");
    assert.equal(d.lanes.length, 3, "the lanes did not come back");
    assert.deepEqual(d.shared, ["retros/**"], "the shared paths did not");
    // A lane carrying no seat is not a finding: four of this league's nine
    // carry none, and a declaration that refused them refuses governance.
    const none = d.lanes.find((l) => l.pattern === "governance/*");
    assert.ok(none, "the seatless lane was dropped rather than returned");
    assert.ok(!none.seat, `the seatless lane gained a seat: ${none.seat}`);
  });
  // Two seats, one path. The path is named, because a reader has to know
  // which line of the config to move.
  scratch({}, (root) => {
    writeFileSync(
      join(root, "kaal.config.json"),
      JSON.stringify(
        {
          ...DECLARED,
          seats: [
            { name: "analyst", owns: ["requirements/**"] },
            { name: "architect", owns: ["requirements/**"] },
          ],
        },
        null,
        2,
      ),
    );
    const f = readSeats(root).findings ?? [];
    assert.equal(f.length, 1, `expected one finding, got ${f.length}: ${f}`);
    assert.ok(f[0].includes("requirements/**"), `path not named: ${f[0]}`);
  });
  // One lane, two seats: the shape this whole task exists to make impossible.
  scratch({}, (root) => {
    writeFileSync(
      join(root, "kaal.config.json"),
      JSON.stringify(
        {
          ...DECLARED,
          lanes: [
            { pattern: "both/*", seat: ["analyst", "architect"], allows: [] },
          ],
        },
        null,
        2,
      ),
    );
    const f = readSeats(root).findings ?? [];
    assert.equal(f.length, 1, `expected one finding, got ${f.length}: ${f}`);
    assert.ok(f[0].includes("both/*"), `lane not named: ${f[0]}`);
  });
});

test("2. the lane: the branch and its lane, the environment where git names none, and nothing where neither does", async () => {
  const laneOf = await need("laneOf");
  scratch({ branch: "build/alpha" }, (root) => {
    const l = laneOf(root);
    assert.equal(l.branch, "build/alpha", `read the wrong branch: ${l.branch}`);
    assert.equal(l.lane?.pattern, "build/*", `matched: ${l.lane?.pattern}`);
  });
  // A detached HEAD, which is what every job in this league's CI runs on,
  // and the only thing that tells it a branch is the environment.
  scratch({ branch: "build/alpha" }, (root) => {
    git(root, "checkout", "--quiet", "--detach", "HEAD");
    const filled = laneOf(root, { KAAL_BRANCH: "build/alpha" });
    assert.equal(
      filled.lane?.pattern,
      "build/*",
      `a detached HEAD with the variable set read: ${JSON.stringify(filled)}`,
    );
    // And with neither, the question is not this tree's. Not a finding and
    // not a pass: a wall that answered clean here would be answering about
    // a lane nobody declared.
    const bare = laneOf(root, {});
    assert.ok(
      bare.notApplicable,
      `a detached HEAD with no variable did not refuse: ${JSON.stringify(bare)}`,
    );
    assert.ok(!bare.lane, "it matched a lane with no branch to match on");
  });
});

test("3. the diff: every path the change carries, a rename as the one path it landed at, and no answer for a ref that names nothing", async () => {
  const paths = await need("paths");
  scratch(
    {
      base: { "bin/kaal.mjs": "// base\n" },
      change: { "bin/kaal.mjs": "// changed\n", "bin/lib/new.mjs": "// new\n" },
    },
    (root) => {
      const p = paths(root, "main");
      assert.ok(p.paths, `no paths came back: ${JSON.stringify(p)}`);
      // The untracked one too: a file a person has written and not yet added
      // is still something they are about to land.
      assert.deepEqual(
        [...p.paths].sort(),
        ["bin/kaal.mjs", "bin/lib/new.mjs"],
        `read: ${JSON.stringify(p.paths)}`,
      );
    },
  );
  // A rename, staged, which is where git can see it as one. One path out and
  // not two, and it is the one it landed at.
  scratch(
    {
      base: { "tests/rules.test.mjs": "// a unit\n" },
      change: {},
      add: false,
    },
    (root) => {
      // git mv will not create the arrival directory, and an empty one is
      // invisible to git, so making it changes nothing the seam reads.
      mkdirSync(join(root, "bin", "lib"), { recursive: true });
      git(root, "mv", "tests/rules.test.mjs", "bin/lib/rules.test.mjs");
      const p = paths(root, "main");
      assert.deepEqual(
        [...p.paths].sort(),
        ["bin/lib/rules.test.mjs"],
        `a rename did not come back as one arrival: ${JSON.stringify(p.paths)}`,
      );
    },
  );
  // An empty answer and no answer are different answers.
  scratch({ base: { "bin/kaal.mjs": "// base\n" } }, (root) => {
    const clean = paths(root, "main");
    assert.ok(clean.paths, "a clean tree gave no answer at all");
    assert.equal(clean.paths.length, 0, `a clean tree read: ${clean.paths}`);
    const nowhere = paths(root, "no-such-ref");
    assert.ok(
      nowhere.notApplicable,
      `an unresolvable ref answered: ${JSON.stringify(nowhere)}`,
    );
    assert.ok(!nowhere.paths, "an unresolvable ref returned paths as well");
  });
});

test("4. the crossing: a seat line per seat touched, and a finding per path the lane does not allow", async () => {
  const crossings = await need("crossings");
  const lane = DECLARED.lanes.find((l) => l.pattern === "build/*");
  const governance = DECLARED.lanes.find((l) => l.pattern === "governance/*");
  // Everything allowed, by three different routes: the seat owns it, the
  // shared list carries it, and, on the seatless lane, the lane allows it.
  const clean = crossings(
    ["bin/kaal.mjs", "SURFACE.md", "retros/x.md"],
    lane,
    DECLARED,
  );
  assert.deepEqual(clean.findings ?? [], [], `found: ${clean.findings}`);
  assert.deepEqual(
    clean.lines ?? [],
    ["seat developer"],
    `expected one seat line: ${JSON.stringify(clean.lines)}`,
  );
  const allowed = crossings(["AGENTS.md"], governance, DECLARED);
  assert.deepEqual(
    allowed.findings ?? [],
    [],
    `a lane's own allowed path was refused: ${allowed.findings}`,
  );
  // Another seat's path, and a path no seat owns at all. Deny by default
  // means the second is a finding too, which is the half the first
  // specification of this task got wrong.
  const refused = crossings(
    ["bin/kaal.mjs", "architecture/alpha/drawing.md", "deploy/notes.md"],
    lane,
    DECLARED,
  );
  assert.equal(
    (refused.findings ?? []).length,
    2,
    `expected two findings: ${JSON.stringify(refused.findings)}`,
  );
  for (const p of ["architecture/alpha/drawing.md", "deploy/notes.md"])
    assert.ok(
      refused.findings.some((f) => f.includes(p)),
      `${p} is not named: ${JSON.stringify(refused.findings)}`,
    );
  assert.ok(
    refused.findings.every((f) => f.includes("build/*")),
    `the lane is not named on every finding: ${JSON.stringify(refused.findings)}`,
  );
  // The seat lines are about the diff and not about the lane: a diff that
  // touches two seats says so even while the findings say which is wrong.
  assert.deepEqual(
    (refused.lines ?? []).sort(),
    ["seat architect", "seat developer"],
    `expected a line per seat touched: ${JSON.stringify(refused.lines)}`,
  );
});

test("5. the proof: a changed proof is a finding naming the file, unless a requirement in the diff declares the supersede", async () => {
  const proofs = await need("proofs");
  const requirement = (name, supersedes = "nothing") =>
    `---\ntraces:\n  supersedes: ${supersedes}\n---\n\n# Requirement: ${name}\n\n` +
    `## Acceptance criteria\n\n1. It holds.\n\n## Handoff\n\n- Task: ${name}\n` +
    `- Supersedes: ${supersedes === "nothing" ? "nothing" : `\`${supersedes}\``}\n- People: none\n`;
  const base = {
    "requirements/alpha/requirement.md": requirement("alpha"),
    "requirements/alpha/acceptance.test.mjs": "// base\n",
    "requirements/alpha/fixtures/one/note.md": "base\n",
    "architecture/alpha/contracts.test.mjs": "// base\n",
  };
  for (const p of [
    "requirements/alpha/acceptance.test.mjs",
    "requirements/alpha/fixtures/one/note.md",
    "architecture/alpha/contracts.test.mjs",
  ])
    scratch({ base }, (root) => {
      const f = proofs(root, [p, "bin/kaal.mjs"]).findings ?? [];
      assert.equal(f.length, 1, `${p}: expected one finding: ${f}`);
      // The path, looked for literally: escaping one into a pattern is a
      // list of characters somebody has to keep complete.
      assert.ok(f[0].includes(p), `${p} is not named: ${f[0]}`);
    });
  // Each seat on its own kind of proof, on the branch that names that
  // proof's task, which is the job and not the harm. This is the case that
  // blocked every new requirement in this league: an analyst who may not
  // write an acceptance test has none left.
  scratch({ base }, (root) => {
    const own = [
      [
        { branch: "requirement/alpha", lane: { seat: "analyst" } },
        [
          "requirements/alpha/acceptance.test.mjs",
          "requirements/alpha/fixtures/one/note.md",
        ],
      ],
      [
        { branch: "architecture/alpha", lane: { seat: "architect" } },
        ["architecture/alpha/contracts.test.mjs"],
      ],
    ];
    for (const [where, files] of own)
      assert.deepEqual(
        proofs(root, files, where).findings ?? [],
        [],
        `${where.lane.seat} writing its own proof was refused: ${files}`,
      );
    // And every other reading of the same files is still a finding: another
    // seat on this kind, and the right seat on another task.
    for (const [where, file] of [
      [
        { branch: "build/alpha", lane: { seat: "developer" } },
        "requirements/alpha/acceptance.test.mjs",
      ],
      [
        { branch: "requirement/alpha", lane: { seat: "analyst" } },
        "architecture/alpha/contracts.test.mjs",
      ],
      [
        { branch: "requirement/beta", lane: { seat: "analyst" } },
        "requirements/alpha/acceptance.test.mjs",
      ],
    ]) {
      const f = proofs(root, [file], where).findings ?? [];
      assert.equal(
        f.length,
        1,
        `${where.branch} on ${file}: expected one finding, got ${JSON.stringify(f)}`,
      );
      assert.ok(f[0].includes(file), `the file is not named: ${f[0]}`);
    }
  });
  // The escape. It is a declaration, read from a requirement in the same
  // diff, and never a flag.
  scratch(
    {
      base,
      change: {
        "requirements/beta/requirement.md": requirement("beta", "alpha"),
      },
    },
    (root) => {
      const f =
        proofs(root, [
          "requirements/alpha/acceptance.test.mjs",
          "requirements/beta/requirement.md",
        ]).findings ?? [];
      assert.deepEqual(f, [], `a declared supersede was refused: ${f}`);
    },
  );
  // And it excuses only what it names: a supersede of one task does not
  // free another task's proof, which is how a declaration stays a promise.
  scratch(
    {
      base: {
        ...base,
        "requirements/gamma/acceptance.test.mjs": "// base\n",
      },
      change: {
        "requirements/beta/requirement.md": requirement("beta", "alpha"),
      },
    },
    (root) => {
      const f =
        proofs(root, [
          "requirements/gamma/acceptance.test.mjs",
          "requirements/beta/requirement.md",
        ]).findings ?? [];
      assert.equal(f.length, 1, `a supersede of alpha freed gamma: ${f}`);
      assert.ok(f[0].includes("gamma"), `the file is not named: ${f[0]}`);
    },
  );
});
