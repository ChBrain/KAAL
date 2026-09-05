// Contract tests for the drawing evals-v2. One per seam. Blind to the code:
// they read the workflow's text, the README, and the record contract's names.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const w = () =>
  readFileSync(join(ROOT, ".github", "workflows", "evals.yml"), "utf8");

test("1. settings to workflow: the env maps the three names, the refusal precedes the run", () => {
  const t = w();
  assert.match(t, /EVALS_API_URL:\s*\$\{\{\s*vars\.EVALS_API_URL\s*\}\}/);
  assert.match(t, /EVALS_API_KEY:\s*\$\{\{\s*secrets\.EVALS_API_KEY\s*\}\}/);
  assert.match(t, /vars\.EVALS_MODEL/);
  const refuse = t.indexOf("::error");
  assert.ok(refuse !== -1 && refuse < t.indexOf("name: Run the skill"));
});

test("2. workflow to endpoint: the fetch reads URL and key from the environment and sends the chat completions body", () => {
  const t = w();
  assert.match(t, /fetch\(\s*process\.env\.EVALS_API_URL/);
  assert.match(t, /Bearer \$\{process\.env\.EVALS_API_KEY\}/);
  assert.match(
    t,
    /JSON\.stringify\(\{\s*model,\s*messages,\s*temperature:\s*0/,
  );
  assert.match(t, /choices\[0\]\.message\.content/);
  assert.doesNotMatch(
    t,
    /https:\/\/[a-z0-9.-]+\.[a-z]{2,}\//i,
    "a host is named",
  );
});

test("3. workflow to tree: the record template writes every field the contract names, and the README names the settings", () => {
  const t = w();
  const fields = readFileSync(join(ROOT, "evals", "README.md"), "utf8")
    .match(/^- `([a-z_]+)`:/gm)
    .map((l) => l.slice(3, -2));
  assert.ok(fields.length >= 9, "README names fewer than nine fields");
  for (const f of fields)
    assert.match(t, new RegExp(`\\\\n${f}: `), `template lacks ${f}`);
  const readme = readFileSync(join(ROOT, "evals", "README.md"), "utf8");
  for (const s of ["EVALS_API_URL", "EVALS_API_KEY", "EVALS_MODEL"])
    assert.ok(readme.includes(s), `README does not name ${s}`);
});
