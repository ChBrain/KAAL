// Units beside `runs.mjs`: the readers that answer whether a record still
// speaks for a case, below the seams a contract reads.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { taskOf, promised } from "./runs.mjs";

test("taskOf reads the two trees a case can answer to, and no other shape", () => {
  // An acceptance case beside its requirement, and a contract case under the
  // drawing whose task the requirement names. Both are `<tree>/<task>/<file>`.
  assert.equal(taskOf("requirements/alpha/acceptance.test.mjs"), "alpha");
  assert.equal(taskOf("architecture/alpha/contracts.test.mjs"), "alpha");
  // A unit sits beside its code and answers to no task, so nothing ever
  // promised it and it can never be a regression.
  assert.equal(taskOf("bin/lib/runs.test.mjs"), null);
  assert.equal(taskOf("skills/analyse/scripts/count.test.mjs"), null);
  // Three segments and the right tree, or nothing. A deeper path under
  // `requirements/` is not a task's own case, and a shallower one names none.
  assert.equal(taskOf("requirements/alpha/deeper/case.test.mjs"), null);
  assert.equal(taskOf("requirements/alpha"), null);
  assert.equal(taskOf(""), null);
  // Windows hands back the same path with the other separator, which is the
  // third time a path crossing a boundary has cost this league a red there.
  assert.equal(taskOf("requirements\\alpha\\acceptance.test.mjs"), "alpha");
});

test("promised answers no for a case no record speaks for", () => {
  const body =
    "import { test } from 'node:test';\ntest('1. it holds', () => {});\n";
  const sha = createHash("sha256").update(body).digest("hex");
  const rec = (task, s) =>
    `# Run: ${task}\n\n- Task: ${task}\n- Suite: requirements/${task}/acceptance.test.mjs\n` +
    `- Ran: 2026-09-13\n- Suite sha: ${s}\n- Passing: 1\n- Failing: 0\n`;
  const root = mkdtempSync(join(tmpdir(), "kaal-promised-"));
  try {
    const put = (rel, text) => {
      const p = join(root, ...rel.split("/"));
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, text);
    };
    for (const n of ["kept", "never", "moved"])
      put(`requirements/${n}/acceptance.test.mjs`, body);
    put("tests/runs/kept.md", rec("kept", sha));
    // A record whose sha is not this suite's: the record is there and does
    // not speak, which is the same answer as no record for a different reason.
    put("tests/runs/moved.md", rec("moved", "0".repeat(64)));
    assert.equal(promised(root, "requirements/kept/acceptance.test.mjs"), true);
    assert.equal(
      promised(root, "requirements/never/acceptance.test.mjs"),
      false,
    );
    assert.equal(
      promised(root, "requirements/moved/acceptance.test.mjs"),
      false,
    );
    // A path with no task behind it, without the reader having to look for a
    // record it could never find.
    assert.equal(promised(root, "bin/lib/anything.test.mjs"), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
