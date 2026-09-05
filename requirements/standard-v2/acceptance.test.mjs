// Acceptance test for requirement standard-v2. One criterion. Surface only:
// the workflow's text.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("1. the standard job runs on ubuntu and windows, its loop under bash, and runs kaal standard on both", () => {
  const ci = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
  const job =
    ci.match(/^ {2}standard:\n([\s\S]*?)(?=^ {2}\S|(?![\s\S]))/m)?.[1] ?? "";
  assert.ok(job, "no standard job");
  assert.match(job, /runs-on: \$\{\{\s*matrix\.os\s*\}\}/);
  assert.match(job, /os:\s*\[ubuntu-latest,\s*windows-latest\]/);
  assert.match(
    job,
    /skills-ref validate[\s\S]*?shell: bash|shell: bash[\s\S]*?skills-ref validate/,
  );
  assert.match(job, /node bin\/kaal\.mjs standard/);
});
