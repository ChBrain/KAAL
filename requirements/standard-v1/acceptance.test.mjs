// Acceptance tests for requirement standard-v1. One per criterion. Surface
// only: the tool as a command on fixture roots, the workflow, the config,
// the README.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });

test("1. the rules wall refuses each optional field's bad shape and accepts the good one", () => {
  const r = kaal(["check", join(HERE, "fixtures", "fields")]);
  assert.equal(r.status, 1);
  for (const [skill, rule] of [
    ["compat-long", "compatibility"],
    ["tools-empty", "allowed-tools"],
    ["metadata-flat", "metadata"],
  ])
    assert.match(
      r.stderr,
      new RegExp(`^${skill}: ${rule}: `, "m"),
      `no ${rule} finding:\n${r.stderr}`,
    );
  assert.doesNotMatch(
    r.stderr,
    /^optional-ok: /m,
    "the well-formed skill was refused",
  );
});

test("2. ci runs the reference validator at the pinned commit over every skill, runs kaal standard, and runs weekly", () => {
  const ci = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
  const ref = JSON.parse(readFileSync(join(ROOT, "kaal.config.json"), "utf8"))
    .standard?.validator?.ref;
  assert.match(
    ref ?? "",
    /^[0-9a-f]{40}$/,
    "no validator commit in kaal.config.json",
  );
  const job =
    ci.match(/^ {2}standard:\n([\s\S]*?)(?=^ {2}\S|(?![\s\S]))/m)?.[1] ?? "";
  assert.ok(job, "no standard job");
  assert.ok(
    job.includes(`agentskills@${ref}`),
    "the validator is not installed at the pinned commit",
  );
  assert.match(job, /skills-ref validate/);
  assert.match(job, /skills\/\*/);
  assert.match(job, /kaal\.mjs standard/);
  assert.match(ci, /^\s*schedule:\n\s*- cron:/m);
});

test("3. kaal standard says unchanged on the pinned text and drift on a moved one, with both hashes", () => {
  const cwd = join(HERE, "fixtures", "spec");
  const same = kaal(["standard", "spec.txt"], cwd);
  assert.equal(same.status, 0, same.stdout + same.stderr);
  assert.match(same.stdout, /unchanged/i);
  const moved = kaal(["standard", "drift.txt"], cwd);
  assert.equal(moved.status, 1);
  assert.match(moved.stderr, /drift/i);
  assert.equal(
    (moved.stderr.match(/[0-9a-f]{64}/g) ?? []).length,
    2,
    "two hashes expected",
  );
});

test("4. the README says how compliance is tested", () => {
  const readme = readFileSync(join(ROOT, "README.md"), "utf8");
  assert.match(readme, /skills-ref/);
  assert.match(readme, /kaal standard/);
  assert.match(readme, /mirror/i);
});
