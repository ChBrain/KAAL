// The ladder ledger check: every move sits at a rung it has evidence for.
// A `script` move names a script and a test relative to its skill, and both
// exist. A `skill` move names an eval directory relative to the root holding
// complete, pass, fresh records from at least two distinct models, as
// record.mjs reads them; a record missing any field, or stale on any of its
// three shas, counts for nothing and the reason is named. `human` and `nlp` need no evidence.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { freshModels } from "./record.mjs";

export const RUNGS = ["human", "nlp", "skill", "script"];

const dirs = (d) =>
  existsSync(d)
    ? readdirSync(d)
        .filter((n) => statSync(join(d, n)).isDirectory())
        .sort()
    : [];

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
        const { models, reasons } = freshModels(root, m.test, skill);
        if (models.size < 2)
          find(
            m.name,
            `has ${models.size} fresh passing model(s) in ${m.test}, needs two${reasons.length ? ` (${reasons.join("; ")})` : ""}`,
          );
      }
    }
  }
  return findings;
}

/**
 * The standing of every candidate: a move whose `candidate` is `skill` has
 * as many fresh passing models as its eval directory holds, out of the two
 * the rung needs; a candidate that names no test is read over every fixture
 * under evals/<skill>/, so the first record shows before a move claims it.
 * @param {string} root
 * @returns {{ skill: string, move: string, fresh: number, need: number }[]}
 */
export function standings(root) {
  const out = [];
  for (const skill of dirs(join(root, "skills"))) {
    const p = join(root, "skills", skill, "moves.json");
    if (!existsSync(p)) continue;
    const { moves } = JSON.parse(readFileSync(p, "utf8"));
    if (!Array.isArray(moves)) continue;
    for (const m of moves) {
      if (m.candidate !== "skill") continue;
      const where = m.test
        ? [m.test]
        : dirs(join(root, "evals", skill)).map((d) => `evals/${skill}/${d}`);
      const models = new Set();
      for (const d of where)
        for (const x of freshModels(root, d, skill).models) models.add(x);
      out.push({
        skill,
        move: m.name,
        fresh: Math.min(models.size, 2),
        need: 2,
      });
    }
  }
  return out;
}
