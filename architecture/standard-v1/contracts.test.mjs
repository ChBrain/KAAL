// Contract tests for the drawing standard-v1. One per seam. Blind to the
// code: the tool as a command, the workflow's text, the config.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FX = join(ROOT, "requirements", "standard-v1", "fixtures");
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });

test("1. frontmatter to mirror: three refusals by name, one acceptance, one finding each", () => {
  const r = kaal(["check", join(FX, "fields")]);
  const lines = r.stderr.trim().split("\n").filter(Boolean);
  assert.deepEqual(
    lines.map((l) => l.split(": ").slice(0, 2).join(": ")).sort(),
    [
      "compat-long: compatibility",
      "metadata-flat: metadata",
      "tools-empty: allowed-tools",
    ],
  );
});

test("2. tree to validator: the standard job installs at the config's commit, validates skills/*/, and the workflow has a schedule", () => {
  const ci = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
  const cfg = JSON.parse(
    readFileSync(join(ROOT, "kaal.config.json"), "utf8"),
  ).standard;
  assert.match(cfg?.validator?.ref ?? "", /^[0-9a-f]{40}$/);
  const job =
    ci.match(/^ {2}standard:\n([\s\S]*?)(?=^ {2}\S|(?![\s\S]))/m)?.[1] ?? "";
  assert.ok(
    job.includes(`@${cfg.validator.ref}#subdirectory=skills-ref`),
    "not the pinned validator",
  );
  assert.match(job, /skills-ref validate/);
  assert.match(job, /node bin\/kaal\.mjs standard/);
  assert.match(ci, /^\s*schedule:/m);
});

test("3. pin to live text: unchanged exits 0, drift exits 1 with both hashes, and the config is untouched", () => {
  const cwd = join(FX, "spec");
  const before = readFileSync(join(cwd, "kaal.config.json"), "utf8");
  const same = kaal(["standard", "spec.txt"], cwd);
  assert.equal(same.status, 0, same.stdout + same.stderr);
  assert.match(same.stdout, /^standard: .*unchanged/m);
  const moved = kaal(["standard", "drift.txt"], cwd);
  assert.equal(moved.status, 1);
  assert.match(moved.stderr, /^standard: .*drift/m);
  const hashes = moved.stderr.match(/[0-9a-f]{64}/g) ?? [];
  assert.equal(hashes.length, 2);
  assert.ok(
    hashes.includes(JSON.parse(before).standard.spec.sha256),
    "the pinned hash is not named",
  );
  assert.equal(
    readFileSync(join(cwd, "kaal.config.json"), "utf8"),
    before,
    "the command changed the config",
  );
});
