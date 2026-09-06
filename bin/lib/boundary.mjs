// The boundary wall: nothing under a guarded place may write, execute, or
// reach the network, except that place's sink, which may write and nothing
// else. bin/lib/assess has a sink, output.mjs; bin/lib/witness has none,
// because a witness that could write is not a witness.
// It lives outside the tree it guards, because a guard that must exempt
// itself is one edit away from exempting its neighbour. Read from text; a
// module is never executed to find out what it does, which is the same rule
// the skill rules already follow, and REACH is their word for reaching.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { REACH } from "./rules.mjs";

export const WRITE =
  /\b(writeFileSync|appendFileSync|mkdirSync|mkdtempSync|rmSync|rmdirSync|unlinkSync|renameSync|copyFileSync|cpSync|createWriteStream|writeFile|appendFile)\b/;
export const SINK = "output.mjs";
// The guarded places, each with its sink or none. A place is what a wall
// guards well; the wall itself lives outside all of them.
export const PLACES = [
  { where: "bin/lib/assess", sink: SINK },
  { where: "bin/lib/witness", sink: null },
];
export const REACHES = "reaches the shell or the network";

/**
 * @param {string} root a directory that may hold a guarded place
 * @returns {{ where: string, file: string, verb: string }[]} one per breach.
 * `file` stays the bare name: assess-boundary is closed and its tests read it.
 */
export function checkBoundary(root) {
  const findings = [];
  for (const { where, sink } of PLACES) {
    const dir = join(root, ...where.split("/"));
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)
      .filter((f) => f.endsWith(".mjs") && !f.endsWith(".test.mjs"))
      .sort()) {
      const text = readFileSync(join(dir, file), "utf8");
      if (REACH.test(text)) findings.push({ where, file, verb: REACHES });
      if (file !== sink && WRITE.test(text))
        findings.push({ where, file, verb: "writes" });
    }
  }
  return findings;
}
