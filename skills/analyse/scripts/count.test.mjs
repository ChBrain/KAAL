import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./count.mjs", import.meta.url));
const run = (...a) => spawnSync("node", [script, ...a], { encoding: "utf8" });

test("equal counts exit 0", () => {
  assert.equal(run("7", "7").status, 0);
});

test("unequal counts exit 1 and say both numbers", () => {
  const r = run("7", "6");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /7.*6/);
});

test("a missing or non-numeric argument exits 1", () => {
  assert.equal(run("7").status, 1);
  assert.equal(run("x", "y").status, 1);
});
