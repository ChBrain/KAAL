// Contract tests for the drawing push-v1. One per seam, numbered to match.
// Blind to the code: each drives the tool as a command on a fixture root and
// reads exit code, stdout, stderr. Nothing is imported from bin/.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = join(HERE, "fixtures");
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });

test("1. shell to tool: exit codes, findings on stderr, usage on an unknown command", () => {
  const bad = kaal("no-such-command");
  assert.equal(bad.status, 1);
  assert.ok(/usage/i.test(bad.stdout + bad.stderr), "no usage printed");
  const ok = kaal("ledger", join(F, "ledger"));
  assert.equal(ok.status, 0, ok.stderr);
  assert.ok(ok.stdout.trim().length > 0, "no summary on stdout");
  assert.equal(ok.stderr.trim(), "", "findings on stderr for a clean root");
});

test("2. ledger to tool: rung-relative paths resolve, a human move needs nothing", () => {
  const r = kaal("ledger", join(F, "ledger"));
  assert.equal(r.status, 0, r.stderr);
  // The same root with the script test removed must be refused: the script
  // rung's paths are read relative to the skill.
  const broken = spawnSync(
    "sh",
    [
      "-c",
      `cp -r "${join(F, "ledger")}" "$TMPDIR/l" && rm "$TMPDIR/l/skills/good/scripts/ok.test.mjs" && node "${join(ROOT, "bin", "kaal.mjs")}" ledger "$TMPDIR/l"; s=$?; rm -rf "$TMPDIR/l"; exit $s`,
    ],
    {
      encoding: "utf8",
      env: { ...process.env, TMPDIR: process.env.TMPDIR ?? "/tmp" },
    },
  );
  assert.equal(broken.status, 1, "missing script test not refused");
  assert.ok(
    /a scripted move/.test(broken.stderr),
    "finding does not name the move",
  );
});

test("3. eval record to tool: only pass with the current sha counts, a record without sha counts for nothing", () => {
  // gamma.md has no skill_sha; the root still passes because alpha and beta are fresh.
  assert.equal(kaal("ledger", join(F, "ledger")).status, 0);
  // Remove beta: gamma must not stand in for it.
  const r = spawnSync(
    "sh",
    [
      "-c",
      `cp -r "${join(F, "ledger")}" "$TMPDIR/e" && rm "$TMPDIR/e/evals/good/f/beta.md" && node "${join(ROOT, "bin", "kaal.mjs")}" ledger "$TMPDIR/e"; s=$?; rm -rf "$TMPDIR/e"; exit $s`,
    ],
    {
      encoding: "utf8",
      env: { ...process.env, TMPDIR: process.env.TMPDIR ?? "/tmp" },
    },
  );
  assert.equal(r.status, 1, "a record without skill_sha was counted");
  assert.ok(/a skilled move/.test(r.stderr), "finding does not name the move");
});

test("4. skill directory to rules: one finding per broken rule, naming skill and rule", () => {
  const r = kaal("check", join(F, "rules"));
  assert.equal(r.status, 1);
  for (const [skill, rule] of [
    ["broken-name", "name"],
    ["vendor", "vendor"],
    ["dash", "dash"],
  ])
    assert.ok(
      new RegExp(`${skill}.*\\b${rule}\\b`).test(r.stderr),
      `no finding for ${skill} naming ${rule}`,
    );
});

test("5. retros to count: consumed and archived retros are not counted", () => {
  const r = spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), "retros"], {
    cwd: join(F, "retros-root"),
    encoding: "utf8",
  });
  assert.equal(r.status, 0, r.stderr);
  const line = (s) => r.stdout.split("\n").find((l) => l.startsWith(s + ":"));
  assert.ok(
    line("a") && /\b1\b/.test(line("a")),
    `a: expected 1, got ${line("a")}`,
  );
  assert.ok(
    line("b") && /\b0\b/.test(line("b")),
    `b: expected 0, got ${line("b")}`,
  );
});
