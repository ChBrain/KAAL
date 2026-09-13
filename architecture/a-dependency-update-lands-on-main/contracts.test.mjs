// Contract tests for drawing a-dependency-update-lands-on-main. One per seam,
// numbered to match. Each drives its seam's own side, on scratch trees where
// a branch and a diff have to be real.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Imported inside each seam: a namespace import at the top saves a missing
// export, not a module that fails to load, and one absent file would share
// its red across all four.
const need = async (file, name) => {
  const mod = await import(`../../bin/lib/${file}`);
  assert.ok(mod[name], `no ${name} export from ${file}`);
  return mod[name];
};

const BUMP = "dependabot/github_actions/actions/setup-python-7";
const LANES = [
  { pattern: "build/*", seat: "developer", allows: [] },
  { pattern: "test/*", seat: "tester", allows: [] },
  {
    pattern: "dependabot/**",
    seat: null,
    allows: [".github/**", "package.json", "package-lock.json"],
  },
];

const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};
const git = (cwd, ...args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stdout}${r.stderr}`);
};
/** A scratch repository on `branch`, with a `release` to compare against. */
const repo = (branch, change, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-bump-c-"));
  try {
    git(root, "init", "--quiet", "-b", "main");
    git(root, "config", "user.email", "fixture@example.invalid");
    git(root, "config", "user.name", "fixture");
    put(root, {
      "kaal.config.json": JSON.stringify(
        {
          gates: [],
          seats: [{ name: "developer", owns: ["bin/**"] }],
          lanes: LANES,
          shared: [],
        },
        null,
        2,
      ),
      ".github/workflows/ci.yml": "name: ci\n",
      "bin/kaal.mjs": "//\n",
    });
    git(root, "add", "-A");
    git(root, "commit", "--quiet", "-m", "base");
    git(root, "branch", "--quiet", "release");
    git(root, "checkout", "--quiet", "-B", branch);
    put(root, change);
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

test("1. what main takes beside release", async () => {
  const refusedHead = await need("promote.mjs", "refusedHead");
  const lanes = LANES.map((l) => l.pattern);
  // The promotion, unchanged.
  assert.equal(refusedHead("main", "release", lanes), null);
  // And the one named kind beside it. Four segments deep, so a matcher that
  // stops at a slash cannot admit it: this is where reading the seat rule's
  // rather than a copy of it is proven, and it has no other surface.
  assert.equal(BUMP.split("/").length, 4);
  assert.equal(refusedHead("main", BUMP, lanes), null);
  // Every other head refused, in the words the closed task fixed.
  for (const head of ["build/x", "test/y", "main", "something"]) {
    const said = refusedHead("main", head, lanes);
    assert.ok(said, `${head} was admitted into main`);
    assert.match(said.message, /main takes only release/, said.message);
  }
});

test("2. a target opening into a target is the sync", async () => {
  const laneOf = await need("seats.mjs", "laneOf");
  repo("main", {}, (root) => {
    const where = laneOf(root, { KAAL_BRANCH: "main" });
    assert.equal(where.lane, null, JSON.stringify(where));
    assert.ok(
      where.sync,
      `nothing says this is the sync: ${JSON.stringify(where)}`,
    );
    assert.ok(!where.promotion, "the sync reads as the promotion");
  });
  // The other direction still answers the promotion, which is the premise
  // this seam rests on and must not have moved.
  repo("release", {}, (root) => {
    const where = laneOf(root, { KAAL_BRANCH: "release" });
    assert.ok(where.promotion, JSON.stringify(where));
    assert.ok(!where.sync, "the promotion reads as the sync");
  });
  // And a lane's own branch is still a lane's diff, or the two answers above
  // would be a function that says the same thing to everything.
  repo("build/x", {}, (root) => {
    const where = laneOf(root, { KAAL_BRANCH: "build/x" });
    assert.equal(where.lane?.pattern, "build/*", JSON.stringify(where));
    assert.ok(!where.sync && !where.promotion, JSON.stringify(where));
  });
});

test("3. the sync says so and declines to judge", async () => {
  const kaal = (root, ...args) =>
    spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
      encoding: "utf8",
      cwd: root,
      env: { ...process.env, KAAL_BRANCH: "", KAAL_BASE: "" },
    });
  repo(
    "main",
    { ".github/workflows/ci.yml": "name: ci\n# bumped\n" },
    (root) => {
      const r = kaal(root, "seats", root, "--against", "release");
      const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
      assert.doesNotMatch(out, /^usage: kaal/m, `no such command: ${out}`);
      assert.match(
        out,
        /sync/i,
        `the answer does not say it is the sync: ${out}`,
      );
      assert.doesNotMatch(out, /no lane holds it/, out);
      // Two, which the board reads as a wall that declined rather than one that
      // failed. Zero would make the sync read as a diff that is one lane's.
      assert.equal(r.status, 2, `the sync exited ${r.status}: ${out}`);
    },
  );
});
