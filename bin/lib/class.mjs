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

const git = (root, ...args) =>
  spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });

/**
 * The base a diff is judged against, which is the target it is opening into
 * and never one fixed name. A lane opens into `release` and a promotion opens
 * `release` into `main`, so a wall that always read `origin/main` would show a
 * lane branch every other seat's merged work and call it many lanes. That is
 * what it did the day `release` appeared.
 *
 * `KAAL_BASE` is the answer where the caller knows it, which in a gate is the
 * pull request's own base. Where it does not, the targets are tried in the
 * order a branch is likely to have come from, and a tree holding neither is
 * answered by the caller: `class` says the question is not this tree's and
 * `seats` has nothing to place.
 * @param {string} root
 */
export function defaultBase(root) {
  const said = process.env.KAAL_BASE?.trim();
  if (said) return said;
  return TARGETS.find((r) => resolves(root, r)) ?? DEFAULT_BASE;
}

/** The targets a branch opens into, in the order one is likely to have. */
const TARGETS = ["origin/release", "origin/main"];

/**
 * The base where nothing narrows it at all: no caller said one and the tree
 * holds neither target, which is a clone that has fetched nothing. The name
 * is wider than what it now means and it stays until the unit that reads it
 * moves beside this module, which is the tester's diff and not this one.
 */
export const DEFAULT_BASE = "origin/main";

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
