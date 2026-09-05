// Acceptance tests for requirement evals-v2. One per criterion. Surface
// only: the evals workflow's text and the evals README.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const W = join(ROOT, ".github", "workflows");
const workflow = () =>
  readdirSync(W)
    .map((f) => readFileSync(join(W, f), "utf8"))
    .find((t) => /startsWith\([^)]*['"]\/eval/.test(t));
const runStep = (w) =>
  w.match(/name: Run the skill[\s\S]*?(?=\n {6}- name:|$)/)?.[0] ?? "";

test("1. the workflow names no host: URL from EVALS_API_URL, key from EVALS_API_KEY", () => {
  const w = workflow();
  assert.ok(w, "no evals workflow");
  assert.match(w, /vars\.EVALS_API_URL/);
  assert.match(w, /secrets\.EVALS_API_KEY/);
  assert.doesNotMatch(runStep(w), /https:\/\/[a-z0-9.-]+/i, "a host is named");
});

test("2. the workflow refuses before any request when a setting is unset, naming both", () => {
  const w = workflow();
  const refuse = w.indexOf("::error");
  const run = w.indexOf("name: Run the skill");
  assert.ok(refuse !== -1, "no ::error line");
  assert.ok(run !== -1, "no run step");
  assert.ok(refuse < run, "the refusal comes after the run");
  const line = w.slice(refuse, w.indexOf("\n", refuse));
  assert.match(line, /EVALS_API_URL/);
  assert.match(line, /EVALS_API_KEY/);
});

test("3. no models permission; contents write and pull-requests read stay", () => {
  const w = workflow();
  const perms = w.match(/^permissions:\n((?: {2}.*\n)+)/m)?.[1] ?? "";
  assert.ok(perms, "no permissions block");
  assert.doesNotMatch(perms, /models:/);
  assert.match(perms, /contents:\s*write/);
  assert.match(perms, /pull-requests:\s*read/);
});

test("4. the default model is EVALS_MODEL and the README names the three settings", () => {
  assert.match(workflow(), /vars\.EVALS_MODEL/);
  const readme = readFileSync(join(ROOT, "evals", "README.md"), "utf8");
  for (const s of ["EVALS_API_URL", "EVALS_API_KEY", "EVALS_MODEL"])
    assert.ok(readme.includes(s), `README does not name ${s}`);
});
