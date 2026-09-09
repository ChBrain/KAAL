// Contract test for the drawing status-v2. One seam. Blind to the code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = join(ROOT, "requirements", "status-v2", "fixtures");
const c = (n) => join(F, n, "architecture", "t", "contracts.test.mjs");
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });

test("1. drawing to task record: the directory names the task, and the task's record gives the verdict", () => {
  // Superseded by `a-task-is-delivered-by-its-run`. The seam is unchanged in
  // shape and changed in what it reads: the drawing's directory still names
  // the task, and where that used to buy the task's status line it now buys
  // the task's record. Downstream answers upstream, which is what this seam
  // has always been for.
  const R = join(
    ROOT,
    "requirements",
    "a-task-is-delivered-by-its-run",
    "fixtures",
  );
  const drawing = (fixture, red) => {
    const to = mkdtempSync(join(tmpdir(), "kaal-s2c-"));
    cpSync(join(R, fixture), to, { recursive: true });
    const p = join(to, "architecture", "alpha", "contracts.test.mjs");
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(
      p,
      red
        ? 'import { test } from "node:test";\nimport assert from "node:assert/strict";\ntest("1. the seam holds", () => assert.equal(1, 2, "no"));\n'
        : 'import { test } from "node:test";\ntest("1. the seam holds", () => {});\n',
    );
    return { to, p };
  };
  // A drawing whose task is on record and whose seams hold reads delivered.
  const green = drawing("delivered", false);
  try {
    const r = kaal("contracts", green.p);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /^ok\s+delivered/m, r.stdout);
  } finally {
    rmSync(green.to, { recursive: true, force: true });
  }
  // The same drawing red, against a task on record, is a regression: the
  // record says this passed and the run says it does not.
  const red = drawing("regressed", true);
  try {
    const r = kaal("contracts", red.p);
    assert.equal(r.status, 1, `a regression was not refused: ${r.stdout}`);
    assert.match(r.stdout, /^FAIL\s+regressed/m, r.stdout);
  } finally {
    rmSync(red.to, { recursive: true, force: true });
  }
  // A drawing whose directory names a task that does not exist has no record
  // to read and no requirement either, which is still a finding.
  const orphan = kaal("contracts", c("orphan"));
  assert.equal(orphan.status, 1, `an orphan drawing passed: ${orphan.stdout}`);
});
