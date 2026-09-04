import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileSha } from "../bin/lib/sha.mjs";

test("sha256 of the file bytes, 64 hex, changes when the file changes", () => {
  const d = mkdtempSync(join(tmpdir(), "sha-"));
  const p = join(d, "f.md");
  writeFileSync(p, "one");
  const a = fileSha(p);
  assert.match(a, /^[0-9a-f]{64}$/);
  writeFileSync(p, "two");
  assert.notEqual(fileSha(p), a);
});

test("throws on a missing file", () => {
  assert.throws(() => fileSha("/nowhere/at/all.md"));
});
