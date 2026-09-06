// Where a document may land. The caller names a path; this says whether it
// crosses a boundary, and the command asks before it reads anything, so a
// refusal never comes after a read. Two boundaries: the league's own tree,
// which must not become a store of other repositories' reviews, and the
// target, which did not ask to be written to.
import { sep } from "node:path";

const inside = (path, dir) => path === dir || path.startsWith(dir + sep);

/**
 * @param {string|null} out the resolved output path, or null for stdout
 * @param {{ league: string, target: string }} bounds resolved paths
 * @returns {string|null} the refusal, or null when the path is permitted
 */
export function refuseOutput(out, { league, target }) {
  if (!out) return null;
  if (inside(out, league))
    return `assess: refusing to write inside the league's own tree: ${out}`;
  if (inside(out, target))
    return `assess: refusing to write inside the target: ${out}`;
  return null;
}
