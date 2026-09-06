// The manifest format: a line per file, the sha256 of its bytes, two spaces,
// and the file's path relative to the directory with "/" as the separator,
// sorted ascending by path. This is the shape `sha256sum` prints, so a person
// can verify a manifest with a tool that is not ours and diff it like text.
// One module owns both directions: a manifest this repository writes is one
// it can read. It reads and hashes, and it never writes; the boundary wall
// holds it to that.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const LINE = /^([0-9a-f]{64}) {2}(\S.*)$/;
const byPath = (a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);

/**
 * Every file under a directory, hashed, in path order. Symbolic links and
 * empty directories are not files and are not here.
 * @param {string} dir @returns {{ sha: string, path: string }[]}
 */
export function entries(dir, prefix = "") {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const at = `${prefix}${e.name}`;
    if (e.isDirectory()) out.push(...entries(join(dir, e.name), `${at}/`));
    else if (e.isFile())
      out.push({
        sha: createHash("sha256")
          .update(readFileSync(join(dir, e.name)))
          .digest("hex"),
        path: at,
      });
  }
  return out.sort(byPath);
}

/** @param {string} dir @returns {string} the manifest; "" for a tree with no files */
export function render(dir) {
  return entries(dir)
    .map((e) => `${e.sha}  ${e.path}`)
    .join("\n");
}

/**
 * @param {string} text a manifest @returns {Map<string, string>} path to sha
 * @throws on any line that is not a manifest line, naming the line's number:
 * a manifest that half parses is a fault, never a verdict on the half.
 */
export function parse(text) {
  const seen = new Map();
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const m = LINE.exec(lines[i]);
    if (!m) throw new Error(`line ${i + 1} is not a manifest line`);
    seen.set(m[2], m[1]);
  }
  return seen;
}
