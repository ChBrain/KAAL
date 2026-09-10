// The lane guard: whether this diff is one seat's, and whether it moved a
// proof its seat did not write. The lane comes from the branch and never from
// the diff, because a lane read off a diff is whatever you changed, and there
// is nothing left for a guard to be wrong about.
//
// Deny by default. A path is allowed when the lane's seat owns it, when the
// lane itself allows it, or when it is shared; everything else is a finding.
// A path nobody declared is not free: this tree grows paths faster than it
// grows declarations, and allow by default is the vacuous pass wearing a
// config.
//
// It reads git and the config and nothing else. No network, no provider.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { resolves } from "./class.mjs";

const git = (root, ...args) =>
  spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
const lines = (s) => (s ?? "").split("\n").filter((l) => l.trim());

/**
 * A path pattern against a path, with two wildcards and no more: `*` for one
 * segment and `**` for any number. No braces, no negation, no classes, and no
 * dependency: the engine ships `files: ["bin"]`, so a library here would ship
 * to every consumer for the sake of comparing a string to a pattern. A
 * declaration that needs more than this has stopped being readable.
 * @param {string} path @param {string} glob
 */
export function matches(path, glob) {
  let out = "^";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      // `**/` matches nothing as well as any number of segments, so `**/x`
      // finds `x` at the root and not only below it.
      if (glob[i + 2] === "/") {
        out += "(?:.*/)?";
        i += 2;
      } else {
        out += ".*";
        i += 1;
      }
    } else if (c === "*") out += "[^/]*";
    else if (".+^${}()|[]\\?".includes(c)) out += "\\" + c;
    else out += c;
  }
  return new RegExp(out + "$").test(path);
}
const any = (path, globs) => (globs ?? []).some((g) => matches(path, g));

/**
 * The declaration, and what is wrong with it. Two seats owning one path is a
 * finding because the guard could not say whose it is; a lane carrying two
 * seats is a finding because that is the shape this whole task exists to make
 * impossible. A lane carrying none is not: four of this league's eight carry
 * none and declare paths of their own instead.
 * @param {string} root
 * @returns {{seats: object[], lanes: object[], shared: string[], findings: string[]}}
 */
export function readSeats(root) {
  let cfg = {};
  try {
    cfg = JSON.parse(readFileSync(join(root, "kaal.config.json"), "utf8"));
  } catch {
    // An unreadable config is applicability's answer and not a finding here:
    // the command refuses the tree before it ever asks this.
  }
  const seats = cfg.seats ?? [];
  const lanes = cfg.lanes ?? [];
  const shared = cfg.shared ?? [];
  const findings = [];
  const owned = seats.flatMap((s) => s.owns ?? []);
  for (const g of [...new Set(owned.filter((g, i) => owned.indexOf(g) !== i))])
    findings.push(`${g}: owned by two seats; a path belongs to one`);
  for (const l of lanes)
    if (Array.isArray(l.seat))
      findings.push(
        `${l.pattern}: carries more than one seat; a lane carries one or none`,
      );
  return { seats, lanes, shared, findings };
}

/**
 * The branch, and the lane it names. Git first; where HEAD names no branch,
 * the environment, because a checkout on a pull request is detached and the
 * board runs there. One name the league owns rather than a provider's, so the
 * vendor stays in the workflow. Where neither answers, the question is not
 * this tree's: a wall that does not run beats a wall that lies.
 * @param {string} root @param {Record<string,string>} env
 */
export function laneOf(root, env = process.env) {
  const { lanes } = readSeats(root);
  const head = git(root, "rev-parse", "--abbrev-ref", "HEAD").stdout.trim();
  // Detached HEAD answers with the word HEAD, which is not a branch name.
  const branch =
    head && head !== "HEAD" ? head : (env.KAAL_BRANCH ?? "").trim();
  if (!branch)
    return {
      branch: null,
      lane: null,
      notApplicable:
        "no branch to read a lane from: HEAD names none and KAAL_BRANCH is unset",
    };
  return {
    branch,
    lane: lanes.find((l) => matches(branch, l.pattern)) ?? null,
  };
}

/**
 * Every path the change carries, against a base ref. A rename is one act and
 * comes back as the path it landed at, because moving a case beside its code
 * is the move the seat rule exists to cause and two lanes would refuse it.
 * Untracked files are here too: a file a person has written and not yet added
 * is still something they are about to land. The class wall reads neither,
 * on purpose, and the two walls share a ref check and not a definition.
 * @param {string} root @param {string} base
 */
export function paths(root, base) {
  if (!resolves(root, base))
    return { notApplicable: `${base} names no commit` };
  const out = new Set();
  for (const line of lines(
    git(root, "diff", "--name-status", "-M", base).stdout,
  )) {
    const cols = line.split("\t");
    // `R<score>\told\tnew`; everything else is `<status>\t<path>`.
    out.add(cols[0].startsWith("R") ? cols[2] : cols[1]);
  }
  for (const p of lines(
    git(root, "ls-files", "--others", "--exclude-standard").stdout,
  ))
    out.add(p);
  return { paths: [...out].filter(Boolean) };
}

/**
 * Which seats a diff touches, and which of its paths its lane does not allow.
 * The seat lines are about the diff and the findings are about the lane, so a
 * diff that reaches two seats says so even while it is being refused.
 * @param {string[]} list @param {object|null} lane
 * @param {{seats: object[], shared: string[]}} declaration
 */
export function crossings(list, lane, declaration) {
  const { seats, shared } = declaration;
  const seat = seats.find((s) => s.name === lane?.seat) ?? null;
  const touched = [];
  const findings = [];
  for (const p of list) {
    const owner = seats.find((s) => any(p, s.owns));
    if (owner && !touched.includes(owner.name)) touched.push(owner.name);
    if (any(p, shared)) continue;
    if (any(p, lane?.allows)) continue;
    if (seat && any(p, seat.owns)) continue;
    findings.push(`${p}: outside the lane ${lane?.pattern}`);
  }
  // In the order the seats are declared, which is the chain: what was asked,
  // what was designed, what was proved, what is green.
  const order = seats.map((s) => s.name);
  return {
    lines: touched
      .sort((a, b) => order.indexOf(a) - order.indexOf(b))
      .map((n) => `seat ${n}`),
    findings,
  };
}

/**
 * The three shapes that are somebody's proof: where each lives, whose it is
 * to write, and the task it belongs to. The seat matters because the harm the
 * ask named is a seat making a proof pass that another seat wrote, and not a
 * seat writing its own. An analyst who may not write an acceptance test has
 * no job left.
 */
const PROOFS = [
  { re: /^requirements\/([^/]+)\/acceptance\.test\.mjs$/, seat: "analyst" },
  { re: /^requirements\/([^/]+)\/fixtures\//, seat: "analyst" },
  { re: /^architecture\/([^/]+)\/contracts\.test\.mjs$/, seat: "architect" },
];
const proofOf = (p) => {
  for (const k of PROOFS) {
    const m = p.match(k.re);
    if (m) return { task: m[1], seat: k.seat };
  }
  return null;
};

/**
 * Does this branch name this task? A branch is `<lane>/<topic>` and a topic
 * is a task with whatever the person added to tell two diffs on one task
 * apart, so `requirement/a-tree-has-one-root-amend` is that task's branch and
 * `requirement/beta` is not `alpha`'s. The boundary is a dash and never a
 * bare prefix: a task called `a-tree` must not reach `a-tree-has-one-root`.
 * @param {string|null} branch @param {string} task
 */
export function namesTask(branch, task) {
  const topic = String(branch ?? "")
    .split("/")
    .slice(1)
    .join("/");
  return topic === task || topic.startsWith(task + "-");
}

/**
 * A proof changed by a seat that did not write it, unless a requirement in
 * the same diff declares a supersede of the task that owns it. The escape is
 * a declaration and never a flag: the harm the ask named is the silence and
 * not the change, and a flag is silence with a keystroke. It excuses only
 * what it names, and it never excuses the crossing.
 * A seat writing its own kind of proof, on the branch that names that proof's
 * task, is the job and not the harm: the analyst writes acceptance tests and
 * a requirement's fixtures, the architect writes a drawing's contract tests,
 * and no other seat writes either. Where the caller says nothing about the
 * lane, nothing is excused, which is what the contracts drive.
 * @param {string} root @param {string[]} list
 * @param {{branch: string|null, lane: object|null}} [where] the lane and its branch
 */
export function proofs(root, list, where) {
  const declared = new Set();
  for (const p of list.filter((p) =>
    /^requirements\/[^/]+\/requirement\.md$/.test(p),
  )) {
    const file = join(root, ...p.split("/"));
    // A deleted requirement is in the diff and not on the disk.
    if (!existsSync(file)) continue;
    const m = readFileSync(file, "utf8").match(/^\s*supersedes:\s*(.+)$/m);
    if (!m) continue;
    for (const name of m[1].split(",").map((s) => s.trim().split("@")[0]))
      if (name && !/^(nothing|none)$/i.test(name)) declared.add(name);
  }
  const findings = [];
  for (const p of list) {
    const proof = proofOf(p);
    if (!proof || declared.has(proof.task)) continue;
    if (where?.lane?.seat !== proof.seat) {
      findings.push(`${p}: a proof its seat did not write`);
      continue;
    }
    // The right seat on the wrong task: one analyst branch rewriting another
    // task's criteria is one seat and two tasks, and it is the half of the
    // ask about cheating rather than the half about accidents.
    if (!namesTask(where.branch, proof.task))
      findings.push(
        `${p}: another task's proof, and no requirement here supersedes ${proof.task}`,
      );
  }
  return { findings };
}
