// Acceptance test for requirement a-skill-list-is-a-floor. One criterion,
// one test. Surface only: the suite that reads the list, run against two
// trees, one with a skill more and one with a skill fewer.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  cpSync,
  rmSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CASE = join("requirements", "skills-v1", "acceptance.test.mjs");
/**
 * The environment a nested `node --test` needs. Under `node --test` the
 * runner puts NODE_TEST_CONTEXT in the environment of every test file, and a
 * child inheriting it decides it is already inside a run and skips the files
 * it was given. It then exits 0 with no counts, which reads exactly like a
 * clean tree.
 */
const child = () => {
  const env = { ...process.env, KAAL_BRANCH: "", KAAL_BASE: "" };
  delete env.NODE_TEST_CONTEXT;
  return env;
};
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;

/** A copy of this tree's skills and the suite that reads them, run in place. */
const copy = (fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-floor-"));
  try {
    // retros/ is here because criterion 9 reads it. A copy missing what the
    // suite reads answers a finding about the copy, and this criterion would
    // then be red for a reason that has nothing to do with the list.
    for (const d of ["skills", "requirements", "bin", "kaal", "retros"])
      cpSync(join(ROOT, d), join(root, d), { recursive: true });
    for (const f of ["kaal.config.json", "package.json", "AGENTS.md"])
      cpSync(join(ROOT, f), join(root, f));
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
const run = (root) =>
  spawnSync(
    process.execPath,
    ["--test", "--test-reporter=tap", join(root, CASE)],
    {
      encoding: "utf8",
      cwd: root,
      env: child(),
    },
  );
/**
 * How many of the child's tests failed. A run that printed no count at all
 * did not answer the question, and reading that as zero is how a suite that
 * never ran passes: so it is a finding here and never a number.
 */
const failing = (r) => {
  const m = said(r).match(/^# fail (\d+)/m);
  assert.ok(m, `the run printed no count: ${said(r)}`);
  return Number(m[1]);
};

test("1. adding a skill is not a finding and removing one is", () => {
  const here = readdirSync(join(ROOT, "skills"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  // Counted before either half, because a tree with no skills would make
  // both of them true for the wrong reason.
  assert.ok(here.length >= 2, `skills/ holds ${here.length}`);

  // One more than the league has named. A skill that obeys the rules and
  // nobody wrote down is growth, and growth is not a finding.
  copy((root) => {
    const added = join(root, "skills", "zzz-extra");
    cpSync(join(root, "skills", here[0]), added, { recursive: true });
    // It has to be a skill and not a directory. A copy still claiming the
    // name it was copied from is refused by the standard, and this criterion
    // would then be red about the stand-in rather than about the list.
    const page = join(added, "SKILL.md");
    writeFileSync(
      page,
      readFileSync(page, "utf8").replace(/^name: .*$/m, "name: zzz-extra"),
    );
    const r = run(root);
    assert.equal(
      failing(r),
      0,
      `a skill the list does not name was a finding: ${said(r)}`,
    );
  });

  // One fewer. A skill going missing is a real loss and nothing else in the
  // tree would notice it, which is the half the closed criterion had right.
  copy((root) => {
    const gone = here[0];
    rmSync(join(root, "skills", gone), { recursive: true, force: true });
    const r = run(root);
    assert.ok(
      failing(r) > 0,
      `a skill went missing and nothing said so: ${said(r)}`,
    );
    assert.ok(
      said(r).includes(gone),
      `the finding does not name the skill that is gone: ${said(r)}`,
    );
  });
});
