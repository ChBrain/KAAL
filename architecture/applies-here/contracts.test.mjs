// Contract tests for the drawing applies-here. One per seam. Blind to the
// code: the tool as a command, on fixture roots and on the league.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FOREIGN = join(
  ROOT,
  "requirements",
  "applies-here",
  "fixtures",
  "foreign",
);
const HALF = join(HERE, "fixtures", "half");
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
const FIVE = ["ledger", "drawings", "check", "agents", "fixtures"];

test("1. the path to applicability: none on a foreign tree, all on the league, and per command on a half adopted one", () => {
  assert.equal(FIVE.length, 5);
  for (const cmd of FIVE)
    assert.equal(
      kaal([cmd, FOREIGN]).status,
      2,
      `${cmd} answered a foreign tree`,
    );
  for (const cmd of FIVE)
    assert.equal(kaal([cmd]).status, 0, `${cmd} refused the league`);
  // A tree that adopted the ledger and nothing else: one question is its own.
  const ledger = kaal(["ledger", HALF]);
  assert.equal(ledger.status, 0, ledger.stderr);
  assert.match(ledger.stdout, /^ledger: every rung evidenced$/m);
  for (const cmd of ["drawings", "agents"]) {
    const r = kaal([cmd, HALF]);
    assert.equal(
      r.status,
      2,
      `${cmd} answered a tree that holds nothing of it`,
    );
    assert.match(r.stderr, new RegExp(`^${cmd}: not applicable here: `, "m"));
  }
});

test("2. the reason to the caller: exit 2, one line on stderr, nothing on stdout, and the reasons differ", () => {
  const a = kaal(["ledger", FOREIGN]);
  const b = kaal(["agents", FOREIGN]);
  for (const [cmd, r] of [
    ["ledger", a],
    ["agents", b],
  ]) {
    assert.equal(r.status, 2);
    assert.equal(r.stdout, "", `${cmd} wrote to stdout`);
    const lines = r.stderr.trim().split("\n");
    assert.equal(lines.length, 1, `${cmd}: ${r.stderr}`);
    assert.match(lines[0], new RegExp(`^${cmd}: not applicable here: \\S`));
  }
  const reason = (r) => r.stderr.trim().split(": not applicable here: ")[1];
  assert.notEqual(reason(a), reason(b), "both commands give the same reason");
});
