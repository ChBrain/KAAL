// Acceptance tests for requirement status-v2. One per criterion. Surface
// only: the tool as a command on fixture tasks, the config, the runner.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
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

test("1. kaal contracts judges each drawing by its task's status", () => {
  const ok = kaal("contracts", c("open-red"));
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(
    ok.stdout.split("\n").find((l) => l.includes("t (")) ?? "",
    /\bopen\b/,
  );
  assert.equal(
    kaal("contracts", c("closed-red")).status,
    1,
    "closed red not refused",
  );
  assert.equal(
    kaal("contracts", c("open-green")).status,
    0,
    "an open task's green drawing was refused",
  );
  assert.equal(
    kaal("contracts", c("orphan")).status,
    1,
    "a drawing with no requirement not refused",
  );
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
