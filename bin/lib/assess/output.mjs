// The one module under this tree that may write, and the only reason the
// boundary wall allows a writer here at all: a document the caller asked
// for, at a path the caller named and paths.mjs permitted. It decides
// nothing; it writes what it is handed where it is told.
import { writeFileSync } from "node:fs";

/** @param {string} path a permitted absolute path @param {string} text */
export function writeDocument(path, text) {
  writeFileSync(path, text);
}
