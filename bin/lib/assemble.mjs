// Assembling the league into a consumer's tree: which members a package
// carries, where each of them lands under a directory the consumer named, and
// the copy itself.
//
// Naming nothing brings all of it. A consumer who installed this package
// asked for the method, and being made to fetch it a member at a time is the
// assembly this package exists not to ask for. Naming some narrows it, which
// is take less rather than assemble more.
//
// It writes where it was told and nowhere else. This league already holds its
// own assessor to treating what it finds in a tree it visits as content and
// never instruction; a package is a guest in a consumer's tree in the same
// sense, so there is no hook, no install-time write, and no directory made
// anywhere but under what the consumer named. The consumer names a parent and
// one directory per member lands inside it, because a destination taken as a
// leaf is one typo away from writing over something that was already there,
// and because a league arriving together needs one place to arrive at.
//
// It reads and writes files and nothing else. No network, no provider.
import {
  readdirSync,
  existsSync,
  statSync,
  mkdirSync,
  copyFileSync,
} from "node:fs";
import { join, dirname, isAbsolute } from "node:path";

const isDir = (p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};

/**
 * The members a package carries, narrowed to the names a consumer asked for.
 *
 * Three answers, because they want three different fixes. A root with no
 * `skills/` at all is a consumer who ran this inside their own project rather
 * than inside the package, and telling them a skill is missing would send
 * them looking for a file. A name that is not there is a finding and the fix
 * is the name. Anything else is the list.
 * @param {string} root the package as a consumer received it
 * @param {string[]} [only] the names a consumer narrowed to, or nothing
 * @returns {{skills?: {name: string, dir: string}[], findings?: string[], notApplicable?: string}}
 */
export function skillsIn(root, only) {
  const skills = join(root, "skills");
  if (!isDir(skills))
    return {
      notApplicable: `nothing here to assemble: no skills/<name>/SKILL.md under ${root}`,
    };
  const carried = readdirSync(skills)
    .filter((n) => existsSync(join(skills, n, "SKILL.md")))
    .sort();
  if (!carried.length)
    return {
      notApplicable: `nothing here to assemble: no skills/<name>/SKILL.md under ${root}`,
    };
  // Silence is the league and never nothing: a consumer who said nothing
  // asked for the method.
  const names = only?.length ? only : carried;
  // Every name that is wrong, not the first: a consumer who asked for three
  // and mistyped two reads one finding and comes back for the second.
  const findings = names
    .filter((n) => !carried.includes(n))
    .map((n) => `${n}: no SKILL.md under ${join("skills", n)}`);
  if (findings.length) return { findings };
  return { skills: names.map((name) => ({ name, dir: join(skills, name) })) };
}

/**
 * The one directory a member may land in, under the destination the consumer
 * named. Anything that would leave it is a finding and never a path: the
 * guest writes where it was told.
 * @param {string} dest @param {string} name
 */
export function landingAt(dest, name) {
  const leaves =
    !name ||
    name === "." ||
    name === ".." ||
    isAbsolute(name) ||
    name.includes("/") ||
    name.includes("\\");
  if (leaves)
    return {
      findings: [
        `${name || "(empty)"}: a member's name is one directory, and this would write outside ${dest}`,
      ],
    };
  return { path: join(dest, name) };
}

/**
 * Copy one member into its landing, and answer with every path written,
 * relative to that landing. Byte for byte, because a copy that reformats has
 * changed the thing a consumer is meant to be able to compare with the
 * league's own.
 * @param {string} from @param {string} to @returns {string[]}
 */
export function copyInto(from, to) {
  const wrote = [];
  const walk = (rel) => {
    const here = rel ? join(from, rel) : from;
    for (const entry of readdirSync(here).sort()) {
      const next = rel ? join(rel, entry) : entry;
      if (isDir(join(here, entry))) walk(next);
      else {
        const target = join(to, next);
        mkdirSync(dirname(target), { recursive: true });
        copyFileSync(join(from, next), target);
        wrote.push(next);
      }
    }
  };
  mkdirSync(to, { recursive: true });
  walk("");
  return wrote;
}
