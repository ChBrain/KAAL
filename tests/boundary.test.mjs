import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { checkBoundary } from "../bin/lib/boundary.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RQ = join(ROOT, "requirements", "assess-boundary", "fixtures");
const AR = join(ROOT, "architecture", "assess-boundary", "fixtures");
const lines = (root) => checkBoundary(root).map((f) => `${f.file} ${f.verb}`);

test("a tree that only reads has no finding, and so has a root with no assess tree", () => {
  assert.deepEqual(checkBoundary(join(RQ, "clean-assess")), []);
  const empty = mkdtempSync(join(tmpdir(), "kaal-boundary-"));
  try {
    assert.deepEqual(checkBoundary(empty), []);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

test("a second writer and a module that spawns are both named, and the sink is not named for writing", () => {
  const found = lines(join(RQ, "second-writer"));
  assert.ok(found.includes("collect.mjs writes"), found.join("; "));
  assert.ok(
    found.includes("run.mjs reaches the shell or the network"),
    found.join("; "),
  );
  assert.ok(!found.some((l) => l.startsWith("output.mjs")), found.join("; "));
});

test("the sink may write and may not reach, and a test beside the modules is never read", () => {
  const found = lines(join(AR, "reaching-sink"));
  assert.deepEqual(found, ["output.mjs reaches the shell or the network"]);
});

test("the league's own assess tree only reads", () => {
  assert.deepEqual(checkBoundary(ROOT), []);
});
