// The agent rules: the design's section 3 as a wall. A binding (AGENT.md)
// with seven fields and six sections in order; a persona (persona.md) with
// four chapters in order, the shape credited to khai in its frontmatter, and
// no scope in its body; a ledger; a fixture. Loadouts resolve under skills/,
// hands under agents/. Reads only the agent directory and those two trees.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter.mjs";
import { RUNGS } from "./ledger.mjs";

export const RULES = [
  "fields",
  "name",
  "division",
  "skills",
  "hands_to",
  "lane",
  "license",
  "sections",
  "chapters",
  "credit",
  "scope",
  "ledger",
  "fixtures",
];
export const FIELDS = [
  "name",
  "description",
  "division",
  "skills",
  "hands_to",
  "lane",
  "license",
];
export const SECTIONS = [
  "Purpose",
  "Allowed",
  "Not allowed",
  "Input",
  "Output",
  "Handoff",
];
export const CHAPTERS = ["Projection", "Action", "Shadow", "Tell"];

const dirs = (d) =>
  existsSync(d)
    ? readdirSync(d)
        .filter((n) => statSync(join(d, n)).isDirectory())
        .sort()
    : [];
const list = (v) =>
  (v ?? "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
const headings = (body) =>
  body
    .split("\n")
    .filter((l) => /^## /.test(l))
    .map((l) => l.replace(/^## /, "").trim());

/** @param {string} root @returns {{ agent: string, rule: string, message: string }[]} */
export function checkAgents(root) {
  const findings = [];
  const A = join(root, "agents");
  for (const agent of dirs(A)) {
    const dir = join(A, agent);
    const find = (rule, message) => findings.push({ agent, rule, message });
    const bindingPath = join(dir, "AGENT.md");
    if (!existsSync(bindingPath)) {
      find("fields", "no AGENT.md");
    } else {
      let parsed;
      try {
        parsed = parseFrontmatter(readFileSync(bindingPath, "utf8"));
      } catch (e) {
        find("fields", e.message);
        parsed = null;
      }
      if (parsed) {
        const { data, body } = parsed;
        for (const f of FIELDS) if (!(f in data)) find("fields", `no ${f}`);
        if (data.name !== agent)
          find("name", `"${data.name ?? ""}" does not match the directory`);
        if (!RUNGS.includes(data.division))
          find("division", `"${data.division ?? ""}" is not a rung name`);
        for (const s of list(data.skills))
          if (!existsSync(join(root, "skills", s, "SKILL.md")))
            find("skills", `${s} does not resolve under skills/`);
        for (const h of list(data.hands_to))
          if (!existsSync(join(A, h, "AGENT.md")))
            find("hands_to", `${h} does not resolve under agents/`);
        if (list(data.lane).length === 0) find("lane", "lane is empty");
        if (data.license !== "MIT")
          find("license", `license must be MIT, got "${data.license ?? ""}"`);
        const h = headings(body);
        if (JSON.stringify(h) !== JSON.stringify(SECTIONS))
          find(
            "sections",
            `expected ${SECTIONS.join(", ")} in order, found ${h.join(", ") || "none"}`,
          );
      }
    }
    const personaPath = join(dir, "persona.md");
    if (!existsSync(personaPath)) {
      find("chapters", "no persona.md");
    } else {
      let parsed;
      try {
        parsed = parseFrontmatter(readFileSync(personaPath, "utf8"));
      } catch (e) {
        find("credit", e.message);
        parsed = null;
      }
      if (parsed) {
        const { data, body } = parsed;
        const h = headings(body);
        if (JSON.stringify(h) !== JSON.stringify(CHAPTERS))
          find(
            "chapters",
            `expected ${CHAPTERS.join(", ")} in order, found ${h.join(", ") || "none"}`,
          );
        if (!/khai/i.test(data.shape ?? data.credit ?? ""))
          find(
            "credit",
            "the persona's frontmatter does not credit khai for the shape",
          );
        if (/\bAllowed\b|\bNot allowed\b/.test(body))
          find(
            "scope",
            "the persona carries Allowed or Not allowed; scope lives in AGENT.md",
          );
      }
    }
    const ledgerPath = join(dir, "moves.json");
    if (!existsSync(ledgerPath)) find("ledger", "no moves.json");
    else {
      try {
        const { moves } = JSON.parse(readFileSync(ledgerPath, "utf8"));
        if (!Array.isArray(moves) || moves.length === 0)
          find("ledger", "no moves");
        else
          for (const m of moves)
            if (!m.name || !RUNGS.includes(m.rung))
              find(
                "ledger",
                `move "${m.name ?? ""}" has no name or an unknown rung`,
              );
      } catch (e) {
        find("ledger", e.message);
      }
    }
    const fx = join(dir, "fixtures");
    const cases = dirs(fx);
    if (cases.length === 0) find("fixtures", "no fixture");
    for (const c of cases)
      for (const f of ["ask.md", "expect.md"])
        if (!existsSync(join(fx, c, f))) find("fixtures", `${c} has no ${f}`);
  }
  return findings;
}
