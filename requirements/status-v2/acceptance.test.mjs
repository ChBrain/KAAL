// Acceptance tests for requirement status-v2. One per criterion. Surface
// only: the tool as a command on fixture tasks, the config, the runner.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  cpSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = join(HERE, "fixtures");
const INSIDE = process.env.KAAL_GATES === "1";
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
const c = (name) => join(F, name, "architecture", "t", "contracts.test.mjs");

// Criterion 1 is superseded by `a-task-is-delivered-by-its-run`. A drawing
// was judged by its task's status, which was a field on a page; it is judged
// by its task's record now, which is the same sentence with the declaration
// taken out. Downstream still answers upstream: the wall reads the record of
// the task whose requirement the drawing answers, exactly where it used to
// read that task's status.
test("1. kaal contracts judges each drawing by its task's record", () => {
  const F2 = join(
    ROOT,
    "requirements",
    "a-task-is-delivered-by-its-run",
    "fixtures",
  );
  const drawing = (fixture) => {
    const to = mkdtempSync(join(tmpdir(), "kaal-statusv2-"));
    cpSync(join(F2, fixture), to, { recursive: true });
    const p = join(to, "architecture", "alpha", "contracts.test.mjs");
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(
      p,
      'import { test } from "node:test";\ntest("1. the seam holds", () => {});\n',
    );
    return { to, p };
  };
  // The record is the task's, and the drawing is not beside it. A task on
  // record reads delivered; one with a stale record reads not delivered and
  // neither refuses, because a drawing green against an unproved task is
  // work in progress and not a failure.
  for (const [fixture, word] of [
    ["delivered", "delivered"],
    ["stale", "not delivered"],
  ]) {
    const { to, p } = drawing(fixture);
    try {
      const r = kaal("contracts", p);
      assert.equal(r.status, 0, r.stdout + r.stderr);
      assert.match(
        r.stdout,
        new RegExp(word),
        `${fixture} read as ${r.stdout}`,
      );
    } finally {
      rmSync(to, { recursive: true, force: true });
    }
  }
  // And a regression refuses, which is the half that has teeth: the record
  // says this suite passed and the run says it does not.
  const { to, p } = drawing("regressed");
  try {
    writeFileSync(
      p,
      'import { test } from "node:test";\nimport assert from "node:assert/strict";\n' +
        'test("1. the seam holds", () => assert.equal(1, 2, "it does not"));\n',
    );
    assert.equal(
      kaal("contracts", p).status,
      1,
      "a regression was not refused",
    );
  } finally {
    rmSync(to, { recursive: true, force: true });
  }
});

test("2. the contracts wall runs kaal contracts over the contracts glob", () => {
  const wall = JSON.parse(
    readFileSync(join(ROOT, "kaal.config.json"), "utf8"),
  ).gates.find((g) => g.name === "contracts");
  assert.ok(wall, "no contracts wall");
  assert.match(
    wall.command,
    /kaal\.mjs contracts architecture\/\*\/contracts\.test\.mjs/,
  );
});

test("3. the board is green with three open drawings present", () => {
  for (const t of ["eval-record-v1", "agent-v1", "security-v1"])
    assert.ok(
      existsSync(join(ROOT, "architecture", t, "contracts.test.mjs")),
      `${t}: no drawing`,
    );
  if (!INSIDE) assert.equal(kaal("gates").status, 0, "the board is red");
});
