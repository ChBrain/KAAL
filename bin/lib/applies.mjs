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

/**
 * The four commands that judge a tree against a league artefact. `fixtures`
 * is not among them: it lists what is there, and a listing that finds nothing
 * has an answer, which code-v2 fixed as a refusal.
 */
export const GUARDED = ["ledger", "drawings", "check", "agents"];

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
    case "agents":
      return isDir(join(root, "agents")) &&
        readdirSync(join(root, "agents")).length
        ? null
        : `no agents/ directory under ${root}`;
    default:
      return null;
  }
}
