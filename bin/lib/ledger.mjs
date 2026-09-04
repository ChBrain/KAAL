// The ladder ledger check: every move sits at a rung it has evidence for.
// A `script` move names a script and a test relative to its skill, and both
// exist. A `skill` move names an eval directory relative to the root holding
// pass records from at least two distinct models whose skill_sha equals the
// current SHA-256 of the skill's SKILL.md; a record missing any field, or
// stale, counts for nothing. `human` and `nlp` need no evidence.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter.mjs";
import { fileSha } from "./sha.mjs";

export const RUNGS = ["human", "nlp", "skill", "script"];

const dirs = (d) =>
  existsSync(d)
    ? readdirSync(d)
        .filter((n) => statSync(join(d, n)).isDirectory())
        .sort()
    : [];

function freshModels(root, evalDir, currentSha) {
  const dir = join(root, evalDir);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return new Set();
  const models = new Set();
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    let data;
    try {
      data = parseFrontmatter(readFileSync(join(dir, f), "utf8")).data;
    } catch {
      continue;
    }
    if (data.model && data.verdict === "pass" && data.skill_sha === currentSha)
      models.add(data.model);
  }
  return models;
}

/**
 * @param {string} root a directory holding skills/ (and evals/)
 * @param {{ skill: string, moves: object[] } | null} only check this ledger instead of reading skills/
 * @returns {{ skill: string, move: string, message: string }[]}
 */
export function checkLedgers(root, only = null) {
  const findings = [];
  const ledgers = only
    ? [only]
    : dirs(join(root, "skills")).map((skill) => ({
        skill,
        ...JSON.parse(
          readFileSync(join(root, "skills", skill, "moves.json"), "utf8"),
        ),
      }));
  for (const { skill, moves } of ledgers) {
    const find = (move, message) => findings.push({ skill, move, message });
    if (!Array.isArray(moves)) {
      find("", "moves is not an array");
      continue;
    }
    for (const m of moves) {
      if (!m.name) find("", "a move has no name");
      if (!RUNGS.includes(m.rung)) {
        find(m.name ?? "", `unknown rung "${m.rung}"`);
        continue;
      }
      if (m.rung === "human" || m.rung === "nlp") continue;
      if (!m.test) {
        find(m.name, `claims ${m.rung} with no test`);
        continue;
      }
      if (m.rung === "script") {
        for (const f of [m.script, m.test])
          if (!f || !existsSync(join(root, "skills", skill, f)))
            find(
              m.name,
              `names a missing file "${f ?? ""}" relative to the skill`,
            );
      } else {
        const current = fileSha(join(root, "skills", skill, "SKILL.md"));
        const models = freshModels(root, m.test, current);
        if (models.size < 2)
          find(
            m.name,
            `has ${models.size} fresh passing model(s) in ${m.test}, needs two`,
          );
      }
    }
  }
  return findings;
}
