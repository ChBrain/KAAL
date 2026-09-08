// Unconsumed retros per skill, and the skills each retro read. A retro feeds
// a skill through its `Feeds:` line and reads skills through its `Read:`
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

/** Names on a retro's `Read:` line, with the two liberties `Feeds:` takes:
 * a name may be backticked and the line may end in a period. No line, or a
 * line holding nothing, is no names.
 * @param {string} text @returns {string[]} */
const readNames = (text) =>
  (text.match(/^Read:(.*)$/m)?.[1] ?? "")
    .split(",")
    // The period comes off first: with the backticks stripped ahead of it,
    // the closing backtick of `` `skill`. `` is no longer at the end and
    // survives into the name.
    .map((n) => n.trim().replace(/\.$/, "").replace(/^`|`$/g, ""))
    .filter(Boolean);

/** Every retro under retros/, consumed or not, with its text.
 * @param {string} root @returns {{ file: string, text: string }[]} */
const filed = (root) => {
  const R = join(root, "retros");
  return existsSync(R)
    ? readdirSync(R)
        .filter((f) => f.endsWith(".md") && statSync(join(R, f)).isFile())
        .map((f) => ({ file: f, text: readFileSync(join(R, f), "utf8") }))
    : [];
};

/** A read line naming something that is no skill in this tree. It counts
 * nowhere and reads exactly like a skill nobody reads, which is the state
 * this whole count exists to make impossible.
 * @param {string} root @returns {{ retro: string, name: string }[]} */
export function readFindings(root) {
  const skills = dirs(join(root, "skills"));
  const findings = [];
  for (const r of filed(root))
    for (const name of readNames(r.text))
      if (!skills.includes(name)) findings.push({ retro: r.file, name });
  return findings;
}

/** @param {string} root @returns {{ skill: string, count: number, read: number }[]} */
export function countRetros(root) {
  const Q = join(root, "requirements");
  const consumed = dirs(Q)
    .map((d) => join(Q, d, "requirement.md"))
    .filter(existsSync)
    .map((p) => readFileSync(p, "utf8"))
    .join("\n");
  const all = filed(root);
  const retros = all
    .filter((r) => !consumed.includes(r.file))
    .map((r) => r.text);
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
    // Every retro, consumed or not: a stack run on another skill consumes
    // retros for that skill's sake, and erasing their reads would make the
    // skill they read go quiet at the moment the tree learned something.
    read: all.filter((r) => readNames(r.text).includes(skill)).length,
  }));
}
