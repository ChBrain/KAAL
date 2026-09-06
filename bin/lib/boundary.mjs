// The boundary wall: nothing under bin/lib/assess may write, execute, or
// reach the network, except output.mjs, which may write and nothing else.
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
export const REACHES = "reaches the shell or the network";

/**
 * @param {string} root a directory that may hold bin/lib/assess/
 * @returns {{ file: string, verb: string }[]} one finding per breach
 */
export function checkBoundary(root) {
  const dir = join(root, "bin", "lib", "assess");
  if (!existsSync(dir)) return [];
  const findings = [];
  for (const file of readdirSync(dir)
    .filter((f) => f.endsWith(".mjs") && !f.endsWith(".test.mjs"))
    .sort()) {
    const text = readFileSync(join(dir, file), "utf8");
    if (REACH.test(text)) findings.push({ file, verb: REACHES });
    if (file !== SINK && WRITE.test(text))
      findings.push({ file, verb: "writes" });
  }
  return findings;
}
