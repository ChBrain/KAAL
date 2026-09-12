// The bugs, the fifth kind the test strategy names. A run record is the
// evidence a suite passed and goes stale when the suite moves; a bug is the
// inverse, the evidence a case failed, and it clears when the case goes
// green. It names the lane that owns the earliest place the work can happen
// and never the fix: proposing one would be the seat that found the symptom
// designing for the seat that owns it.
//
// A bug is written by the tester and read by walls. No wall writes one, for
// the same reason no wall writes a run: recording is the act of the seat that
// proves, and a wall that wrote a bug would be recording its own excuse.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { caseEnv } from "./gates.mjs";
import { suitePages } from "./plans.mjs";

/** The place the bugs live in, beside the runs. */
export const BUGS = join("tests", "bugs");
/** What a bug carries. All four, or the page is a finding naming the one it lacks. */
const FIELDS = ["Case", "Wall", "Seen", "Lane"];

/**
 * Every bug page, named by its file and read for its four fields. A field
 * that is not there reads as absent and never as empty, because the caller
 * tells them apart to say which one is missing.
 *
 * A tree with no such place answers nothing rather than throwing: the fifth
 * kind is a place a tree may not have yet, and a reader that crashed on an
 * absent directory would make it mandatory the day it was built.
 * @param {string} root
 */
export function bugPages(root) {
  const d = join(root, BUGS);
  if (!existsSync(d)) return [];
  return readdirSync(d)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => {
      const text = readFileSync(join(d, f), "utf8");
      const of = (k) =>
        text.match(new RegExp(`^- ${k}:[ \\t]*(.+)$`, "m"))?.[1]?.trim();
      return {
        name: f.slice(0, -3),
        text,
        fields: Object.fromEntries(FIELDS.map((k) => [k, of(k)])),
      };
    });
}

/** The lanes the config declares, which is where a bug's owner comes from. */
const lanesOf = (root) => {
  const p = join(root, "kaal.config.json");
  if (!existsSync(p)) return [];
  try {
    return (JSON.parse(readFileSync(p, "utf8")).lanes ?? []).map(
      (l) => l.pattern,
    );
  } catch {
    // A config that does not parse is the rules wall's finding and not this
    // one's. Answering no lanes here would make every bug page red for a
    // reason that is written down somewhere else.
    return [];
  }
};

/** Every case path the suite layer names, which is what the tree knows. */
const namedCases = (root) => {
  const out = new Set();
  for (const s of suitePages(root)) for (const c of s.cases) out.add(c);
  return out;
};

/**
 * Whether the case a bug is about passes now. This starts a process, which no
 * other reader on the trace wall does, and it is what criterion 3 costs: a
 * bug is cleared by the case going green and never by a person deciding it
 * has, and nothing but a run can tell the tree which.
 *
 * `caseEnv` because the case builds a tree of its own: a run that inherited
 * this one's target would answer about the wrong tree, and one that inherited
 * the runner's marker would report green whatever happened.
 */
const passes = (root, path) =>
  existsSync(join(root, path)) &&
  spawnSync(process.execPath, ["--test", "--test-reporter=tap", path], {
    cwd: root,
    encoding: "utf8",
    env: caseEnv(),
  }).status === 0;

/**
 * What is wrong with each bug page, by its name. Each finding stops its page,
 * as the plans wall's do: a page with no `- Lane:` line has nothing for an
 * unknown lane to be wrong about, and running the case a page does not name
 * is not a question.
 *
 * Read once and shared, because both what is wrong and what is held back are
 * asked of the same pages and the last check here starts a process.
 */
const faults = (root) => {
  const out = new Map();
  const lanes = lanesOf(root);
  const named = namedCases(root);
  for (const b of bugPages(root)) {
    const missing = FIELDS.find((k) => !b.fields[k]);
    if (missing) {
      out.set(b.name, `carries no \`- ${missing}:\` line`);
      continue;
    }
    if (!lanes.includes(b.fields.Lane)) {
      out.set(
        b.name,
        `names the lane ${b.fields.Lane}, which no lane in kaal.config.json holds`,
      );
      continue;
    }
    // The suite layer is what says which cases exist, so a path with no file
    // behind it and a file no suite names are the same finding: a bug points
    // at a case the tree already knows, the way a suite does.
    if (!named.has(b.fields.Case)) {
      out.set(b.name, `is about ${b.fields.Case}, which no suite names`);
      continue;
    }
    if (passes(root, b.fields.Case))
      out.set(
        b.name,
        `is about ${b.fields.Case}, which passes: a bug is cleared by the case going green`,
      );
  }
  return out;
};

/** Seam 2: what is wrong with the pages, as findings. @param {string} root */
export function checkBugs(root) {
  return [...faults(root)].map(([name, message]) => ({
    artefact: `bugs/${name}`,
    kind: "bug",
    message,
  }));
}

/**
 * Seam 3: the cases a standing bug holds back. A page with a finding against
 * it holds nothing back, because a bug that is not well formed is not yet a
 * bug: a page naming a lane nobody has would otherwise stop a wall running a
 * case while saying nothing anyone can act on.
 *
 * Paths and not pairs. One case file has one answer, and two walls run the
 * same acceptance paths, so a bug that held a case back on one and let the
 * other run it would have the tree asserting two things about one run. What
 * the `Wall` field records is where the failure showed, and it scopes nothing.
 * @param {string} root
 */
export function blocked(root) {
  const bad = faults(root);
  return new Set(
    bugPages(root)
      .filter((b) => !bad.has(b.name))
      .map((b) => b.fields.Case),
  );
}

/**
 * Seam 5: the line the board prints about each standing bug, naming its case
 * and the lane that owns it, so a reader sees what is broken and whose it is
 * without opening a page or a test file.
 * @param {string} root
 */
export function standing(root) {
  const bad = faults(root);
  return bugPages(root)
    .filter((b) => !bad.has(b.name))
    .map(
      (b) => `bugs: ${b.fields.Case} is blocked, and ${b.fields.Lane} owns it`,
    );
}
