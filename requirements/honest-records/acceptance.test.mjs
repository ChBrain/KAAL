// Acceptance tests for requirement honest-records. One per criterion.
// Surface only: the README, the tool as a command, the records, the
// workflow, the template.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const SETUPS = ["chat", "system", "workspace", "workflow"];
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
const walk = (d) =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? walk(join(d, e.name))
      : e.name.endsWith(".md")
        ? [join(d, e.name)]
        : [],
  );

test("1. the README says the Output is the whole exchange and the reading is bound to expect_sha", () => {
  const r = readFileSync(join(ROOT, "evals", "README.md"), "utf8");
  assert.match(r, /whole exchange/i);
  assert.match(r, /author's answers/i);
  assert.match(r, /expect_sha/);
  assert.match(r, /read against the checklist/i);
});

test("2. setup is a field with four values: the ledger refuses a record without it, the README lists it, every record carries it", () => {
  const r = kaal(["ledger", join(HERE, "fixtures", "no-setup")]);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /missing setup/);
  const readme = readFileSync(join(ROOT, "evals", "README.md"), "utf8");
  assert.match(readme, /`setup`/);
  for (const s of SETUPS)
    assert.ok(readme.includes(`\`${s}\``), `README lacks ${s}`);
  const records = walk(join(ROOT, "evals")).filter((f) =>
    /^verdict:/m.test(readFileSync(f, "utf8")),
  );
  assert.ok(records.length >= 2, "no records under evals/");
  for (const f of records) {
    const m = readFileSync(f, "utf8").match(/^setup: (\S+)/m);
    assert.ok(m && SETUPS.includes(m[1]), `${f} lacks a setup`);
  }
});

test("3. the standings name stale records under a candidate, and the standing line keeps its shape", () => {
  const r = kaal(["ledger", join(HERE, "fixtures", "stale-record")]);
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.split("\n");
  const i = lines.findIndex((l) =>
    /^x: .+: candidate skill, \d of 2 fresh models$/.test(l),
  );
  assert.ok(i >= 0, "no standing");
  const under = [];
  for (let j = i + 1; j < lines.length && lines[j].startsWith("  "); j++)
    under.push(lines[j]);
  assert.equal(under.length, 1, "one stale line under the standing");
  assert.match(under[0], /^ {2}stale: \S+\.md \(.+\)$/);
  assert.match(under[0], /alpha\.md/);
});

test("4. the workflow's record template writes setup: workflow", () => {
  const w = readFileSync(
    join(ROOT, ".github", "workflows", "evals.yml"),
    "utf8",
  );
  assert.match(w, /\\nsetup: workflow\\n/);
});

test("5. the template names a task for the change it makes, not numbered", () => {
  const t = readFileSync(
    join(ROOT, "skills", "analyse", "references", "requirement.md"),
    "utf8",
  );
  assert.match(
    t,
    /^- Task: <[^>]*named for the change[^>]*not numbered[^>]*>/m,
  );
});
