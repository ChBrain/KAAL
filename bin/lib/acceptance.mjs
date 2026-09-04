// The acceptance wall with a status. Every requirement says in its Handoff
// whether it is open or closed. A closed requirement's red test is a failure.
// An open requirement's red tests are its analyst's red run: reported, never
// failed. An open requirement with no red test is done and must be closed,
// so that is a failure too. A requirement with no status is a failure. Each
// test file runs under wallEnv, so the verdict does not depend on the caller.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { spawnSync } from "node:child_process";
import { wallEnv } from "./gates.mjs";

/** @param {string} testFile @returns {"open"|"closed"|null} */
export function readStatus(testFile) {
  const req = join(dirname(testFile), "requirement.md");
  if (!existsSync(req)) return null;
  const m = readFileSync(req, "utf8").match(/^- Status: (open|closed)\s*$/gm);
  return m && m.length === 1 ? m[0].replace(/^- Status: /, "").trim() : null;
}

/** @returns {{ ok: boolean, label: string }} */
export function judge(status, pass, fail, mustClose = true) {
  if (status === null)
    return {
      ok: false,
      label:
        "FAIL no status: write `- Status: open` or `- Status: closed` in the Handoff",
    };
  if (status === "closed")
    return fail > 0
      ? { ok: false, label: "FAIL closed" }
      : { ok: true, label: "ok   closed" };
  if (fail > 0 || !mustClose) return { ok: true, label: "open" };
  return { ok: false, label: "FAIL open and all green: close it" };
}

/** A drawing's status is its task's: architecture/<task>/ reads requirements/<task>/requirement.md. */
export function statusForDrawing(testFile) {
  const task = basename(dirname(testFile));
  const root = join(dirname(testFile), "..", "..");
  return readStatus(join(root, "requirements", task, "acceptance.test.mjs"));
}

/** @param {string[]} files */
export function runAcceptance(files) {
  return runJudged(files, readStatus);
}

/** @param {string[]} files */
export function runContracts(files) {
  return runJudged(files, statusForDrawing, false);
}

/** One judged runner for both walls: the verdict table lives once. */
export function runJudged(files, statusFor, mustClose = true) {
  const results = [];
  for (const file of files) {
    const r = spawnSync("node", ["--test", file], {
      encoding: "utf8",
      env: wallEnv(),
      stdio: ["ignore", "pipe", "inherit"],
    });
    const pass = Number(r.stdout.match(/^# pass (\d+)/m)?.[1] ?? 0);
    const fail = Number(
      r.stdout.match(/^# fail (\d+)/m)?.[1] ?? (r.status === 0 ? 0 : 1),
    );
    const status = statusFor(file);
    const v = judge(status, pass, fail, mustClose);
    results.push({ name: basename(dirname(file)), status, pass, fail, ...v });
  }
  const ok = results.length > 0 && results.every((x) => x.ok);
  const lines = results.map(
    (x) =>
      `${x.label.padEnd(12)} ${x.name} (${x.pass} passing, ${x.fail} failing)`,
  );
  const summary =
    results.length === 0
      ? "red: no requirement files given"
      : `${ok ? "green" : "red"}: ${results.length} requirement(s), ${results.filter((x) => !x.ok).length} failing`;
  return { ok, results, lines, summary };
}
