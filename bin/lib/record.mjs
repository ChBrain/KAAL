// The eval record: one model's run on one fixture, and the one place its
// contract lives in code. A record counts as evidence only when every field
// is present, its verdict is pass, and all three shas still match the files
// they name; a stale or incomplete record counts for nothing, and the reason
// is named so a reader can regenerate it. `setup` says how the skill was
// given to the model, one of four words, because the same skill behaves as
// three skills across a pasted chat, a system prompt and an open workspace.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter.mjs";
import { fileSha } from "./sha.mjs";

export const FIELDS = [
  "model",
  "reader",
  "temperature",
  "date",
  "fixture",
  "ask_sha",
  "expect_sha",
  "skill_sha",
  "setup",
  "verdict",
];
export const VERDICTS = ["pass", "flag"];
export const SETUPS = ["chat", "system", "workspace", "workflow"];

/** @returns {{ data: Record<string,string>, missing: string|null }} */
export function readRecord(path) {
  let data;
  try {
    data = parseFrontmatter(readFileSync(path, "utf8")).data;
  } catch (e) {
    return { data: {}, missing: "frontmatter" };
  }
  const missing =
    FIELDS.find((k) => !data[k]) ??
    (SETUPS.includes(data.setup) ? null : "setup") ??
    (VERDICTS.includes(data.verdict) ? null : "verdict");
  return { data, missing };
}

const shaOrNull = (p) => (existsSync(p) ? fileSha(p) : null);

/** Which of the three files moved since the record, or null when none did. */
export function whyStale(data, root, skill) {
  const fx = join(root, "skills", skill, "fixtures", data.fixture ?? "");
  if (data.skill_sha !== shaOrNull(join(root, "skills", skill, "SKILL.md")))
    return "skill moved";
  if (data.ask_sha !== shaOrNull(join(fx, "ask.md"))) return "ask moved";
  if (data.expect_sha !== shaOrNull(join(fx, "expect.md")))
    return "expect moved";
  return null;
}

/** All three shas must equal the current files: the skill, and the fixture's ask and expect. */
export function isFresh(data, root, skill) {
  return whyStale(data, root, skill) === null;
}

/**
 * @returns {{ models: Set<string>, reasons: string[], stale: { file: string, why: string }[] }}
 * stale lists the records that passed and then lost a sha, so a board can say
 * "measured, then moved" instead of "never measured".
 */
export function freshModels(root, evalDir, skill) {
  const dir = join(root, evalDir);
  const models = new Set();
  const reasons = [];
  const stale = [];
  if (!existsSync(dir) || !statSync(dir).isDirectory())
    return { models, reasons: [`${evalDir} is not a directory`], stale };
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const { data, missing } = readRecord(join(dir, f));
    if (missing) {
      reasons.push(`${f} is missing ${missing}`);
      continue;
    }
    if (data.verdict !== "pass") {
      reasons.push(`${f} is ${data.verdict}`);
      continue;
    }
    const why = whyStale(data, root, skill);
    if (why) {
      reasons.push(`${f} is stale (${why})`);
      stale.push({ file: f, why });
      continue;
    }
    models.add(data.model);
  }
  return { models, reasons, stale };
}
