// The walls as data. Reads the `gates` list from kaal.config.json in the
// given root, runs every wall in order (all of them, even after one fails),
// reads a count where a wall's output carries one, and treats a wall whose
// command cannot run as a failure with its fix hint, never as a skip: silence
// and success must not look alike. A config with no walls is a failure for
// the same reason.
import { readFileSync, existsSync } from "node:fs";
import { parseFrontmatter } from "./frontmatter.mjs";
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
    const count = (r.stdout ?? "").match(/^# pass (\d+)/m)?.[1];
    results.push({
      name: g.name,
      ok: r.status === 0,
      count: count === undefined ? null : Number(count),
      fix: g.fix ?? null,
      status: r.status,
      output: (r.stdout ?? "").split(/\r?\n/).filter((l) => l.trim()),
    });
  }
  let waived = 0;
  for (const x of results) {
    const { waiver, reason } = readWaiver(root, x.name);
    if (!waiver && !reason) continue;
    if (x.ok) {
      x.unused = true;
      continue;
    }
    if (waiver) {
      x.waived = waiver;
      waived++;
    } else x.waiverNote = reason;
  }
  const failed = results.filter((x) => !x.ok && !x.waived).length;
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
            `${x.ok ? "ok  " : "FAIL"} ${x.name}${x.count !== null ? ` (${x.count} passing)` : ""}${x.ok || !x.fix ? "" : `  fix: ${x.fix}`}${x.waiverNote ? `  [${x.waiverNote}]` : ""}`,
            ...(x.ok ? [] : x.output.map((l) => `  ${l}`)),
          ],
  );
  const summary =
    gates.length === 0
      ? "red: no walls declared in kaal.config.json"
      : `${ok ? "green" : "red"}: ${gates.length} wall(s), ${failed} failing, ${waived} waived`;
  return { ok, results, lines, summary };
}
