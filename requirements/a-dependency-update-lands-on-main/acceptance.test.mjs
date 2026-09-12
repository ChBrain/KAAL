// Acceptance tests for requirement a-dependency-update-lands-on-main.
// One per criterion. Surface only: `kaal seats`, `kaal promote` and the two
// configuration files, on scratch repositories, because the seat rule reads a
// branch and a diff and both have to be real.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const config = () =>
  JSON.parse(readFileSync(join(ROOT, "kaal.config.json"), "utf8"));
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
    env: { ...process.env, KAAL_BRANCH: "", KAAL_BASE: "" },
  });
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;
const notUsage = (out) =>
  assert.doesNotMatch(out, /^usage: kaal/m, `no such command: ${out}`);
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

/** A scratch repository on `branch`, with `change` left in the working tree. */
const scratch = (branch, change, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-bump-"));
  try {
    git(root, "init", "--quiet", "-b", "main");
    git(root, "config", "user.email", "fixture@example.invalid");
    git(root, "config", "user.name", "fixture");
    put(root, {
      "kaal.config.json": JSON.stringify(config(), null, 2),
      ".github/workflows/ci.yml": "name: ci\n",
      "package.json": '{ "name": "x" }\n',
      "bin/kaal.mjs": "//\n",
      "requirements/alpha/requirement.md": "#\n",
    });
    git(root, "add", "-A");
    git(root, "commit", "--quiet", "-m", "base");
    // A `release` to compare against, because the sync is read as a diff
    // between two targets and a ref that is not there is a different answer.
    git(root, "branch", "--quiet", "release");
    git(root, "checkout", "--quiet", "-B", branch);
    put(root, change);
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

/** The branch names Dependabot actually opens, one per declared ecosystem. */
const BRANCHES = [
  "dependabot/github_actions/actions/setup-python-7",
  "dependabot/npm_and_yarn/dev-tooling-3f2a1b4c5d",
];

test("1. a branch Dependabot opens is held by a lane, and that lane carries no seat", () => {
  for (const branch of BRANCHES) {
    scratch(
      branch,
      { ".github/workflows/ci.yml": "name: ci\n# bumped\n" },
      (root) => {
        const r = kaal("seats", root, "--against", "main");
        const out = said(r);
        notUsage(out);
        assert.doesNotMatch(
          out,
          /no lane holds it/,
          `${branch} is held by no lane: ${out}`,
        );
        assert.match(out, /^lane \S+ \(no seat\)/m, `${branch}: ${out}`);
        assert.equal(r.status, 0, `${branch} was refused: ${out}`);
      },
    );
  }
});

test("2. the lane allows what a bump touches and nothing else", () => {
  // A path no dependency update writes, in the lane a dependency update uses.
  // Each on its own, because a diff carrying both would go red on the first
  // and say nothing about the second.
  // Each path here is owned by a seat. The shared paths are not among them:
  // `retros/**` and the plan and suite pages are open to every lane by the
  // seat rule itself, so a bump reaching one of those is a question about
  // what shared means and not about what this lane allows.
  for (const stray of ["bin/kaal.mjs", "requirements/alpha/requirement.md"]) {
    scratch(BRANCHES[0], { [stray]: "changed\n" }, (root) => {
      const r = kaal("seats", root, "--against", "main");
      const out = said(r);
      notUsage(out);
      assert.equal(r.status, 1, `${stray} was let through: ${out}`);
      assert.ok(out.includes(stray), `the path is not named: ${out}`);
    });
  }
});

test("3. a whole dependency update passes in that lane", () => {
  // Absence needs a witness: the three files a bump touches, changed
  // together, so a lane that allowed nothing at all could not pass this.
  scratch(
    BRANCHES[1],
    {
      ".github/workflows/ci.yml": "name: ci\n# bumped\n",
      "package.json": '{ "name": "x", "devDependencies": {} }\n',
      "package-lock.json": '{ "lockfileVersion": 3 }\n',
    },
    (root) => {
      const r = kaal("seats", root, "--against", "main");
      const out = said(r);
      notUsage(out);
      assert.equal(r.status, 0, `a whole bump was refused: ${out}`);
      assert.match(out, /this diff is one lane's/, out);
    },
  );
});

test("4. the promotion admits a dependency update into main and nothing else new", () => {
  // The one kind that may reach main beside release.
  scratch(
    BRANCHES[0],
    { ".github/workflows/ci.yml": "name: ci\n# bumped\n" },
    (root) => {
      const out = said(
        kaal("promote", root, "--into", "main", "--from", BRANCHES[0]),
      );
      notUsage(out);
      assert.doesNotMatch(
        out,
        /main takes only release/,
        `a dependency update was refused as a stranger: ${out}`,
      );
    },
  );
  // A head that is neither release nor Dependabot's, which must read exactly
  // as it did before this task.
  scratch("build/x", { "bin/kaal.mjs": "//\n// changed\n" }, (root) => {
    const out = said(
      kaal("promote", root, "--into", "main", "--from", "build/x"),
    );
    notUsage(out);
    assert.match(out, /main takes only release/, out);
  });
});

test("5. a pull request from main into release is the sync", () => {
  // The second leg. The promotion never runs on a pull request into release,
  // so what has to answer is the seat rule, and today it says no lane holds a
  // branch called main.
  scratch(
    "main",
    { ".github/workflows/ci.yml": "name: ci\n# bumped\n" },
    (root) => {
      const r = kaal("seats", root, "--against", "release");
      const out = said(r);
      notUsage(out);
      assert.doesNotMatch(
        out,
        /no lane holds it/,
        `the sync has no lane: ${out}`,
      );
      assert.match(
        out,
        /sync/i,
        `the answer does not say it is the sync: ${out}`,
      );
      assert.doesNotMatch(
        out,
        /^seat \w+$/m,
        `the sync was given a seat: ${out}`,
      );
    },
  );
});

test("6. Dependabot opens against main, and says so rather than defaulting", () => {
  const text = readFileSync(join(ROOT, ".github", "dependabot.yml"), "utf8");
  const updates = text.split(/^  - package-ecosystem:/m).slice(1);
  assert.ok(updates.length >= 2, `fewer than two ecosystems: ${text}`);
  // Every one of them, counted from the file rather than assumed, because an
  // ecosystem added later with no target follows a default that may move.
  for (const u of updates)
    assert.match(
      u,
      /^\s+target-branch:\s*["']?main["']?\s*$/m,
      `an ecosystem does not name main as its target: ${u}`,
    );
});
