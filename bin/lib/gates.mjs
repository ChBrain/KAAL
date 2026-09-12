// The walls as data. Reads the `gates` list from kaal.config.json in the
// given root, runs every wall in order (all of them, even after one fails),
// reads a count where a wall's output carries one, and treats a wall whose
// command cannot run as a failure with its fix hint, never as a skip: silence
// and success must not look alike. A config with no walls is a failure for
// the same reason.
import { readFileSync, existsSync } from "node:fs";
import { parseFrontmatter } from "./frontmatter.mjs";
import { standing } from "./bugs.mjs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// A wall's environment is the caller's minus the test runner's own marker:
// node's test runner sets NODE_TEST_CONTEXT in every child it spawns, and a
// nested `node --test` that inherits it reports green whatever happened. The
// runner's verdict must not depend on who called it.
// It also carries the runner's own marker, KAAL_GATES=1, so a wall that would
// otherwise start the runner again (an acceptance test proving that npm test
// is the runner) can see it is already inside one and not recurse.
export function wallEnv(base = process.env) {
  const env = { ...base, KAAL_GATES: "1" };
  delete env.NODE_TEST_CONTEXT;
  // And any reporter the caller named. A wall that names its own format on
  // the command line does not override one in NODE_OPTIONS: node collects
  // both and then refuses the pair, because reporters and destinations must
  // match in number. So it goes for the same reason the marker goes, and
  // whatever else the caller put there stays.
  if (env.NODE_OPTIONS) {
    const kept = env.NODE_OPTIONS.split(/\s+/).filter(
      (a) => a && !a.startsWith("--test-reporter"),
    );
    if (kept.length) env.NODE_OPTIONS = kept.join(" ");
    else delete env.NODE_OPTIONS;
  }
  return env;
}

// A case's environment is a wall's minus the target this tree is judged by.
// A wall is about this tree and is told its target so it never guesses one,
// which is why `wallEnv` keeps it; a case builds a tree of its own in a
// scratch directory and asks the engine about that one, so the same variable
// reaching it is an answer to a question it never asked. Where the case spawns
// a board, KAAL_BASE decides whether that board's redness is binding, so an
// inherited one silently changes the exit code the case is asserting about.
// It is the same sentence the marker above carries: a nested run must not
// inherit the runner's own declaration. A case that wants a target sets one.
export function caseEnv(base = process.env) {
  const env = wallEnv(base);
  delete env.KAAL_BASE;
  return env;
}

// A waiver is a human's act, recorded: waivers/<wall>.md with wall, who, why
// and until. It never hides a red: the wall still runs and its line says
// waived, with who and why; an expired or incomplete waiver counts for
// nothing and the reason is printed beside the FAIL.
export const WAIVER_FIELDS = ["wall", "who", "why", "until"];

/** @returns {{ waiver: Record<string,string>|null, reason: string|null }} */
export function readWaiver(root, wall) {
  const p = join(root, "waivers", wall + ".md");
  if (!existsSync(p)) return { waiver: null, reason: null };
  let data;
  try {
    data = parseFrontmatter(readFileSync(p, "utf8")).data;
  } catch (e) {
    return { waiver: null, reason: `waiver unreadable: ${e.message}` };
  }
  const missing = WAIVER_FIELDS.find((k) => !data[k]);
  if (missing) return { waiver: null, reason: `waiver missing ${missing}` };
  if (data.wall !== wall)
    return { waiver: null, reason: `waiver names another wall (${data.wall})` };
  if (data.until < new Date().toISOString().slice(0, 10))
    return { waiver: null, reason: `waiver expired ${data.until}` };
  return { waiver: data, reason: null };
}

/**
 * @param {string} root
 * @param {{ gates?: {name: string, command: string, fix?: string}[] } | null} config override, for tests
 */
export function runGates(root, config = null) {
  const gates =
    (config ?? JSON.parse(readFileSync(join(root, "kaal.config.json"), "utf8")))
      .gates ?? [];
  const results = [];
  for (const g of gates) {
    // Node's own shell mode: /bin/sh by path on POSIX, cmd.exe on Windows.
    // The runner names no shell, so the board reads the same on both.
    const r = spawnSync(g.command, {
      shell: true,
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
      env: wallEnv(),
    });
    // Either shape the runtime prints: `# pass N` from TAP, `\u2139 pass N`
    // from spec. This side reads rather than names, because the command is
    // whoever wrote the config's and not ours to pin, and because a count
    // here is printed and never decides a verdict.
    const count = (r.stdout ?? "").match(/^(?:#|\u2139) pass (\d+)/m)?.[1];
    results.push({
      name: g.name,
      ok: r.status === 0,
      // The third answer. This engine publishes three exit codes as the whole
      // vocabulary and 2 is `the question is not this tree's`: a wall that
      // said it is a wall that declined to judge, which is the opposite act
      // from one that could not start. Read from the code alone, because the
      // code is the only language the board and its walls share, and a field
      // beside the gate would put the pairing back in the governance lane.
      //
      // Everything that is not 0 and not 2 is a failure without being asked
      // about, so a command that cannot run lands there on its own: silence
      // and success must not look alike, which is `gates-v1`'s claim.
      declined: r.status === 2,
      count: count === undefined ? null : Number(count),
      fix: g.fix ?? null,
      // A wall whose output is the answer says so, and the board carries its
      // line whether or not it refused. A wall that cannot fail is a report,
      // and a board that only speaks when refused cannot carry one.
      show: g.show === true,
      status: r.status,
      output: (r.stdout ?? "").split(/\r?\n/).filter((l) => l.trim()),
    });
  }
  let waived = 0;
  for (const x of results) {
    const { waiver, reason } = readWaiver(root, x.name);
    if (!waiver && !reason) continue;
    // A waiver is a human's act over a red, and a wall that declined has no
    // red to waive any more than one that passed does. Spending it here would
    // consume a person's licence on nothing and make the count of waived
    // walls wrong in the direction that flatters, which is the number a
    // reader uses to judge how much is being let through.
    if (x.ok || x.declined) {
      x.unused = true;
      continue;
    }
    if (waiver) {
      x.waived = waiver;
      waived++;
    } else x.waiverNote = reason;
  }
  const failed = results.filter(
    (x) => !x.ok && !x.waived && !x.declined,
  ).length;
  const ok = gates.length > 0 && failed === 0;
  // A failing wall's own lines follow its FAIL line, indented: a reader of
  // the board elsewhere (a log, a pull request) must see what the wall saw,
  // or six FAILs read as six defects.
  const lines = results.flatMap((x) =>
    x.unused
      ? [`unused waiver ${x.name}: the wall is green`]
      : x.waived
        ? [
            `waived ${x.name} by ${x.waived.who}: ${x.waived.why} (until ${x.waived.until})`,
          ]
        : [
            // Its own word, and no fix hint: there is nothing to fix, and a
            // hint here would read as work somebody owes.
            x.declined
              ? `n/a  ${x.name}`
              : `${x.ok ? "ok  " : "FAIL"} ${x.name}${x.count !== null ? ` (${x.count} passing)` : ""}${x.ok || !x.fix ? "" : `  fix: ${x.fix}`}${x.waiverNote ? `  [${x.waiverNote}]` : ""}`,
            ...(x.show && x.ok ? x.output.map((l) => `  ${l}`) : []),
            // What the wall said follows it, as a failing wall's does. A word
            // with no reason is a state a reader has to guess at, and the
            // reason a wall declines is the only thing that makes it readable.
            ...(x.ok && !x.declined ? [] : x.output.map((l) => `  ${l}`)),
          ],
  );
  // A standing bug is never a licence. Read here and not as a wall of its
  // own, because a wall can be waived and a bug may not be: the board does
  // not answer green whatever every wall on it says, which a gate could not
  // promise, since a gate makes the board red only by being red itself.
  //
  // The count is printed in the summary rather than left implicit, because
  // the sentence a reader has trusted since the board was built now has a
  // fourth term and a silent one would be worse than a longer line.
  // Counted for the sentence below, because the summary a reader has trusted
  // since this board was built now has a term it did not have, and a silent
  // one would be worse than a longer line.
  const declined = results.filter((x) => x.declined).length;
  const bugs = standing(root);
  lines.push(...bugs);
  const clear = ok && bugs.length === 0;
  const summary =
    gates.length === 0
      ? "red: no walls declared in kaal.config.json"
      : `${clear ? "green" : "red"}: ${gates.length} wall(s), ${failed} failing, ${waived} waived${declined ? `, ${declined} not applicable` : ""}${bugs.length ? `, ${bugs.length} blocked` : ""}`;
  return { ok: clear, results, lines, summary };
}
