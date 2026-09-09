// Whether a task was delivered, read from the run just made and the run on
// record. Nothing here declares anything, and no wall writes: recording is an
// act of the seat that proves, and a wall only reads.
//
// The four verdicts are the whole of it. Three of them a run answers on its
// own; the fourth needs a record, because a red suite is a regression if it
// ever passed and an unbuilt task if it never did, and a run just made cannot
// tell those apart.
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  globSync,
} from "node:fs";
import { join, dirname, posix } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { wallEnv } from "./gates.mjs";

/** The fields a record carries, as they are written and as they are read. */
const FIELDS = {
  Task: "task",
  Suite: "suite",
  Ran: "ran",
  "Suite sha": "sha",
  Passing: "passing",
  Failing: "failing",
};
/** A record is a page in the tester's lane, one per task. */
export const runPath = (task) => posix.join("tests", "runs", `${task}.md`);
/** The suite a task's record is about. */
export const suiteOf = (task) =>
  posix.join("requirements", task, "acceptance.test.mjs");
const shaOf = (p) =>
  existsSync(p)
    ? createHash("sha256").update(readFileSync(p)).digest("hex")
    : null;

/**
 * A task's record as its named fields, null where there is none, and an
 * object carrying `why` where the page is there and a field is not. Three
 * answers and not two: a record nobody wrote and a record somebody spoiled
 * are different things to a reader and to a wall.
 * @param {string} root @param {string} task
 */
export function readRun(root, task) {
  const p = join(root, runPath(task));
  if (!existsSync(p)) return null;
  const text = readFileSync(p, "utf8");
  const out = {};
  for (const [label, key] of Object.entries(FIELDS)) {
    const v = text.match(new RegExp(`^- ${label}: (.+)$`, "m"))?.[1]?.trim();
    if (!v) return { why: `the record names no ${label}` };
    out[key] = /^\d+$/.test(v) ? Number(v) : v;
  }
  return out;
}

/**
 * Is this record about the suite as it stands? Read from the sha of the file
 * and never from a date: a date says when somebody ran something, and the
 * question is whether they ran this.
 */
export const isFresh = (root, run) =>
  Boolean(
    run &&
    !run.why &&
    run.suite &&
    run.sha &&
    shaOf(join(root, run.suite)) === run.sha,
  );

/**
 * One of four words, and whether it fails. A stale record is no record, so a
 * red run carrying one is not delivered and says so; treating it as evidence
 * would make every unfinished task a regression, which is a lie in the
 * direction of alarm.
 * @returns {{ word: string, ok: boolean, why?: string }}
 */
export function verdict(root, run, pass, fail) {
  if (pass === 0 && fail === 0)
    return {
      word: "nothing ran",
      ok: false,
      why: "the suite ran no test at all",
    };
  const fresh = isFresh(root, run);
  const stale = Boolean(run && !fresh);
  const staleWhy = "the record is stale: its suite has changed since";
  if (fail > 0)
    return fresh
      ? {
          word: "regressed",
          ok: false,
          why: "a run on record passed this suite",
        }
      : { word: "not delivered", ok: true, why: stale ? staleWhy : undefined };
  return fresh
    ? { word: "delivered", ok: true }
    : {
        word: "not delivered",
        ok: true,
        why: stale ? staleWhy : "green, and no run has recorded it yet",
      };
}

/**
 * Record every acceptance suite that is green now, and nothing else. A red
 * suite and a suite that ran nothing leave no record, because a record is
 * evidence of a pass and there was none. Removes nothing: a record of a run
 * that happened stays true about the run that happened.
 * @param {string} root @returns {string[]} the tasks recorded
 */
export function writeRuns(root) {
  const written = [];
  for (const rel of globSync("requirements/*/acceptance.test.mjs", {
    cwd: root,
  })) {
    const path = String(rel).replaceAll("\\", "/");
    const task = path.split("/")[1];
    const r = spawnSync(
      process.execPath,
      ["--test", "--test-reporter=tap", join(root, path)],
      {
        encoding: "utf8",
        env: wallEnv(),
        stdio: ["ignore", "pipe", "inherit"],
      },
    );
    const pass = Number(r.stdout.match(/^# pass (\d+)/m)?.[1] ?? 0);
    const fail = Number(
      r.stdout.match(/^# fail (\d+)/m)?.[1] ?? (r.status === 0 ? 0 : 1),
    );
    if (fail > 0 || pass === 0) continue;
    const p = join(root, runPath(task));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(
      p,
      `# Run: ${task}\n\n- Task: ${task}\n- Suite: ${suiteOf(task)}\n` +
        `- Ran: ${new Date().toISOString().slice(0, 10)}\n` +
        `- Suite sha: ${shaOf(join(root, path))}\n` +
        `- Passing: ${pass}\n- Failing: ${fail}\n`,
    );
    written.push(task);
  }
  return written.sort();
}
