// The skill rules: the league's own copy of the agentskills standard's
// SKILL.md constraints (name, description, budget, reference depth) and the
// league policy on top (licence, vendor neutrality, the dash ban). Reads only
// SKILL.md and references/ under each skill directory; knows nothing about
// how a skill is written, only what it must contain.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter.mjs";

export const VENDORS = [
  /claude\.ai/i,
  /\bclaude code\b/i,
  /\bcopilot\b/i,
  /\bchatgpt\b/i,
  /\bopenai\b/i,
  /\bgemini\b/i,
  /\bperplexity\b/i,
];
export const RULES = [
  "name",
  "description",
  "license",
  "budget",
  "depth",
  "vendor",
  "dash",
];

const dirs = (d) =>
  existsSync(d)
    ? readdirSync(d)
        .filter((n) => statSync(join(d, n)).isDirectory())
        .sort()
    : [];
const mdFiles = (d) =>
  existsSync(d)
    ? readdirSync(d, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory()
          ? mdFiles(join(d, e.name))
          : e.name.endsWith(".md")
            ? [join(d, e.name)]
            : [],
      )
    : [];

/**
 * @param {string} skillsDir a directory holding skill directories
 * @returns {{ skill: string, rule: string, message: string }[]}
 */
export function checkSkills(skillsDir) {
  const findings = [];
  const find = (skill, rule, message) =>
    findings.push({ skill, rule, message });
  for (const skill of dirs(skillsDir)) {
    const dir = join(skillsDir, skill);
    const md = join(dir, "SKILL.md");
    if (!existsSync(md)) {
      find(skill, "name", "no SKILL.md");
      continue;
    }
    const text = readFileSync(md, "utf8");
    let parsed;
    try {
      parsed = parseFrontmatter(text);
    } catch (e) {
      find(skill, "name", e.message);
      continue;
    }
    const { data, body } = parsed;
    if (data.name !== skill)
      find(
        skill,
        "name",
        `name "${data.name ?? ""}" does not match the directory`,
      );
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(skill) || skill.length > 64)
      find(
        skill,
        "name",
        "name must be lowercase alphanumerics and single hyphens, at most 64 characters",
      );
    if (!data.description || data.description.length > 1024)
      find(
        skill,
        "description",
        "description must be non-empty and at most 1024 characters",
      );
    if (data.license !== "MIT")
      find(
        skill,
        "license",
        `license must be MIT, got "${data.license ?? ""}"`,
      );
    if (text.split("\n").length >= 500)
      find(skill, "budget", "SKILL.md must be under 500 lines");
    for (const m of body.matchAll(/\]\(([^)]+)\)/g)) {
      const t = m[1];
      if (/^[a-z]+:/.test(t)) continue;
      if (t.split("/").length > 2)
        find(skill, "depth", `reference "${t}" is more than one level deep`);
    }
    for (const f of [md, ...mdFiles(join(dir, "references"))]) {
      const t = readFileSync(f, "utf8");
      for (const re of VENDORS) {
        const hit = t.match(re);
        if (hit)
          find(
            skill,
            "vendor",
            `${f.slice(skillsDir.length + 1)} names a vendor or runtime: "${hit[0]}"`,
          );
      }
      if (/[\u2013\u2014]/.test(t))
        find(
          skill,
          "dash",
          `${f.slice(skillsDir.length + 1)} carries an en-dash or em-dash`,
        );
    }
  }
  return findings;
}
