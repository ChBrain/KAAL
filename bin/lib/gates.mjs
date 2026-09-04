// The walls as data. Reads the `gates` list from kaal.config.json in the
// given root, runs every wall in order (all of them, even after one fails),
// reads a count where a wall's output carries one, and treats a wall whose
// command cannot run as a failure with its fix hint, never as a skip: silence
// and success must not look alike. A config with no walls is a failure for
// the same reason.
import { readFileSync } from "node:fs";
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
    const r = spawnSync("sh", ["-c", g.command], {
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
    });
  }
  const failed = results.filter((x) => !x.ok).length;
  const ok = gates.length > 0 && failed === 0;
  const lines = results.map(
    (x) =>
      `${x.ok ? "ok  " : "FAIL"} ${x.name}${x.count !== null ? ` (${x.count} passing)` : ""}${x.ok || !x.fix ? "" : `  fix: ${x.fix}`}`,
  );
  const summary =
    gates.length === 0
      ? "red: no walls declared in kaal.config.json"
      : `${ok ? "green" : "red"}: ${gates.length} wall(s), ${failed} failing`;
  return { ok, results, lines, summary };
}
