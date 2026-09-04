// Acceptance tests for requirement gates-v1. One per criterion, numbered to
// match. Surface only: package.json, the hook, the workflow, and the output
// of the one command.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const sh = (cmd, args, env = {}) =>
  spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
const workflows = () =>
  existsSync(join(ROOT, ".github", "workflows"))
    ? readdirSync(join(ROOT, ".github", "workflows"))
        .filter((f) => /\.ya?ml$/.test(f))
        .map((f) => readFileSync(join(ROOT, ".github", "workflows", f), "utf8"))
    : [];

const INSIDE = process.env.npm_lifecycle_event === "test";

test("1. package.json has a test script and npm test passes", () => {
  const p = join(ROOT, "package.json");
  assert.ok(existsSync(p), "no package.json");
  assert.ok(
    JSON.parse(readFileSync(p, "utf8")).scripts?.test,
    "no test script",
  );
  // Inside npm test this run is itself the evidence; outside, run it.
  if (!INSIDE)
    assert.equal(sh("npm", ["test", "--silent"]).status, 0, "npm test fails");
});

test("2. the pre-push hook exists, is executable, runs npm test, and fails with it", () => {
  const h = join(ROOT, ".githooks", "pre-push");
  assert.ok(existsSync(h), "no hook");
  assert.ok(statSync(h).mode & 0o111, "hook not executable");
  assert.ok(
    /npm test/.test(readFileSync(h, "utf8")),
    "hook does not run npm test",
  );
  // The hook honours a failing test command: point it at one that fails.
  const r = sh("sh", [h], { KAAL_TEST_COMMAND: "false" });
  assert.notEqual(r.status, 0, "hook passed a failing test command");
});

test("3. a workflow runs on pull_request and push to main with a step that is exactly npm test", () => {
  const w = workflows().find(
    (t) => /pull_request/.test(t) && /push:/.test(t) && /main/.test(t),
  );
  assert.ok(w, "no workflow on pull_request and push to main");
  assert.ok(
    /^\s*-?\s*run:\s*npm test\s*$/m.test(w),
    "no step whose run line is exactly npm test",
  );
});

test("4. the workflow declares what it does not run", () => {
  assert.ok(
    workflows().some((t) => /^# not run:/m.test(t)),
    "no '# not run:' line",
  );
});

test("5. the test command reaches every acceptance test and every script test", () => {
  const script = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"))
    .scripts.test;
  const walk = (d) =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) =>
      e.name === "node_modules" || e.name.startsWith(".")
        ? []
        : e.isDirectory()
          ? walk(join(d, e.name))
          : [join(d, e.name).slice(ROOT.length + 1)],
    );
  const files = walk(ROOT);
  const patterns = script
    .split(/\s+/)
    .filter((t) => t.includes("/") || t.endsWith(".mjs"));
  const reached = new Set(
    patterns.flatMap((g) => {
      const re = new RegExp(
        "^" +
          g
            .replace(/[.+^${}()|[\]\\]/g, "\\$&")
            .replace(/\*\*/g, "\u0000")
            .replace(/\*/g, "[^/]*")
            .replace(/\u0000/g, ".*") +
          "$",
      );
      return files.filter((f) => re.test(f));
    }),
  );
  const must = files.filter(
    (f) =>
      /^requirements\/[^/]+\/acceptance\.test\.mjs$/.test(f) ||
      /^tests\/[^/]+\.test\.mjs$/.test(f) ||
      /^skills\/[^/]+\/scripts\/[^/]+\.test\.mjs$/.test(f),
  );
  assert.ok(must.length > 0, "nothing to reach");
  for (const f of must)
    assert.ok(reached.has(f), `not reached by the test command: ${f}`);
});
