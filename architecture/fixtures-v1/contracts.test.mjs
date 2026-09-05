// Contract tests for the drawing fixtures-v1. One per seam. Blind to the code.
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

test("1. fixture directory to rule: an adversary whose expectation names no refusal is a fixtures finding", () => {
  const r = kaal("check", join(HERE, "fixtures", "no-refusal"));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^x: fixtures:.*(Refuses|Does not)/m);
});

test("2. rule to command: the finding reads <skill>: fixtures: <message> on stderr, and a clean tree says so on stdout", () => {
  const r = kaal("check", join(HERE, "fixtures", "no-refusal"));
  assert.equal(r.stdout.trim(), "", "a finding leaked to stdout");
  assert.match(r.stderr, /^x: fixtures: [^\n]+$/m);
  const ok = kaal("check");
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /^check: /m);
});
