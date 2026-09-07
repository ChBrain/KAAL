// Units of bin/lib/class.mjs. The module's own reading of a tree: which of
// the three artefacts a path belongs to, and whether two versions differ in
// a place only a human may move. The command that uses them is proven above.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import {
  ARTEFACTS,
  DEFAULT_BASE,
  moved,
  raised,
  resolves,
  changed,
  versions,
} from "../bin/lib/class.mjs";

const git = (dir, ...args) =>
  spawnSync(
    "git",
    [
      "-c",
      "user.email=t@t",
      "-c",
      "user.name=t",
      "-c",
      "commit.gpgsign=false",
      ...args,
    ],
    { cwd: dir, encoding: "utf8" },
  );

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
