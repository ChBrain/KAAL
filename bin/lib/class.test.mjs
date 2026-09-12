// Units of this module. The base a diff is judged against, which the wall
// that reads it turns into a lane, so reading the wrong one shows a branch
// every other seat's merged work and calls it many lanes. And the module's
// own reading of a tree: which of the three artefacts a path belongs to, and
// whether two versions differ in a place only a human may move. The second
// set lived in the tester's tree over this code until item 2 of
// `plan/0.0.2.md` brought it here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import {
  ARTEFACTS,
  DEFAULT_BASE,
  defaultBase,
  moved,
  raised,
  resolves,
  changed,
  versions,
} from "./class.mjs";

const git = (root, ...a) =>
  spawnSync(
    "git",
    [
      "-C",
      root,
      "-c",
      "user.email=t@t",
      "-c",
      "user.name=t",
      "-c",
      "commit.gpgsign=false",
      ...a,
    ],
    { encoding: "utf8" },
  );
/** A tree with one commit and whichever remote targets are asked for. */
const tree = (targets, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-base-"));
  try {
    git(root, "init", "-q", "-b", "main");
    git(root, "config", "user.email", "scratch@example.invalid");
    git(root, "config", "user.name", "Scratch");
    git(root, "commit", "-q", "--allow-empty", "-m", "a tree");
    for (const t of targets)
      git(root, "update-ref", `refs/remotes/origin/${t}`, "HEAD");
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
/** KAAL_BASE is read from the environment, so every case says what it is. */
const withBase = (value, fn) => {
  const had = process.env.KAAL_BASE;
  if (value === null) delete process.env.KAAL_BASE;
  else process.env.KAAL_BASE = value;
  try {
    return fn();
  } finally {
    if (had === undefined) delete process.env.KAAL_BASE;
    else process.env.KAAL_BASE = had;
  }
};

test("defaultBase takes what the caller says, whatever the tree holds", () => {
  // A gate knows the pull request's own base and nothing should outrank it.
  tree(["release", "main"], (root) =>
    withBase("origin/main", () =>
      assert.equal(defaultBase(root), "origin/main"),
    ),
  );
  tree([], (root) =>
    withBase("whatever", () => assert.equal(defaultBase(root), "whatever")),
  );
  // Said and empty is not said: a variable set to nothing is a caller that
  // did not answer, which is the shape an unset one has in a shell.
  tree(["release", "main"], (root) =>
    withBase("  ", () => assert.equal(defaultBase(root), "origin/release")),
  );
});

test("defaultBase prefers release, because that is where a lane opens", () => {
  tree(["release", "main"], (root) =>
    withBase(null, () => assert.equal(defaultBase(root), "origin/release")),
  );
});

test("defaultBase falls back to main where there is no release yet", () => {
  // A clone from before the branch existed, and a fork that never fetched it.
  tree(["main"], (root) =>
    withBase(null, () => assert.equal(defaultBase(root), "origin/main")),
  );
});

test("defaultBase answers a name even where neither target is there", () => {
  // Answering nothing would make the caller ask git for `undefined`; the
  // callers are the ones that say a base they cannot resolve is exit 2.
  tree([], (root) =>
    withBase(null, () => assert.equal(defaultBase(root), "origin/main")),
  );
});

/** A repository on main with one commit, so a base ref exists to read. */
const repo = (version = "0.0.1") => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-class-u-"));
  git(dir, "init", "-b", "main");
  mkdirSync(join(dir, "bin"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    `{ "name": "x", "version": "${version}" }\n`,
  );
  writeFileSync(join(dir, "bin", "x.mjs"), "// a tool\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-m", "base");
  return dir;
};

test("the three artefacts are named, in the order the report prints them", () => {
  assert.deepEqual(
    ARTEFACTS.map((a) => a.name),
    ["surface", "tool", "skills"],
  );
  assert.equal(DEFAULT_BASE, "origin/main");
});

test("a path belongs to the artefact whose shape it has, and to no other", () => {
  assert.deepEqual(moved(["SURFACE.md"]), ["surface"]);
  assert.deepEqual(moved(["bin/kaal.mjs"]), ["tool"]);
  assert.deepEqual(moved(["bin/lib/deep/thing.mjs"]), ["tool"]);
  assert.deepEqual(moved(["skills/analyse/SKILL.md"]), ["skills"]);
  // A skill's other files are the league's working: only the SKILL.md is the
  // promise, which is what a consumer of a skill actually reads.
  assert.deepEqual(moved(["skills/analyse/references/requirement.md"]), []);
  // The common case, and the easy one to get wrong.
  assert.deepEqual(
    moved(["requirements/t/requirement.md", "retros/a.md", "README.md"]),
    [],
  );
  assert.deepEqual(moved(["SURFACE.md", "bin/kaal.mjs"]), ["surface", "tool"]);
});

test("equal and a patch move pass; the minor and the major places are a human's", () => {
  assert.equal(raised("0.0.1", "0.0.1"), false);
  assert.equal(raised("0.0.1", "0.0.9"), false);
  assert.equal(raised("0.0.1", "0.1.0"), true);
  assert.equal(raised("0.0.1", "1.0.0"), true);
  assert.equal(raised("0.1.0", "0.0.1"), true, "a fall is a move too");
  // A version that cannot be read on either side is nothing to compare, and
  // a refusal invented out of an absence is a finding against nobody.
  assert.equal(raised(null, "0.1.0"), false);
  assert.equal(raised("0.0.1", null), false);
});

test("a ref resolves or it does not, and a diff reads what moved between two states", () => {
  const dir = repo();
  try {
    assert.equal(resolves(dir, "main"), true);
    assert.equal(resolves(dir, "origin/main"), false);
    assert.equal(resolves(dir, "no-such-ref"), false);
    git(dir, "checkout", "-q", "-b", "work");
    writeFileSync(join(dir, "bin", "x.mjs"), "// changed\n");
    git(dir, "add", "-A");
    git(dir, "commit", "-m", "work");
    assert.deepEqual(changed(dir, "main"), ["bin/x.mjs"]);
    assert.deepEqual(changed(dir, "work"), []);
    // What is not committed yet is still part of the change, the way the
    // version is: a wall that only reads HEAD tells a developer nothing
    // about what they are holding.
    writeFileSync(join(dir, "SURFACE.md"), "# The surface\n");
    git(dir, "add", "-A");
    assert.deepEqual(changed(dir, "main"), ["SURFACE.md", "bin/x.mjs"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the base's version comes out of git and the tree's out of the working copy", () => {
  const dir = repo("0.0.1");
  try {
    git(dir, "checkout", "-q", "-b", "work");
    // Uncommitted on purpose: a raise is refused before it is committed as
    // well as after, so the working copy is what the tree's version is.
    writeFileSync(
      join(dir, "package.json"),
      '{ "name": "x", "version": "0.1.0" }\n',
    );
    assert.deepEqual(versions(dir, "main"), { from: "0.0.1", to: "0.1.0" });
    // A base that holds no manifest has no version, and that is not a raise.
    const bare = mkdtempSync(join(tmpdir(), "kaal-class-u-bare-"));
    git(bare, "init", "-b", "main");
    writeFileSync(join(bare, "a.txt"), "a\n");
    git(bare, "add", "-A");
    git(bare, "commit", "-m", "base");
    assert.equal(versions(bare, "main").from, null);
    rmSync(bare, { recursive: true, force: true });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
