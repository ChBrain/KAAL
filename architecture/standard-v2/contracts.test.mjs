// Contract test for the drawing standard-v2. One seam. Blind to the code:
// the workflow's text, which commits the command to a Windows run.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("1. command to process end: the standard job runs kaal standard on windows-latest as well", () => {
  const ci = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
  const job =
    ci.match(/^ {2}standard:\n([\s\S]*?)(?=^ {2}\S|(?![\s\S]))/m)?.[1] ?? "";
  assert.match(job, /windows-latest/);
  assert.match(job, /matrix\.os/);
  assert.match(job, /node bin\/kaal\.mjs standard/);
});
