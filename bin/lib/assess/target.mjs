// The target descriptor: what a read of a directory can honestly say about
// the tree it found there, and nothing more. It reads the directory and the
// refs git keeps in it as files; it never runs git, because the assessor's
// claim is that it executes nothing belonging to a tree it does not govern,
// and a spawn would also inherit that tree's git configuration. A revision
// that cannot be read is not a finding about the repository: the descriptor
// says so and says why. Nothing here comes from a clock, so two reads of one
// tree are the same bytes.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/** The sha a `.git` directory points at, or the reason it could not be read. */
function resolveHead(target) {
  const git = join(target, ".git");
  const head = join(git, "HEAD");
  if (!existsSync(head))
    return { sha: null, why: "no git repository at the target" };
  const text = readFileSync(head, "utf8").trim();
  if (!text.startsWith("ref: ")) return { sha: text, why: null };
  const ref = text.slice(5).trim();
  const file = join(git, ...ref.split("/"));
  if (!existsSync(file))
    return { sha: null, why: `the ref ${ref} has no file under .git` };
  return { sha: readFileSync(file, "utf8").trim(), why: null };
}

/** @param {string} target an absolute path @returns {object} the descriptor */
export function describeTarget(target) {
  const { sha, why } = resolveHead(target);
  return {
    schema: "kaal.target/v1",
    mode: "external",
    target: sha
      ? { kind: "local", path: target, resolved_sha: sha }
      : { kind: "local", path: target, resolved_sha: null, unresolved: why },
    access: {
      repository_content: "read",
      target_execution: "none",
      target_write: "forbidden",
      provider_write: "forbidden",
    },
  };
}

/** The descriptor as the document a caller reads or a file carries. */
export function renderTarget(target) {
  return JSON.stringify(describeTarget(target), null, 2) + "\n";
}
