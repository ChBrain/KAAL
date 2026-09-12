// The acceptance wall with a report. Nobody writes down whether a task was
// delivered: the run just made and the run on record say so between them, in
// one of four words. Regressed and nothing ran are failures; delivered and
// not delivered are answers. Each test file runs under caseEnv, so the
// verdict depends neither on the caller nor on the target this tree is
// judged by: a case builds its own tree and asks about that one.
//
// A drawing's verdict is its task's. That is not a special case bolted on:
// the wall that judged drawings has always read the requirement whose task
// the drawing answers, because downstream answers upstream and a seam proved
// belongs to the task whose criteria it serves.
import { readFileSync, existsSync, globSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { spawnSync } from "node:child_process";
import { caseEnv } from "./gates.mjs";
import { blocked } from "./bugs.mjs";
import { readRun, verdict } from "./runs.mjs";

/**
 * The label a reader of the board sees, from a verdict and the people line.
 * The people question is unchanged and is still presence and never meaning:
 * a Handoff that does not say whether a task touches a person has not
 * answered a standing question.
 * @returns {{ ok: boolean, label: string }}
 */
export function judge(v, people = "none") {
  if (people === null)
    return {
      ok: false,
      label:
        "FAIL no people line: write `- People: none` or the data in the Handoff",
    };
  return { ok: v.ok, label: `${v.ok ? "ok  " : "FAIL"} ${v.word}` };
}

/**
 * The requirement a test file belongs to, resolved once for both walls: an
 * acceptance test's sibling, a drawing's task under requirements/<task>/.
 * @param {string} testFile @returns {string}
 */
export function requirementFor(testFile) {
  const dir = dirname(testFile);
  if (basename(dirname(dir)) === "architecture")
    return join(
      dir,
      "..",
      "..",
      "requirements",
      basename(dir),
      "requirement.md",
    );
  return join(dir, "requirement.md");
}

/**
 * The People line of the test's requirement: its value, or null when the
 * requirement has none. The wall reads that the line is there and says
 * something; what it says is the analyst's.
 * @param {string} testFile @returns {string|null}
 */
export function readPeople(testFile) {
  const req = requirementFor(testFile);
  if (!existsSync(req)) return null;
  const m = readFileSync(req, "utf8").match(/^- People: (.+)$/m);
  return m ? m[1].trim() : null;
}

/** A drawing's status is its task's: architecture/<task>/ reads requirements/<task>/requirement.md. */
/**
 * The commands expand their own globs: a shell may hand them over expanded
 * (sh) or not (cmd.exe), and the files must be the same, in the same order.
 * @param {string[]} patterns @returns {string[]}
 */
export function expand(patterns, at = process.cwd()) {
  return patterns.flatMap((p) =>
    /[*?[]/.test(p) ? globSync(p, { cwd: at }).sort() : [p],
  );
}

/** @param {string[]} files @param {string} [at] */
export function runAcceptance(files, at) {
  return runJudged(files, at);
}

/** @param {string[]} files @param {string} [at] */
export function runContracts(files, at) {
  return runJudged(files, at);
}

/** One judged runner for both walls: the verdict table lives once. */
export function runJudged(files, at = process.cwd()) {
  const results = [];
  // The tree these files sit in, honoured all the way down: the glob is
  // expanded against it and every case is run in it. A runner handed a root
  // and a relative path that looked in the caller's directory would find
  // nothing and answer nothing passing, which reads as a counting bug rather
  // than a path one. It cannot be called `root`: that name is bound below to
  // the tree a requirement's own path resolves to.
  const held = blocked(at);
  for (const file of expand(files, at)) {
    // A case a standing bug is about is not run here. That is not a skip: the
    // red is recorded, owned and named on the board, and this is the tree
    // declining to ask a question whose answer is already written down.
    if (held.has(file)) {
      results.push({ blocked: file });
      continue;
    }
    // The reporter is named and not inherited: node 22 prints TAP when this
    // output is piped and node 24 prints spec, both by default and both
    // correctly, and the two patterns below read one of them. `caseEnv`
    // clears any reporter from the environment, because a named one does not
    // beat an inherited one, it joins it and node then refuses the pair.
    const r = spawnSync(
      process.execPath,
      ["--test", "--test-reporter=tap", file],
      {
        cwd: at,
        encoding: "utf8",
        env: caseEnv(),
        stdio: ["ignore", "pipe", "inherit"],
      },
    );
    // A file that declares no test at all is reported by the runner as one
    // passing test named for the file itself: `ok 1 - alpha.test.mjs`. That
    // is a suite whose tests were deleted reading as green, so it counts as
    // nothing having run, which is what it is.
    // The runner names it by the file it ran, and the two platforms do not
    // agree on how a path is written, so the comparison is on the last
    // segment alone. Comparing whole paths passed on one runtime and failed
    // on the other, which is the third time a path crossing a boundary has
    // cost this league a red on Windows only.
    const tail = (p) => String(p).replaceAll("\\", "/").split("/").pop();
    const named = [...r.stdout.matchAll(/^ok \d+ - (.+)$/gm)].map((m) =>
      m[1].trim(),
    );
    const empty = named.length === 1 && tail(named[0]) === tail(file);
    const pass = empty ? 0 : Number(r.stdout.match(/^# pass (\d+)/m)?.[1] ?? 0);
    const fail = Number(
      r.stdout.match(/^# fail (\d+)/m)?.[1] ?? (r.status === 0 ? 0 : 1),
    );
    // The task this suite answers to, and the root it lives in. A drawing's
    // suite resolves to its requirement, which is where its record is.
    const req = requirementFor(file);
    const task = basename(dirname(req));
    const root = join(dirname(req), "..", "..");
    const reported = verdict(root, readRun(root, task), pass, fail, task);
    const v = judge(reported, readPeople(file));
    // The red tests by name, so a reader of the board elsewhere sees which
    // criterion failed and not only that one did.
    const red = r.stdout.match(/^not ok .*$/gm) ?? [];
    results.push({
      name: basename(dirname(file)),
      word: reported.word,
      why: reported.why,
      pass,
      fail,
      red,
      ...v,
    });
  }
  // The entries that were judged. A blocked case carries no verdict, no
  // counts and no label: the four words are about a suite against its record
  // and none of them is about a case nobody ran. Counting it as passing is
  // the vacuous green this league has a task about, and counting it as
  // failing reports the red the board already names, which is the point of
  // filing a bug undone.
  const judged = results.filter((x) => !x.blocked);
  const ok = results.length > 0 && judged.every((x) => x.ok);
  const lines = results.flatMap((x) =>
    x.blocked
      ? [`not run          ${x.blocked}: a standing bug blocks it`]
      : [
          `${x.label.padEnd(16)} ${x.name} (${x.pass} passing, ${x.fail} failing)` +
            // Why, where the verdict has one. A task reading not delivered
            // because its record is stale and one reading not delivered
            // because nobody has recorded it are the same word and different
            // work, and the reader needs to know which.
            (x.why ? `: ${x.why}` : ""),
          ...(x.ok && !x.fail ? [] : x.red.map((l) => `  ${l}`)),
        ],
  );
  const summary =
    results.length === 0
      ? "red: no requirement files given"
      : `${ok ? "green" : "red"}: ${judged.length} requirement(s), ${judged.filter((x) => !x.ok).length} failing`;
  // The count the board reads: the runner's own convention, `# pass N`, N the
  // tests that passed across every file run, printed last by the commands.
  const passed = judged.reduce((n, x) => n + x.pass, 0);
  return { ok, results, lines, summary, passed };
}
