// Applicability: whether the question a command asks is this tree's question
// at all. A command that reads a league artefact from a path answers "not
// applicable here" when the tree holds none of it, rather than inventing a
// finding against a stranger's directory or passing on nothing. The rule
// lives once, as a table, so it cannot drift between five branches, and the
// list is countable: a sixth command added without an entry is red in the
// unit test rather than quietly unguarded.
//
// Applicability is per command, never per tree. A repository that adopted the
// ledger and nothing else answers `ledger` and refuses `drawings`, which no
// marker at the root could express.
import { readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { PLACES } from "./boundary.mjs";

/**
 * The commands that judge a tree against a league artefact. `fixtures` is not
 * among them: it lists what is there, and a listing that finds nothing has an
 * answer, which code-v2 fixed as a refusal. Neither is `assess`, whose target
 * is any directory at all. The last four joined in nothing-passes-vacuously,
 * which supersedes that part of applies-here: on a tree holding none of what
 * they read, two of them passed in silence and two exited on an unhandled
 * error, and a crash is no more an answer than silence is.
 */
export const GUARDED = [
  "ledger",
  "drawings",
  "check",
  "agents",
  "retros",
  "boundary",
  "runner",
  "gates",
  "class",
];

const isDir = (p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};
/** Does any child of `dir` carry a file of this name? */
const childHas = (dir, name) =>
  isDir(dir) &&
  readdirSync(dir).some(
    (n) => isDir(join(dir, n)) && existsSync(join(dir, n, name)),
  );

/**
 * Each entry answers about the path its own command is given: `check` takes a
 * skills directory, the other four take a root. That asymmetry is the
 * command's, not this table's, and the closed requirements that point `check`
 * at a skills directory keep their paths.
 * @param {string} cmd @param {string|null} arg @param {string} cwd
 * @returns {string|null} the reason it does not apply, or null when it does
 */
export function appliesHere(cmd, arg, cwd) {
  const root = arg ?? cwd;
  const dir = arg ?? join(cwd, "skills");
  switch (cmd) {
    case "ledger":
      return childHas(join(root, "skills"), "moves.json")
        ? null
        : `no skills/<name>/moves.json under ${root}`;
    case "drawings":
      return childHas(join(root, "architecture"), "drawing.md")
        ? null
        : `no architecture/<task>/drawing.md under ${root}`;
    case "check":
      return childHas(dir, "SKILL.md")
        ? null
        : `no <name>/SKILL.md under ${dir}`;
    case "retros": {
      // A root and a flag, the same pair `class` carries below and for the
      // same reason: `kaal retros --check` asks about the working directory,
      // and a reason naming a directory called "--check" would be a lie.
      const tree = arg && !arg.startsWith("-") ? arg : cwd;
      const skills = join(tree, "skills");
      return isDir(skills) &&
        readdirSync(skills).some((n) => isDir(join(skills, n)))
        ? null
        : `no skills/<name>/ under ${tree}`;
    }
    case "runner":
      // Asked about the working directory whatever it was handed: the first
      // argument is a skill name, never a path, and a reason naming a
      // directory called "analyse" would be a plausible lie. What it reads is
      // a fixture, so a tree with skills and no fixture has nothing for it,
      // and its reason differs from the one above, which applies-here fixed.
      return childHas(join(cwd, "skills"), "fixtures")
        ? null
        : `no skills/<name>/fixtures/ under ${cwd}`;
    case "boundary":
      // The wall's own list, never a copy of it: it grew from one place to
      // two, and a copy would have been wrong in silence.
      return PLACES.some((pl) => isDir(join(root, ...pl.where.split("/"))))
        ? null
        : `no ${PLACES.map((pl) => pl.where).join(" or ")} under ${root}`;
    case "gates":
      return existsSync(join(root, "kaal.config.json"))
        ? null
        : `no kaal.config.json under ${root}`;
    case "class": {
      // Its argument is a root, but it also takes a flag, and a flag is not a
      // directory: `kaal class --against main` asks about the working
      // directory, the way `runner` does for a different reason.
      const tree = arg && !arg.startsWith("-") ? arg : cwd;
      if (!existsSync(join(tree, "package.json")))
        return `no package.json under ${tree}`;
      // A worktree carries a .git file rather than a directory, and both are
      // history, so this asks whether the name is there at all.
      return existsSync(join(tree, ".git"))
        ? null
        : `no git history under ${tree}`;
    }
    case "agents":
      return isDir(join(root, "agents")) &&
        readdirSync(join(root, "agents")).length
        ? null
        : `no agents/ directory under ${root}`;
    default:
      return null;
  }
}
