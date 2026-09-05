// Acceptance tests for requirement gates-v1. One per criterion, numbered to
// match. Surface only: package.json, the hook, the workflow, and the output
// of the one command.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
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

// Inside the runner (which marks every wall with KAAL_GATES=1) this run is
// itself the evidence; spawning the runner again from here would recurse.
const INSIDE = process.env.KAAL_GATES === "1";

test("1. walls are data in kaal.config.json, one runner runs them, npm test is that runner", () => {
  const c = join(ROOT, "kaal.config.json");
  assert.ok(existsSync(c), "no kaal.config.json");
  const gates = JSON.parse(readFileSync(c, "utf8")).gates;
  assert.ok(
    Array.isArray(gates) && gates.length >= 2,
    "fewer than two walls declared",
  );
  for (const g of gates)
    assert.ok(g.name && g.command, "a wall without name or command");
  const script = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"))
    .scripts?.test;
  assert.equal(
    script,
    "node bin/kaal.mjs gates",
    "npm test is not the gates runner",
  );
  // Inside npm test this run is itself the evidence; outside, run the runner.
  if (!INSIDE) {
    const r = sh("node", ["bin/kaal.mjs", "gates"]);
    assert.equal(r.status, 0, "gates runner fails");
    for (const g of gates)
      assert.ok(
        r.stdout.includes(g.name),
        `runner did not print wall ${g.name}`,
      );
  }
});

test("2. the pre-push hook exists, is executable, runs npm test, and fails with it", () => {
  const h = join(ROOT, ".githooks", "pre-push");
  assert.ok(existsSync(h), "no hook");
  // Executable as git records it (100755), which holds on a checkout whose
  // filesystem keeps no mode bits.
  const mode = sh("git", ["ls-files", "-s", ".githooks/pre-push"]).stdout;
  assert.match(mode, /^100755 /, "hook not executable in the index: " + mode);
  assert.ok(
    /npm test/.test(readFileSync(h, "utf8")),
    "hook does not run npm test",
  );
  // The hook honours a failing test command: point it at one that fails.
  // Git runs hooks through its own sh on every platform, so sh is there.
  const r = sh("sh", [h], { KAAL_TEST_COMMAND: "exit 1" });
  assert.equal(r.error, undefined, "no sh to run the hook with");
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

test("5. the walls' commands reach every acceptance test and every script test", () => {
  const gates = JSON.parse(
    readFileSync(join(ROOT, "kaal.config.json"), "utf8"),
  ).gates;
  const walk = (d) =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) =>
      e.name === "node_modules" || e.name.startsWith(".")
        ? []
        : e.isDirectory()
          ? walk(join(d, e.name))
          : [join(d, e.name).slice(ROOT.length + 1)],
    );
  const files = walk(ROOT);
  const patterns = gates
    .flatMap((g) => g.command.split(/\s+/))
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
    assert.ok(reached.has(f), `not reached by any wall: ${f}`);
});
