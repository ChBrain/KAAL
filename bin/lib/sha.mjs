// The SHA-256 of a file's bytes, as 64 hex characters. An eval record carries
// this for the SKILL.md it evaluated; when the file changes, the record is
// stale and counts for nothing.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/** @param {string} path */
export function fileSha(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}
