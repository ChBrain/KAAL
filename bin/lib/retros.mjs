// Unconsumed retros per skill. A retro feeds a skill through its `Feeds:`
// line; it is consumed once any requirement.md under requirements/ names its
// filename; retros/archive/ is not read.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const dirs = (d) =>
  existsSync(d)
    ? readdirSync(d)
        .filter((n) => statSync(join(d, n)).isDirectory())
        .sort()
    : [];

/** @param {string} root @returns {{ skill: string, count: number }[]} */
export function countRetros(root) {
  const R = join(root, "retros");
  const Q = join(root, "requirements");
  const consumed = dirs(Q)
    .map((d) => join(Q, d, "requirement.md"))
    .filter(existsSync)
    .map((p) => readFileSync(p, "utf8"))
    .join("\n");
  const retros = existsSync(R)
    ? readdirSync(R)
        .filter(
          (f) =>
            f.endsWith(".md") &&
            statSync(join(R, f)).isFile() &&
            !consumed.includes(f),
        )
        .map((f) => readFileSync(join(R, f), "utf8"))
    : [];
  return dirs(join(root, "skills")).map((skill) => ({
    skill,
    count: retros.filter((t) =>
      new RegExp(
        "^Feeds: `?" +
          skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
          "`?\\.?\\s*$",
        "m",
      ).test(t),
    ).length,
  }));
}
