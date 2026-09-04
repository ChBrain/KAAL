// Acceptance tests for requirement status-v1. One per criterion, numbered to
// match. Surface only: requirement files, the tool as a command, the config.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
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
const fixture = (name) => join(F, name, "acceptance.test.mjs");

test("1. every requirement declares exactly one status, open or closed", () => {
  const dirs = readdirSync(join(ROOT, "requirements")).filter((d) =>
    existsSync(join(ROOT, "requirements", d, "requirement.md")),
  );
  assert.ok(dirs.length >= 1);
  for (const d of dirs) {
    const lines =
      readFileSync(
        join(ROOT, "requirements", d, "requirement.md"),
        "utf8",
      ).match(/^- Status: (open|closed)\s*$/gm) ?? [];
    assert.equal(
      lines.length,
      1,
      `${d}: expected one status line, found ${lines.length}`,
    );
  }
});

test("2. kaal acceptance: closed red fails, open red is reported, open green must close, no status fails", () => {
  const ok = kaal("acceptance", fixture("closed-green"), fixture("open-red"));
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  const lineOf = (name) =>
    ok.stdout.split("\n").find((l) => l.includes(name)) ?? "";
  assert.match(lineOf("open-red"), /\bopen\b/, "open-red not reported open");
  assert.match(
    lineOf("closed-green"),
    /\bclosed\b/,
    "closed-green not reported closed",
  );
  assert.equal(
    kaal("acceptance", fixture("closed-red")).status,
    1,
    "closed red not refused",
  );
  const green = kaal("acceptance", fixture("open-green"));
  assert.equal(green.status, 1, "open and all green not refused");
  assert.match(green.stdout + green.stderr, /close/i);
  assert.equal(
    kaal("acceptance", fixture("no-status")).status,
    1,
    "missing status not refused",
  );
});

test("3. the acceptance wall runs kaal acceptance over the requirements glob", () => {
  const gates = JSON.parse(
    readFileSync(join(ROOT, "kaal.config.json"), "utf8"),
  ).gates;
  const wall = gates.find((g) => g.name === "acceptance");
  assert.ok(wall, "no acceptance wall");
  assert.match(
    wall.command,
    /kaal\.mjs acceptance requirements\/\*\/acceptance\.test\.mjs/,
  );
});

test("4. the board is green while push-v1 is open with its manual step undone", () => {
  const push = readFileSync(
    join(ROOT, "requirements", "push-v1", "requirement.md"),
    "utf8",
  );
  assert.match(push, /^- Status: open$/m, "push-v1 is not open");
  if (!INSIDE) assert.equal(kaal("gates").status, 0, "the board is red");
});
