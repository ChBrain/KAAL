import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
test("ok", () => {
  assert.equal(
    spawnSync("node", [new URL("./ok.mjs", import.meta.url).pathname]).status,
    0,
  );
});
