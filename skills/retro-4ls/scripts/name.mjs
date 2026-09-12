#!/usr/bin/env node
// What a retro is called, computed from what is already filed rather than
// counted by hand. Usage: node scripts/name.mjs <skill> [root]
//
// Writing the number by hand put two retros in this league claiming to be the
// fiftieth use of the code skill, and came within a filename of overwriting
// two more in one afternoon: the number lives in the filename and in the
// `Period:` line, nothing reads either, and the count a person carries in
// their head is the only thing keeping them apart. Derived is better than
// written, because it is deterministic.
//
// Prints the filename and the ordinal, one per line, so the page and its line
// come from one computation. Exits 0 with an answer, 1 on a bad argument.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ONES = [
  "",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
  "thirteenth",
  "fourteenth",
  "fifteenth",
  "sixteenth",
  "seventeenth",
  "eighteenth",
  "nineteenth",
];
// The tens as they are written alone, which is not the tens as they are
// written before a ones word: `twentieth` and `twenty-first`.
const TENS_ALONE = [
  "",
  "",
  "twentieth",
  "thirtieth",
  "fortieth",
  "fiftieth",
  "sixtieth",
  "seventieth",
  "eightieth",
  "ninetieth",
];
const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

/** The ordinal word for a whole number from 1 to 99. */
export const ordinal = (n) => {
  if (!Number.isInteger(n) || n < 1 || n > 99) return null;
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? TENS_ALONE[t] : `${TENS[t]}-${ONES[o]}`;
};

/** The number a filename claims, or null where it claims none. */
export const claimed = (file, skill) => {
  const m = file.match(
    new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${skill}-([a-z-]+)-use\\.md$`),
  );
  if (!m) return null;
  for (let n = 1; n <= 99; n += 1) if (ordinal(n) === m[1]) return n;
  return null;
};

/**
 * Every use of this skill already filed, read from both places. A consumed
 * retro moves to `retros/archive/` and it is still a use that happened: the
 * archive is about what a requirement has read, never about what was done.
 */
export const filed = (root, skill) =>
  ["retros", join("retros", "archive")]
    .filter((d) => existsSync(join(root, d)))
    .flatMap((d) => readdirSync(join(root, d)))
    .map((f) => claimed(f, skill))
    .filter((n) => n !== null);

// The command half runs only when this file is what was started. Its readers
// are exported so a case can drive them directly, and a module that ran its
// command on import would exit the runner that imported it.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();

function main() {
  const [skill, where] = process.argv.slice(2);
  if (!skill || !/^[a-z][a-z0-9-]*$/.test(skill)) {
    console.error("usage: name.mjs <skill> [root]");
    process.exit(1);
  }
  const root = where ?? process.cwd();
  const used = filed(root, skill);
  // The next one is past the highest and never the count. A gap in the numbers
  // is a retro that was archived out of a directory this script cannot see, or
  // one somebody deleted, and reusing the number would file the second page
  // that claims it, which is the thing this exists to stop.
  const next = used.length ? Math.max(...used) + 1 : 1;
  const word = ordinal(next);
  if (!word) {
    console.error(`${skill} is at ${next - 1} uses, past what this can name`);
    process.exit(1);
  }
  const date = new Date().toISOString().slice(0, 10);
  console.log(`retros/${date}-${skill}-${word}-use.md`);
  console.log(word);
}
