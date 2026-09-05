// The eval record: one model's run on one fixture, and the one place its
// contract lives in code. A record counts as evidence only when every field
// is present, its verdict is pass, and all three shas still match the files
// they name; a stale or incomplete record counts for nothing, and the reason
// is named so a reader can regenerate it.
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
  "verdict",
];
export const VERDICTS = ["pass", "flag"];

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
    (VERDICTS.includes(data.verdict) ? null : "verdict");
  return { data, missing };
}

const shaOrNull = (p) => (existsSync(p) ? fileSha(p) : null);

/** All three shas must equal the current files: the skill, and the fixture's ask and expect. */
export function isFresh(data, root, skill) {
  const fx = join(root, "skills", skill, "fixtures", data.fixture ?? "");
  return (
    data.skill_sha === shaOrNull(join(root, "skills", skill, "SKILL.md")) &&
    data.ask_sha === shaOrNull(join(fx, "ask.md")) &&
    data.expect_sha === shaOrNull(join(fx, "expect.md"))
  );
}

/** @returns {{ models: Set<string>, reasons: string[] }} */
export function freshModels(root, evalDir, skill) {
  const dir = join(root, evalDir);
  const models = new Set();
  const reasons = [];
  if (!existsSync(dir) || !statSync(dir).isDirectory())
    return { models, reasons: [`${evalDir} is not a directory`] };
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
    if (!isFresh(data, root, skill)) {
      reasons.push(`${f} is stale`);
      continue;
    }
    models.add(data.model);
  }
  return { models, reasons };
}
