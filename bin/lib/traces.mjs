// The trace wall: every requirement and every drawing declares in its
// frontmatter what it was made from, and every name resolves. One table says
// where each kind of thing lives, so adding a link kind is adding a row. It
// reads files and never runs anything, and it resolves a name without ever
// reading what it finds: whether the trace was justified is meaning, and
// meaning is not a wall.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { parseFrontmatter } from "./frontmatter.mjs";

/**
 * A kind, and where things of that kind live, relative to a root. A row per
 * kind is what makes the concept general; a rule per kind is what it refuses.
 * Tests and code are not here because neither has a name a trace could point
 * at, and a row that never resolves is a finding nobody can fix.
 */
export const KINDS = {
  requirement: {
    where: (name) => join("requirements", name, "requirement.md"),
    region: "Acceptance criteria",
  },
  supersedes: {
    where: (name) => join("requirements", name, "requirement.md"),
    region: "Acceptance criteria",
  },
  // No region: a principle is its claim and has no part that is not.
  principles: {
    where: (name) =>
      join("skills", "architect", "references", "principles", `${name}.md`),
    region: null,
  },
};

/** The text under `## <title>`, or the whole text when a row names none. */
const region = (text, title) =>
  title === null
    ? text
    : (text.match(
        new RegExp(`^## ${title}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"),
      )?.[1] ?? "");

/**
 * One entry per name: its name, and its pin or null. `<name>` and
 * `<name>@<sha>` both parse; `nothing` yields no entries at all.
 * @param {string | undefined} value
 */
export function splitTrace(value) {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim().replace(/^[`\'"]+|[`\'".]+$/g, ""))
    .filter((s) => s && !/^nothing$/i.test(s))
    .map((s) => {
      const at = s.indexOf("@");
      return at === -1
        ? { name: s, pin: null }
        : { name: s.slice(0, at), pin: s.slice(at + 1) };
    });
}

/**
 * The sha of the region a kind's row names, or null when the file is gone.
 * @param {string} root @param {string} kind @param {string} name
 */
export function regionSha(root, kind, name) {
  const row = KINDS[kind];
  if (!row) return null;
  const path = join(root, row.where(name));
  if (!existsSync(path)) return null;
  return createHash("sha256")
    .update(region(readFileSync(path, "utf8"), row.region))
    .digest("hex");
}

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
  return splitTrace(value).map((e) => e.name);
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
        for (const { name, pin } of splitTrace(value)) {
          const where = KINDS[kind].where(name);
          if (!existsSync(join(root, where))) {
            find(artefact, kind, `${name} is not at ${where}`);
            continue;
          }
          // The name is there and what it says may not be. A different
          // finding in different words: one wants a rename, this a reread.
          if (pin && pin !== regionSha(root, kind, name))
            find(
              artefact,
              kind,
              `${name} moved: its ${KINDS[kind].region ?? "whole file"} no longer matches the pin`,
            );
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

/**
 * Write the pin of every trace that resolves, in place, changing nothing
 * else on the page. Nobody types a sha.
 * @param {string} root
 */
export function writePins(root) {
  for (const { dir, file } of PLACES)
    for (const artefact of dirs(join(root, dir))) {
      const path = join(root, dir, artefact, file);
      if (!existsSync(path)) continue;
      const text = readFileSync(path, "utf8");
      const trace = readTrace(text);
      if (!trace || !Object.keys(trace).length) continue;
      let out = text;
      for (const [kind, value] of Object.entries(trace)) {
        if (!KINDS[kind]) continue;
        const pinned = splitTrace(value)
          .map(({ name }) => {
            const sha = regionSha(root, kind, name);
            return sha ? `${name}@${sha}` : name;
          })
          .join(", ");
        if (!pinned) continue;
        out = out.replace(
          new RegExp(`^(\\s+${kind}:).*$`, "m"),
          `$1 ${pinned}`,
        );
      }
      if (out !== text) writeFileSync(path, out);
    }
}
