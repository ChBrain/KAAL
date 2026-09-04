import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const kaal = (...a) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...a], {
    cwd: ROOT,
    encoding: "utf8",
  });

test("an unknown command exits 1 with usage", () => {
  const r = kaal("nope");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /usage/i);
});

test("a bad ledger root exits 1 and names the move on stderr", () => {
  const r = kaal(
    "ledger",
    join(ROOT, "requirements", "push-v1", "fixtures", "bad-ledger"),
  );
  assert.equal(r.status, 1);
  assert.match(r.stderr, /claims a rung with no evidence/);
});

test("a clean run exits 0 with a summary on stdout and nothing on stderr", () => {
  const r = kaal("check");
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.trim());
  assert.equal(r.stderr.trim(), "");
});
