// The drawings wall: every drawing under architecture/<task>/ holds the
// template's shape, read from text and never by running anything (the
// contracts wall runs the tests). Five rules, one finding per broken rule
// per drawing, naming the task and the rule.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

export const SECTIONS = [
  "Structure",
  "Seams",
  "Fixed and free",
  "Decisions",
  "Test strategy",
  "Handoff",
];
export const RULES = ["sections", "edges", "tests", "strategy", "orphan"];

const dirs = (d) =>
  existsSync(d)
    ? readdirSync(d)
        .filter((n) => statSync(join(d, n)).isDirectory())
        .sort()
    : [];
const section = (text, title) =>
  text.match(
    new RegExp(`^## ${title}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"),
  )?.[1] ?? "";
const numbered = (text) => (text.match(/^\d+\. /gm) ?? []).length;

/** The numbers a strategy cell names: "1", "2, 3", "1 to 3". */
export function criteriaInCell(cell) {
  const out = new Set();
  for (const m of cell.matchAll(/(\d+)\s*(?:to|-)\s*(\d+)/g))
    for (let i = Number(m[1]); i <= Number(m[2]); i++) out.add(i);
  for (const m of cell.replace(/\d+\s*(?:to|-)\s*\d+/g, "").matchAll(/\d+/g))
    out.add(Number(m[0]));
  return out;
}

/**
 * @param {string} root
 * @param {string} task
 * @returns {{ task: string, rule: string, message: string }[]}
 */
export function checkDrawing(root, task) {
  const findings = [];
  const find = (rule, message) => findings.push({ task, rule, message });
  const dir = join(root, "architecture", task);
  const text = readFileSync(join(dir, "drawing.md"), "utf8");

  const heads = (text.match(/^## .+$/gm) ?? []).map((h) => h.slice(3).trim());
  const order = heads.filter((h) => SECTIONS.includes(h));
  if (order.join("|") !== SECTIONS.join("|"))
    find(
      "sections",
      `expected the sections ${SECTIONS.join(", ")} in that order; found ${order.join(", ") || "none"}`,
    );

  const seamsText = section(text, "Seams");
  const seams = numbered(seamsText.replace(/```[\s\S]*?```/g, ""));
  const mermaid = seamsText.match(/```mermaid\n([\s\S]*?)```/);
  // One labelled edge per line: a line that carries a quoted label and an
  // arrow. Counted by reading lines, not by a regex over the block, so no
  // reader mistakes the arrow for a comment delimiter.
  const edges = mermaid
    ? mermaid[1]
        .split("\n")
        .filter((l) => l.includes('-- "') && l.includes("-->")).length
    : 0;
  if (!mermaid)
    find("edges", `no mermaid block under Seams for ${seams} seam(s)`);
  else if (edges !== seams)
    find("edges", `${edges} labelled edge(s) for ${seams} numbered seam(s)`);

  const cf = join(dir, "contracts.test.mjs");
  const tests = existsSync(cf)
    ? (readFileSync(cf, "utf8").match(/^\s*test\(\s*["'`]\d+\./gm) ?? []).length
    : 0;
  if (!existsSync(cf))
    find("tests", `no contracts.test.mjs for ${seams} seam(s)`);
  else if (tests !== seams)
    find("tests", `${tests} numbered contract test(s) for ${seams} seam(s)`);

  const rq = join(root, "requirements", task, "requirement.md");
  if (!existsSync(rq)) {
    find("orphan", `no requirements/${task}/requirement.md for this drawing`);
    return findings;
  }
  const criteria = numbered(
    section(readFileSync(rq, "utf8"), "Acceptance criteria"),
  );
  const named = new Set();
  for (const row of section(text, "Test strategy").matchAll(
    /^\|\s*([^|]*?)\s*\|/gm,
  ))
    if (!/^-+$|^criterion$/i.test(row[1]))
      for (const n of criteriaInCell(row[1])) named.add(n);
  const missing = [];
  for (let i = 1; i <= criteria; i++) if (!named.has(i)) missing.push(i);
  if (criteria === 0)
    find("strategy", "the requirement has no numbered criteria");
  else if (missing.length)
    find(
      "strategy",
      `criteria not in the strategy table: ${missing.join(", ")}`,
    );
  return findings;
}

/** @param {string} root */
export function checkDrawings(root) {
  return dirs(join(root, "architecture"))
    .filter((t) => existsSync(join(root, "architecture", t, "drawing.md")))
    .flatMap((t) => checkDrawing(root, t));
}
