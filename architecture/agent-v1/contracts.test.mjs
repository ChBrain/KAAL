// Contract tests for the drawing agent-v1. One per seam. Blind to the code:
// the tool as a command on fixture roots.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });

test("1. agent directory to rules: a persona carrying scope is a named finding", () => {
  const r = kaal("agents", join(HERE, "fixtures", "scoped"));
  assert.equal(r.status, 1);
  assert.match(
    r.stderr,
    /^x: scope:/m,
    "no scope finding naming agent and rule",
  );
});

test("2. loadout and hands to the tree: unresolved entries are named findings", () => {
  const r = kaal("agents", join(HERE, "fixtures", "unresolved"));
  assert.equal(r.status, 1);
  assert.match(
    r.stderr,
    /^x: skills:.*no-such-skill/m,
    "unresolved skill not named",
  );
  assert.match(r.stderr, /^x: hands_to:.*nobody/m, "unresolved hand not named");
});

test("3. rules to shell: the league passes with a summary and nothing on stderr", () => {
  const r = kaal("agents");
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.trim().length > 0, "no summary");
  assert.equal(r.stderr.trim(), "");
});
