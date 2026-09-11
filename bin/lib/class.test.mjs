// Units for the base a diff is judged against. The wall that reads it says
// which lane a diff is, so reading the wrong one shows a branch every other
// seat's merged work and calls it many lanes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { defaultBase } from "./class.mjs";

const git = (root, ...a) =>
  spawnSync("git", ["-C", root, ...a], { encoding: "utf8" });
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
