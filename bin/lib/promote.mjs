// The promotion: whether this tree may reach the target it is asked about,
// and everything that refuses it. Nothing here decides anything about a
// suite, a wall or a lane. The four verdicts are one function already, the
// board is one function already, and this is a sort over what they answer.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TARGETS, PROMOTION_FROM } from "./targets.mjs";
import { runAcceptance } from "./acceptance.mjs";
import { runGates } from "./gates.mjs";

/**
 * What each target refuses of the four verdicts. `release` refuses a claim
 * that was true and is not; `main` refuses those and the one a tester is
 * allowed to leave standing, which is the word this whole shape exists to
 * place.
 */
const REFUSES = {
  release: ["regressed", "nothing ran"],
  main: ["not delivered", "regressed", "nothing ran"],
};

const flag = (argv, name) => {
  const at = argv.indexOf(name);
  return at === -1 ? null : (argv[at + 1] ?? null);
};
/** A gate keeps a base as a ref and a person says a branch. Both are read. */
const bare = (ref) =>
  String(ref ?? "")
    .replace(/^origin\//, "")
    .trim();

/**
 * What is being asked: the arguments first, because a gate publishes on this
 * answer and a command that guessed from the checkout would answer
 * differently on a desk. The environment second, because that is where a gate
 * already keeps it. Neither, third, and that is not a failure.
 * @param {string[]} argv @param {Record<string,string|undefined>} [env]
 */
export function asked(argv, env = process.env) {
  // Both readings go through the same stripping: a gate keeps the base as a
  // ref and a person says a branch, and a person who types the ref meant the
  // target. One shape in, one out.
  const into = bare(flag(argv, "--into") ?? env.KAAL_BASE);
  const from = flag(argv, "--from") ?? (env.KAAL_BRANCH ?? "").trim();
  if (!into)
    return {
      why: "no promotion to judge: no target given and none in the environment",
    };
  if (!TARGETS.includes(into))
    return {
      usage: `no such target ${into}: the targets are ${TARGETS.join(" and ")}`,
    };
  return { into, from: from || into };
}

/**
 * One verdict per task, from the suite as it runs now and the record as it
 * stands. The word is `runs.mjs`'s and never this module's.
 * @param {string} root
 */
export function verdicts(root) {
  return runAcceptance([
    join(root, "requirements", "*", "acceptance.test.mjs"),
  ]).results.map((r) => ({ task: r.task ?? r.name, word: r.word }));
}

/**
 * The verdicts a target refuses, each as a finding naming the task and the
 * word, so a reader tells the tester's licence from a claim that broke.
 * @param {{task: string, word: string}[]} list @param {string} into
 */
export function refusedVerdicts(list, into) {
  const refuses = REFUSES[into] ?? [];
  return (list ?? [])
    .filter((v) => refuses.includes(v.word))
    .map((v) => ({ artefact: v.task, kind: "verdict", message: v.word }));
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const matches = (branch, pattern) =>
  new RegExp(`^${pattern.split("*").map(esc).join("[^/]*")}$`).test(branch);

/**
 * A head the target will not take. `main` takes the promotion and nothing
 * else; `release` takes a lane the config holds, and never another target.
 * @param {string} into @param {string} from @param {string[]} lanes
 */
export function refusedHead(into, from, lanes) {
  const say = (message) => ({ artefact: from, kind: "head", message });
  if (into === "main")
    return from === PROMOTION_FROM
      ? null
      : say(`main takes only ${PROMOTION_FROM}`);
  if (TARGETS.includes(from))
    return say(`${into} takes a lane and not a target`);
  return (lanes ?? []).some((p) => matches(from, p))
    ? null
    : say("no lane holds it");
}

/**
 * The walls that are red, counted whatever the target. A waived wall is not
 * red: a person has signed for it, which is what a waiver is.
 * @param {string} root
 */
export function redWalls(root) {
  const red = (runGates(root).results ?? []).filter((w) => !w.ok && !w.waived);
  return {
    count: red.length,
    findings: red.map((w) => ({
      artefact: w.name,
      kind: "wall",
      message: `red, and ${PROMOTION_FROM} is where that may stand`,
    })),
  };
}

/** The lane patterns the tree declares, or none where it declares nothing. */
const lanesOf = (root) => {
  try {
    const { lanes } = JSON.parse(
      readFileSync(join(root, "kaal.config.json"), "utf8"),
    );
    return (lanes ?? []).map((l) => l.pattern);
  } catch {
    return [];
  }
};

/**
 * Every reason this tree does not reach this target, in one answer. Nothing
 * stops at the first: a gate that did would turn one merge into four.
 * @param {string} root @param {{into: string, from: string}} what
 */
export function promote(root, { into, from }) {
  const board = redWalls(root);
  const head = refusedHead(into, from, lanesOf(root));
  const findings = [
    ...refusedVerdicts(verdicts(root), into),
    ...(head ? [head] : []),
    // A red wall stands below the promotion and never above it.
    ...(into === PROMOTION_FROM ? [] : board.findings),
  ];
  return { into, from, findings, count: findings.length, red: board.count };
}
