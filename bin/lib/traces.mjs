// The trace wall: every requirement and every drawing declares in its
// frontmatter what it was made from, and every name resolves. One table says
// where each kind of thing lives, so adding a link kind is adding a row. It
// reads files and never runs anything, and it resolves a name without ever
// reading what it finds: whether the trace was justified is meaning, and
// meaning is not a wall.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter.mjs";

/**
 * A kind, and where things of that kind live, relative to a root. A row per
 * kind is what makes the concept general; a rule per kind is what it refuses.
 * Tests and code are not here because neither has a name a trace could point
 * at, and a row that never resolves is a finding nobody can fix.
 */
export const KINDS = {
  requirement: (name) => join("requirements", name, "requirement.md"),
  supersedes: (name) => join("requirements", name, "requirement.md"),
  principles: (name) =>
    join("skills", "architect", "references", "principles", `${name}.md`),
};

/** The two artefacts that carry a trace, and the file each keeps it in. */
const PLACES = [
  { dir: "requirements", file: "requirement.md" },
  { dir: "architecture", file: "drawing.md" },
];

/**
 * An artefact's trace map. Three answers, kept apart on purpose: the map,
 * an empty map when the block carries no `traces` key, and null when there
 * is no block at all. A reader that collapses the last two cannot report
 * them differently, and they are different mistakes.
 * @param {string} text
 * @returns {Record<string, string> | null}
 */
export function readTrace(text) {
  let data;
  try {
    data = parseFrontmatter(text).data;
  } catch {
    return null;
  }
  const t = data.traces;
  return t && typeof t === "object" ? t : {};
}

/**
 * The names a kind's value carries, with the two liberties `Feeds:` and
 * `Read:` already accept. `nothing` names nothing whatever its case, and so
 * do an empty value and an absent key.
 * @param {string | undefined} value
 */
export function tracedNames(value) {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim().replace(/^[`'"]+|[`'".]+$/g, ""))
    .filter((s) => s && !/^nothing$/i.test(s));
}

const dirs = (d) =>
  existsSync(d)
    ? readdirSync(d)
        .filter((n) => statSync(join(d, n)).isDirectory())
        .sort()
    : [];

/**
 * @param {string} root
 * @returns {{ artefact: string, kind: string, message: string }[]}
 */
export function checkTraces(root) {
  const out = [];
  const find = (artefact, kind, message) =>
    out.push({ artefact, kind, message });
  for (const { dir, file } of PLACES)
    for (const artefact of dirs(join(root, dir))) {
      const path = join(root, dir, artefact, file);
      if (!existsSync(path)) continue;
      const text = readFileSync(path, "utf8");
      const trace = readTrace(text);
      if (trace === null) {
        find(artefact, "traces", `no frontmatter block in ${dir}/${artefact}`);
        continue;
      }
      if (!Object.keys(trace).length) {
        find(artefact, "traces", `no traces map in ${dir}/${artefact}`);
        continue;
      }
      for (const [kind, value] of Object.entries(trace)) {
        // Never a silence. A trace ignored for being unrecognised is a
        // mistyped key that passes, which is the vacuous pass in a wall.
        if (!KINDS[kind]) {
          find(
            artefact,
            kind,
            `no such kind; the table holds ${Object.keys(KINDS).join(", ")}`,
          );
          continue;
        }
        for (const name of tracedNames(value)) {
          const where = KINDS[kind](name);
          if (!existsSync(join(root, where)))
            find(artefact, kind, `${name} is not at ${where}`);
        }
      }
      // The prose must carry what the trace declares, read one direction
      // only. The other way is finding a task name inside a sentence, which
      // is the reason the block exists.
      if (dir === "requirements") {
        const line = text.match(/^- Supersedes: (.+)$/m)?.[1] ?? "";
        for (const name of tracedNames(trace.supersedes))
          if (!line.includes(name))
            find(
              artefact,
              "supersedes",
              `the Supersedes line does not mention ${name}`,
            );
      }
    }
  return out;
}
