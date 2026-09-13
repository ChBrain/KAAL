// The backlog: what a seat cannot do, written where that seat stands, and
// read by anybody who wants the order across six of them. A block is a claim
// about somebody else's tree, so it is never written into that tree: the
// blocked seat says where it is stuck, the owning seat says what the thing
// is, and the manager says when it gets picked up. None of the three decides
// for another, which is why nothing here carries a field for a remedy.
//
// A page holds only what cannot be derived. What a seat is able to start is
// a fact about the tree, so it is computed and never written; what a seat is
// waiting on cannot be computed from the tree alone, because the tree shows
// an absence and not who is owed it. That is the whole division.
//
// It reads the declaration and each declared page that exists. No network, no
// provider, no clock.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter.mjs";

/**
 * A kind of block, and where the thing it waits for lives relative to a root.
 * The same table `traces.mjs` keeps for the same four artefacts, asked a
 * different question: that one resolves a name somebody wrote down, this one
 * resolves an absence somebody is waiting on. A row per kind is what makes
 * the concept general and a rule per kind is what it refuses.
 *
 * A kind with no row here could never clear, which is why the declaration
 * and this table are held to each other rather than either being the list.
 */
const WHERE = {
  "no requirement": (task) => join("requirements", task, "requirement.md"),
  "no drawing": (task) => join("architecture", task, "drawing.md"),
  "no proof": (task) => join("requirements", task, "acceptance.test.mjs"),
  "no record": (task) => join("tests", "runs", `${task}.md`),
};

/** Whether this engine can say what a block of that kind is waiting for. */
export const resolves = (kind) => Object.hasOwn(WHERE, kind);

const declared = (root) =>
  JSON.parse(readFileSync(join(root, "kaal.config.json"), "utf8"));

/**
 * One page per declared seat, at the tree that seat owns. Read off the
 * declaration and never written down again: a seat already says what it owns,
 * so a second line saying where its backlog lives is a fact with two owners.
 * @param {string} root
 */
export function pages(root) {
  return (declared(root).seats ?? []).map((seat) => ({
    seat: seat.name,
    path: `${String((seat.owns ?? [])[0]).split("/")[0]}/backlog.md`,
  }));
}

/**
 * What a page says, one entry per key in its `blocks:` block. The key is
 * `<seat>/<task>` and the value is the kind, which is the shape `reviews:`
 * already proved under this parser: compound, because one task may be blocked
 * on two seats at once and a key that was only the task would hold one of
 * them and drop the other without a word.
 * @param {string} text
 */
export function entries(text) {
  const entries = [];
  const findings = [];
  let data;
  try {
    data = parseFrontmatter(text).data;
  } catch {
    return { entries, findings };
  }
  const blocks = data?.blocks;
  if (!blocks || typeof blocks !== "object") return { entries, findings };
  for (const [key, value] of Object.entries(blocks)) {
    const at = String(key).indexOf("/");
    if (at < 0) {
      findings.push(`${key}: no seat owes it: a key is <seat>/<task>`);
      continue;
    }
    entries.push({
      seat: key.slice(0, at),
      task: key.slice(at + 1),
      kind: String(value).trim(),
    });
  }
  return { entries, findings };
}

/**
 * Whether a block still stands, which the tree answers and nobody decides. A
 * kind this engine cannot resolve stands, because an unknown absence is not
 * an absence that was filled; the finding about it is raised where the
 * declaration is read, so a reader is told once rather than once per entry.
 * @param {string} root @param {{task: string, kind: string}} entry
 */
export function stands(root, entry) {
  const where = WHERE[entry.kind];
  return where ? !existsSync(join(root, where(entry.task))) : true;
}

/**
 * Every page, every entry, and which of the two sets each entry is in. A
 * block whose need is met is reported as cleared rather than dropped: the
 * seat that wrote it is the only one who may take it off the page, and it
 * cannot do that if nothing tells it the block is spent.
 * @param {string} root
 */
export function read(root) {
  const config = declared(root);
  const seats = (config.seats ?? []).map((s) => s.name);
  const kinds = config.blocks ?? [];
  const declaredPages = pages(root).map((page) => ({
    ...page,
    read: existsSync(join(root, ...page.path.split("/"))),
  }));
  const findings = [];
  const standing = [];
  const cleared = [];
  // Said once, about the declaration, and not once per block: a kind nothing
  // resolves is a defect in the vocabulary and never in the page that used it.
  for (const kind of kinds)
    if (!resolves(kind))
      findings.push(
        `kaal.config.json: ${kind}: nothing resolves it, so a block naming it could never clear`,
      );
  for (const { path, read } of declaredPages) {
    if (!read) continue;
    const full = join(root, ...path.split("/"));
    const page = entries(readFileSync(full, "utf8"));
    for (const finding of page.findings) findings.push(`${path}: ${finding}`);
    for (const entry of page.entries) {
      if (!seats.includes(entry.seat)) {
        findings.push(`${path}: ${entry.task}: no seat named ${entry.seat}`);
        continue;
      }
      if (!kinds.includes(entry.kind)) {
        findings.push(`${path}: ${entry.task}: no kind named ${entry.kind}`);
        continue;
      }
      (stands(root, entry) ? standing : cleared).push({ ...entry, page: path });
    }
  }
  return { pages: declaredPages, findings, standing, cleared };
}
