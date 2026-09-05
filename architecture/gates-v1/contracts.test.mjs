// Contract tests for the drawing gates-v1. One per seam, numbered to match.
// Blind to the code: the runner is driven as a command on fixture configs;
// the hook wiring is observed through git in a temporary clone.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { mkdtempSync, cpSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = join(HERE, "fixtures");
const gates = (cwd) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), "gates"], {
    cwd,
    encoding: "utf8",
  });

test("1. config to runner: every wall runs, one line each, a count where there is one, unrunnable is FAIL, exit 1", () => {
  const r = gates(join(F, "mixed"));
  assert.equal(r.status, 1);
  const lines = r.stdout.split("\n");
  const line = (name) => lines.find((l) => l.includes(name));
  assert.match(line("passes") ?? "", /^ok\b/, "passes not ok");
  assert.match(
    line("fails") ?? "",
    /^FAIL\b.*make it pass/,
    "fails not FAIL with its fix",
  );
  assert.match(line("counts") ?? "", /3/, "count not read");
  assert.match(
    line("missing") ?? "",
    /^FAIL\b.*npm install/,
    "unrunnable not FAIL with its fix",
  );
  assert.ok(
    lines.indexOf(line("counts")) > lines.indexOf(line("fails")),
    "walls after a failure did not run",
  );
});

test("2. runner to shell: a clean config exits 0 with a summary that counts the walls", () => {
  const r = gates(join(F, "clean"));
  assert.equal(r.status, 0, r.stderr);
  assert.ok(
    /2/.test(r.stdout.trim().split("\n").at(-1)),
    "summary does not count two walls",
  );
  assert.equal(r.stderr.trim(), "", "stderr not empty on a clean run");
});

test("3. install to hook: prepare sets core.hooksPath to .githooks in a fresh clone", () => {
  const d = mkdtempSync(join(tmpdir(), "kaal-clone-"));
  try {
    for (const f of ["package.json", ".githooks", "bin", "kaal.config.json"])
      if (existsSync(join(ROOT, f)))
        cpSync(join(ROOT, f), join(d, f), { recursive: true });
    assert.equal(spawnSync("git", ["init", "-q"], { cwd: d }).status, 0);
    const p = spawnSync("npm run prepare --silent", {
      shell: true, // npm is a script on Windows; the platform's shell finds it
      cwd: d,
      encoding: "utf8",
    });
    assert.equal(p.status, 0, p.stderr);
    const c = spawnSync("git", ["config", "core.hooksPath"], {
      cwd: d,
      encoding: "utf8",
    });
    assert.equal(c.stdout.trim(), ".githooks");
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
});
