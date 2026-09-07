// The class of a change: which of the three artefacts a consumer can notice
// moved, and whether the version's minor or major place rose. It reads two
// states of a tree through git and writes nothing anywhere.
//
// The three artefacts are named by path here and not configured, because
// three paths in one module is one place to keep true and a configured list
// is a second place that drifts from the first. Everything else in the tree
// is the league's own working and moves without meaning for a consumer.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

/** The order is the order the report prints, so a reader sees one list twice. */
export const ARTEFACTS = [
  { name: "surface", is: (p) => p === "SURFACE.md" },
  { name: "tool", is: (p) => p.startsWith("bin/") },
  { name: "skills", is: (p) => /^skills\/[^/]+\/SKILL\.md$/.test(p) },
];

export const DEFAULT_BASE = "origin/main";

const git = (root, ...args) =>
  spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });

/** Does this ref name a commit in this tree? */
export function resolves(root, ref) {
  const r = git(root, "rev-parse", "--verify", "--quiet", `${ref}^{commit}`);
  return r.status === 0;
}

/**
 * The paths that differ between the base and the tree as it stands now, so
 * the answer covers what is committed and what is not, the way the version
 * does. Against the ref it was told to read and no merge base: a change's
 * class is its class against what it will merge into, which is what
 * `--against` is for. Tracked files only; a file git has never seen is not
 * yet part of the change, and it is at the push that it becomes one.
 */
export function changed(root, base) {
  // No guard on git's own status: a diff that could not run writes nothing,
  // and an empty answer is what a guard would have returned anyway. A line
  // no test can hold is a branch nobody can see.
  const r = git(root, "diff", "--name-only", base);
  return r.stdout.split("\n").filter((l) => l.trim());
}

/** Which of the three moved, in the order they are declared. */
export function moved(paths) {
  return ARTEFACTS.filter((a) => paths.some((p) => a.is(p))).map((a) => a.name);
}

const version = (text) => {
  try {
    return JSON.parse(text).version ?? null;
  } catch {
    return null;
  }
};

/**
 * The version at the base and the version in the tree. The tree's is read
 * from the working copy, so a raise is refused before it is committed as well
 * as after; the base's comes out of git, because that is the only place it is.
 */
export function versions(root, base) {
  // A base holding no manifest, and a manifest that will not parse, are the
  // same answer: there is no version there. `version` gives null for both,
  // so git's status is not asked a second time.
  const shown = git(root, "show", `${base}:package.json`);
  const here = join(root, "package.json");
  return {
    from: version(shown.stdout),
    to: existsSync(here) ? version(readFileSync(here, "utf8")) : null,
  };
}

/**
 * Whether the move is one only a human may make. Equal versions, and a move
 * in the patch place alone, are this repository's own to do; anything in the
 * minor or the major place is not. A version that cannot be read on either
 * side is not a raise: there is nothing to compare, and a refusal invented
 * out of an absence is a finding against nobody.
 */
export function raised(from, to) {
  if (!from || !to || from === to) return false;
  const [fromMajor, fromMinor] = String(from).split(".");
  const [toMajor, toMinor] = String(to).split(".");
  return fromMajor !== toMajor || fromMinor !== toMinor;
}
