// The verdict: what moved between a manifest and a directory as it is now.
// One finding per path, in path order, with which of added, removed or
// changed it was. Empty means the tree is what the manifest said it was,
// which is the answer a guest harness is waiting for.
import { entries, parse } from "./manifest.mjs";

/**
 * @param {string} dir @param {string} text a manifest
 * @returns {{ path: string, verb: string }[]}
 * @throws when the manifest does not parse
 */
export function compare(dir, text) {
  const was = parse(text);
  const now = new Map(entries(dir).map((e) => [e.path, e.sha]));
  const findings = [];
  for (const [path, sha] of now)
    if (!was.has(path)) findings.push({ path, verb: "added" });
    else if (was.get(path) !== sha) findings.push({ path, verb: "changed" });
  for (const path of was.keys())
    if (!now.has(path)) findings.push({ path, verb: "removed" });
  return findings.sort((a, b) =>
    a.path < b.path ? -1 : a.path > b.path ? 1 : 0,
  );
}
