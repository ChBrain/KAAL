// Contract tests for the drawing analyse-v2. One per seam. Blind to the
// code: the skill's text, its template, a stamped fixture, the tool as a
// command.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const SKILL = join(ROOT, "skills", "analyse");
const read = (...p) => readFileSync(join(SKILL, ...p), "utf8");
const section = (t, title) =>
  t.match(
    new RegExp(
      `^## [^\\n]*${title}[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`,
      "m",
    ),
  )?.[1] ?? "";

test("1. template to requirements: the lines in order, and a stamped requirement reads from its record", () => {
  // Superseded by `a-task-is-delivered-by-its-run`. The template asked for a
  // `- Status:` line between Open questions and Blocked on; nobody writes one
  // now. The seam is what it always was, that the template's order is the
  // order a written requirement carries, with one fewer line in it.
  const h = section(read("references", "requirement.md"), "Handoff");
  const at = (l) => h.indexOf(`- ${l}`);
  assert.ok(at("Open questions:") >= 0, "no Open questions line");
  assert.equal(at("Status:"), -1, "the template still asks for a status");
  assert.ok(
    at("Blocked on:") > at("Open questions:"),
    "Blocked on missing or misplaced",
  );
  assert.ok(
    at("Supersedes:") > at("Blocked on:"),
    "Supersedes missing or misplaced",
  );
  // And a requirement written from it is judged by its run and its record.
  // The stamped fixture has no record, so its green suite reads not
  // delivered: the coder has claimed and nobody has proved.
  const r = spawnSync(
    process.execPath,
    [
      join(ROOT, "bin", "kaal.mjs"),
      "acceptance",
      "requirements/t/acceptance.test.mjs",
    ],
    { cwd: join(HERE, "fixtures", "stamped"), encoding: "utf8" },
  );
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^ok\s+not delivered\s+t /m, r.stdout);
});

test("2. skill text to the proof: four bold leads in section 3", () => {
  const p = section(read("SKILL.md"), "Write the proof");
  const leads = [...p.matchAll(/^- \*\*([^*]+)\*\*/gm)].map((m) =>
    m[1].toLowerCase(),
  );
  assert.ok(leads.length >= 9, `section 3 has ${leads.length} bullets`);
  const bullet = (re) =>
    [...p.matchAll(/^- \*\*[^*]+\*\*[\s\S]*?(?=^- \*\*|(?![\s\S]))/gm)].find(
      (m) => re.test(m[0]),
    );
  assert.ok(bullet(/iterat/i), "no bullet on iterating");
  assert.ok(bullet(/timeout/i), "no bullet on a timeout");
  assert.ok(bullet(/fixture root/i), "no bullet on the fixture root");
  assert.ok(bullet(/already met/i), "no bullet on a partial red");
});

test("3. fixture to the reader: the ask names an empty directory, the expectation counts first", () => {
  assert.match(read("fixtures", "vacuous-loop", "ask.md"), /empty/i);
  const items = read("fixtures", "vacuous-loop", "expect.md")
    .split("\n")
    .filter((l) => l.startsWith("- "));
  assert.ok(items.length >= 3, "fewer than three expectations");
  assert.match(items[0], /at least one|count|non-empty/i);
});
