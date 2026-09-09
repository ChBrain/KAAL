// What each seat has answered of what was asked. Nobody declares any of
// these numbers: the analyst's is what the tree states, the architect's is
// what a drawing declares it answers, the tester's is what a run on record
// still proves. Reading them is the whole module.
//
// It cannot fail. A coverage number is a fact about how far the work has
// got, not a promise anybody made, so there is no threshold here and no way
// to refuse. What could fail is a claim about the number, and no claim
// exists yet.
import { readFileSync, globSync } from "node:fs";
import { join } from "node:path";
import { readTrace, tracedNames } from "./traces.mjs";
import { readRun, isFresh } from "./runs.mjs";

/** How many misses a row will name before it says how many more. */
const NAMES = 6;
const flat = (p) => String(p).replaceAll("\\", "/");
const tasks = (root) =>
  globSync("requirements/*/requirement.md", { cwd: root })
    .map((p) => flat(p).split("/")[1])
    .sort();

/**
 * The tasks some drawing in this tree declares it answers. Read from the
 * edge and never from the directory listing: a drawing that exists and
 * answers another task covers nothing, and a directory count cannot see
 * that.
 */
const answered = (root) => {
  const out = new Set();
  for (const p of globSync("architecture/*/drawing.md", { cwd: root }))
    for (const n of tracedNames(
      readTrace(readFileSync(join(root, p), "utf8"))?.requirement,
    ))
      out.add(n);
  return out;
};

/**
 * One entry per seat: its name, the word for what it counts, and what counts
 * it. Adding a seat is adding a row and nothing else, which is what makes
 * the operator's row a later line rather than a later design.
 */
export const SEATS = [
  {
    name: "analyst",
    counts: "stated as a requirement",
    covered: (root, all) => all,
  },
  {
    name: "architect",
    counts: "answered by a drawing",
    covered: (root, all) => {
      const a = answered(root);
      return all.filter((t) => a.has(t));
    },
  },
  {
    name: "tester",
    counts: "proved by a run on record",
    covered: (root, all) => all.filter((t) => isFresh(root, readRun(root, t))),
  },
];

/**
 * Each row's covered and missing, which together are always every task: a
 * row that loses one is a row whose share is of nothing.
 * @param {string} root
 */
export function subjects(root) {
  const all = tasks(root);
  return SEATS.map((s) => {
    const covered = s.covered(root, all);
    return {
      name: s.name,
      counts: s.counts,
      covered,
      missing: all.filter((t) => !covered.includes(t)),
      of: all,
    };
  });
}

/**
 * One line: the seat, the word, how many of how many, the share, and what it
 * does not cover. A percentage tells a reader they have a problem and not
 * where it is, so the names are the report and the number is the headline.
 */
export function row({ name, counts, covered, missing, of }) {
  // Truncated and never rounded. Rounding prints 100 per cent while
  // something is missing: 199 of 200 reads as done, which is the one number
  // this report must never be able to say.
  const share = of.length ? Math.floor((covered.length / of.length) * 100) : 0;
  const head = `${name.padEnd(10)} ${counts.padEnd(26)} ${covered.length} of ${of.length}  ${share}%`;
  if (!missing.length) return `${head}  all`;
  const shown = missing.slice(0, NAMES);
  const more = missing.length - shown.length;
  return `${head}  missing: ${shown.join(", ")}${more ? `, and ${more} more` : ""}`;
}

export const rows = (root) => subjects(root).map(row);
/** Whether this tree states anything to count. */
export const states = (root) => tasks(root).length > 0;
