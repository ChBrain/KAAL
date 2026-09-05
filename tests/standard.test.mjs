import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { compareSpec } from "../bin/lib/standard.mjs";

const FX = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "requirements",
  "standard-v1",
  "fixtures",
  "spec",
);

test("compareSpec hashes a local file against the pin and names both hashes", async () => {
  const same = await compareSpec(FX, "spec.txt");
  assert.equal(same.same, true);
  assert.equal(same.live, same.pinned);
  const moved = await compareSpec(FX, "drift.txt");
  assert.equal(moved.same, false);
  assert.match(moved.live, /^[0-9a-f]{64}$/);
  assert.equal(moved.pinned, same.pinned);
});

test("compareSpec refuses a config with no pin", async () => {
  await assert.rejects(
    () =>
      compareSpec(
        join(FX, "..", "..", "..", "gates-v2", "fixtures", "plain"),
        "kaal.config.json",
      ),
    /standard\.spec/,
  );
});
