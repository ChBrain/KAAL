// Contract test for the drawing asks-when-not-told. One per seam. Blind to
// the renderer: the tool as a command, read as a reader receives it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kaal = (args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });

test("1. the item arrives inside prompt two, and the runner page is current", () => {
  const r = kaal(["runner", "analyse", "json-flag"]);
  assert.equal(r.status, 0, r.stderr);
  const start = r.stdout.indexOf("## Prompt 2: the reading");
  const end = r.stdout.indexOf("## The record's frontmatter");
  assert.ok(start !== -1 && end > start, "no reading prompt in the page");
  const reading = r.stdout.slice(start, end).replace(/\s+/g, " ");
  assert.match(reading, /asks which of the two places/i);
  assert.match(reading, /before it begins/i);
  const check = kaal(["runner", "--check"]);
  assert.equal(check.status, 0, check.stdout + check.stderr);
});
