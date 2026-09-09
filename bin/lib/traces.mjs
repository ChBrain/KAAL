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
  // The one row that reads more of the question than the others: it is
  // handed the artefact that declared it, because a parent resolves inside
  // its own tree and the same name means a different file in each.
  parent: {
    // A place holding directories keeps its named file; a place holding loose
    // pages resolves to the page itself, which is where a name in such a
    // place has always meant to point and never had to.
    where: (name, from) =>
      PLACE_FILE[from.dir] === null
        ? join(from.dir, `${name}.md`)
        : join(from.dir, name, PLACE_FILE[from.dir] ?? "requirement.md"),
    region: null,
    perArtefact: true,
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
  return (
    (value ?? "")
      .split(",")
      .map((s) => s.trim().replace(/^[`\'"]+|[`\'".]+$/g, ""))
      // `none` and `nothing` both name nothing. The trace grammar said
      // `nothing` and the parent's criterion says `none`, and two words for
      // one idea in one grammar is a trap rather than a nicety.
      .filter((s) => s && !/^(nothing|none)$/i.test(s))
      .map((s) => {
        const at = s.indexOf("@");
        return at === -1
          ? { name: s, pin: null }
          : { name: s.slice(0, at), pin: s.slice(at + 1) };
      })
  );
}

/**
 * The sha of the region a kind's row names, or null when the file is gone.
 * @param {string} root @param {string} kind @param {string} name
 */
export function regionSha(root, kind, name, from = { dir: "requirements" }) {
  const row = KINDS[kind];
  if (!row) return null;
  const path = join(root, row.where(name, from));
  if (!existsSync(path)) return null;
  return createHash("sha256")
    .update(region(readFileSync(path, "utf8"), row.region))
    .digest("hex");
}

/** The two artefacts that carry a trace, and the file each keeps it in. */
const PLACES = [
  { dir: "kaal", file: null },
  { dir: "requirements", file: "requirement.md" },
  { dir: "architecture", file: "drawing.md" },
  // The one place listed through its subdirectories, so `plans/acceptance`
  // and `strategy` are artefacts of the same place and one can name the
  // other. Per place and not everywhere: `kaal/` holds one trunk and a rule
  // about how many trunks there are should not change because a place it is
  // not read the same way.
  // The strategy and the plans, and not the runs. A record is evidence a
  // suite passed, produced by running one; it is not an artefact of the
  // tree and it declares nothing it was made from. Reading it as one asked
  // 53 pieces of evidence to carry a frontmatter block.
  { dir: "tests", file: null, deep: true, not: ["runs"] },
];
const PLACE_FILE = Object.fromEntries(PLACES.map((p) => [p.dir, p.file]));
const TREES = ["requirements", "architecture"];
/** Over this share of a tree hanging off its own root, the shape is a star. */
export const STAR_SHARE = 0.5;

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

/**
 * A place holds directories with a named file, or loose pages. A deep place
 * lists its pages through subdirectories and names each by its path below
 * the place, so `plans/acceptance` is one artefact and not two.
 */
const entries = (root, dir, file, deep = false, not = []) => {
  const d = join(root, dir);
  if (file) return dirs(d);
  return existsSync(d)
    ? readdirSync(d, { recursive: deep })
        .map((n) => String(n).replaceAll("\\", "/"))
        .filter((n) => n.endsWith(".md"))
        .filter((n) => !not.some((skip) => n.startsWith(`${skip}/`)))
        .map((n) => n.slice(0, -3))
        .sort()
    : [];
};

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
  for (const { dir, file, deep, not } of PLACES)
    for (const artefact of entries(root, dir, file, deep, not)) {
      const path = file
        ? join(root, dir, artefact, file)
        : join(root, dir, `${artefact}.md`);
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
          const where = KINDS[kind].where(name, { dir, artefact });
          if (!existsSync(join(root, where))) {
            find(artefact, kind, `${name} is not at ${where}`);
            continue;
          }
          // The name is there and what it says may not be. A different
          // finding in different words: one wants a rename, this a reread.
          if (pin && pin !== regionSha(root, kind, name, { dir, artefact }))
            find(
              artefact,
              kind,
              `${name} moved: its ${KINDS[kind].region ?? "whole file"} no longer matches the pin`,
            );
        }
      }
      // A drawing answers exactly one requirement: the edge that runs
      // across, and the only rule here that is not about `parent`.
      if (dir === "architecture") {
        const answers = splitTrace(trace.requirement).length;
        if (answers !== 1)
          find(
            artefact,
            "requirement",
            `answers ${answers} requirements; a drawing answers exactly one`,
          );
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

/** Every artefact, its place, and the parent it declares. */
function nodes(root) {
  const all = [];
  for (const { dir, file, deep, not } of PLACES)
    for (const artefact of entries(root, dir, file, deep, not)) {
      const path = file
        ? join(root, dir, artefact, file)
        : join(root, dir, `${artefact}.md`);
      if (!existsSync(path)) continue;
      const text = readFileSync(path, "utf8");
      const trace = readTrace(text) ?? {};
      const raw = (trace.parent ?? "").trim();
      all.push({
        dir,
        artefact,
        text,
        parent:
          raw && !/^none$/i.test(raw)
            ? (splitTrace(raw)[0]?.name ?? null)
            : null,
        isRoot: /^none$/i.test(raw),
      });
    }
  return all;
}

/**
 * The rules over the graph the parents make: one trunk, an argued root, no
 * ring, and a tree with depth. Kept out of `checkTraces`, which answers
 * about one artefact's own trace: folding these in would change what every
 * caller of that function means by a finding, and three closed contracts
 * call it. An absent parent is never a finding: the
 * seats populate their own trees and this task populates none.
 * @param {string} root
 */
export function checkShape(root) {
  const out = [];
  const find = (artefact, kind, message) =>
    out.push({ artefact, kind, message });
  const all = nodes(root);

  // The trunk is a place, so a tree with none and a tree with two are both
  // findings and neither is a special case written four times.
  const trunks = all.filter((n) => n.dir === "kaal");
  if (!trunks.length)
    find("kaal", "parent", "no trunk under kaal/ above the three trees");
  else if (trunks.length > 1)
    find(
      "kaal",
      "parent",
      `${trunks.length} trunks under kaal/: ${trunks.map((t) => t.artefact).join(", ")}`,
    );

  // A root beyond the trunk argues, and the board reads that it argued.
  for (const n of all.filter((n) => n.isRoot && n.dir !== "kaal"))
    if (!/^- Root because: \S/m.test(n.text))
      find(
        n.artefact,
        "parent",
        "declares no parent and carries no `- Root because:` line",
      );

  // A ring, named in full so a reader can see where to break it.
  const by = new Map(all.map((n) => [`${n.dir}/${n.artefact}`, n]));
  const seen = new Set();
  for (const n of all) {
    const path = [];
    let cur = n;
    while (cur?.parent) {
      const key = `${cur.dir}/${cur.artefact}`;
      if (path.includes(key)) {
        const ring = path
          .slice(path.indexOf(key))
          .map((k) => k.split("/").pop());
        const id = [...ring].sort().join(",");
        if (!seen.has(id)) {
          seen.add(id);
          find(
            ring[0],
            "parent",
            `cycle among parents: ${ring.join(" -> ")} -> ${ring[0]}`,
          );
        }
        break;
      }
      path.push(key);
      cur = by.get(`${cur.dir}/${cur.parent}`);
    }
  }

  // A star satisfies every other rule and protects nothing.
  for (const dir of TREES) {
    const tree = all.filter((n) => n.dir === dir);
    const root_ = tree.find((n) => n.isRoot);
    if (!root_ || tree.length < 3) continue;
    const on = tree.filter((n) => n.parent === root_.artefact).length;
    if (on / tree.length > STAR_SHARE)
      find(
        dir,
        "parent",
        `${on} of ${tree.length} in ${dir} hang off ${root_.artefact}; that is a star, not a tree`,
      );
  }
  return out;
}

/**
 * Write the pin of every trace that resolves, in place, changing nothing
 * else on the page. Nobody types a sha.
 * @param {string} root
 */
export function writePins(root) {
  for (const { dir, file, deep, not } of PLACES)
    for (const artefact of entries(root, dir, file, deep, not)) {
      const path = file
        ? join(root, dir, artefact, file)
        : join(root, dir, `${artefact}.md`);
      if (!existsSync(path)) continue;
      const text = readFileSync(path, "utf8");
      const trace = readTrace(text);
      if (!trace || !Object.keys(trace).length) continue;
      let out = text;
      for (const [kind, value] of Object.entries(trace)) {
        if (!KINDS[kind]) continue;
        const pinned = splitTrace(value)
          .map(({ name }) => {
            // The declaring artefact, which `parent` reads and the other
            // kinds ignore. Without it every parent was pinned from
            // `requirements/<name>/requirement.md` whatever tree declared
            // it: a name that resolved there was pinned to the wrong file
            // and read back as moved for ever, and a name that did not was
            // silently left bare.
            const sha = regionSha(root, kind, name, { dir, artefact });
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
