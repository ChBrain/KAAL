// Every fixture artefact in a tree, by shape: what a new rule will reach
// when it walks, listed before the board finds it. A fixture artefact is a
// file of a shape the walls read, anywhere under a directory named fixtures.
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const SHAPES = {
  "SKILL.md": "skill",
  "kaal.config.json": "config",
  "requirement.md": "requirement",
  "drawing.md": "drawing",
};

const walk = (d) =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.name === "node_modules" || e.name.startsWith(".")
      ? []
      : e.isDirectory()
        ? walk(join(d, e.name))
        : [join(d, e.name)],
  );

/** @param {string} file @returns {string|null} */
export function shapeOf(file) {
  const name = file.split(sep).at(-1);
  if (SHAPES[name]) return SHAPES[name];
  if (name.endsWith(".md")) {
    const head = readFileSync(file, "utf8").slice(0, 2000);
    if (/^---\r?\n[\s\S]*?^verdict:/m.test(head)) return "record";
  }
  return null;
}

/** @param {string} root @returns {{ shape: string, path: string }[]} */
export function listFixtures(root) {
  return walk(root)
    .filter((f) => relative(root, f).split(sep).includes("fixtures"))
    .map((f) => ({
      shape: shapeOf(f),
      path: relative(root, f).split(sep).join("/"),
    }))
    .filter((x) => x.shape)
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}
