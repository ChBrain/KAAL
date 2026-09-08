// Acceptance tests for requirement a-task-names-its-people. One per
// criterion. Surface only: the skills' text, the template, the surface page,
// every requirement's handoff, and the tool as a command on fixtures.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, globSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = join(HERE, "fixtures");
// Folded, because the formatter wraps where it likes.
const folded = (p) => readFileSync(p, "utf8").replace(/\s+/g, " ");
const skill = (name) => folded(join(ROOT, "skills", name, "SKILL.md"));
const kaal = (...args) =>
  spawnSync("node", [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });

test("1. the analyse skill asks the question and says what a tree may hold", () => {
  const t = skill("analyse");
  assert.match(t, /## (\d+\. )?Data about a person/i, "no section");
  assert.match(t, /whether the task touches data about a person/i);
  for (const phrase of [
    /the purpose/i,
    /system of record/i,
    /by identifier/i,
    /how it is erased/i,
    /identifiers, never the person/i,
    /ignored by version control/i,
  ])
    assert.match(t, phrase, `analyse does not say ${phrase}`);
});

test("2. the template's handoff carries a People line, none or the data with its record and erasure", () => {
  const t = readFileSync(
    join(ROOT, "skills", "analyse", "references", "requirement.md"),
    "utf8",
  );
  const handoff = t.split(/^## Handoff/m)[1] ?? "";
  assert.ok(handoff, "the template has no Handoff");
  assert.match(handoff, /^- People: /m, "no People line in the Handoff");
  const line = handoff.match(/^- People: (.*)$/m)[1];
  assert.match(line, /none/i, `the line does not offer none: ${line}`);
  assert.match(line, /system of record/i, line);
  assert.match(line, /erase/i, line);
});

test("3. kaal acceptance refuses a requirement with no People line and passes one that says none", () => {
  const no = kaal("acceptance", join(F, "no-people", "acceptance.test.mjs"));
  assert.equal(no.status, 1, `no-people not refused\n${no.stdout}${no.stderr}`);
  assert.match(no.stdout, /^FAIL .*no people line/m, no.stdout);
  assert.match(no.stdout, /no-people/, no.stdout);
  const none = kaal(
    "acceptance",
    join(F, "people-none", "acceptance.test.mjs"),
  );
  assert.equal(
    none.status,
    0,
    `people-none refused\n${none.stdout}${none.stderr}`,
  );
});

test("4. every requirement in the league, fixtures included, carries one non-empty People line", () => {
  // Every requirement file in the tree, the fixtures under architecture/
  // included, since a fixture obeys the rules it is not testing.
  const files = globSync("**/requirement.md", { cwd: ROOT })
    .filter((f) => !f.includes("node_modules") && !f.includes("no-people"))
    .sort();
  assert.ok(files.length >= 40, `found ${files.length} requirements`);
  for (const f of files) {
    const lines =
      readFileSync(join(ROOT, f), "utf8").match(/^- People: (.*)$/gm) ?? [];
    assert.equal(lines.length, 1, `${f}: ${lines.length} People lines`);
    assert.ok(
      lines[0].replace(/^- People: /, "").trim(),
      `${f}: the People line is empty`,
    );
  }
});

test("5. the test skill names the proof that cannot be a wall: the absence of a name", () => {
  const t = skill("test");
  assert.match(t, /absence of a name/i);
  assert.match(t, /cannot be a wall/i);
  assert.match(t, /manual test at the merge/i);
  assert.match(t, /steps written/i);
});

test("6. the code skill keeps data about a person out of the tree", () => {
  const t = skill("code");
  assert.match(t, /data about a person/i);
  assert.match(t, /identifiers in the tree/i);
  assert.match(t, /system of record/i);
  assert.match(t, /ignored by version control/i);
  assert.match(t, /artefact that carries a person/i);
});

test("7. the surface page's acceptance section names the People line", () => {
  const p = join(ROOT, "SURFACE.md");
  assert.ok(existsSync(p), "no SURFACE.md");
  const section =
    readFileSync(p, "utf8")
      .split(/^## /m)
      .find((s) => s.startsWith("acceptance")) ?? "";
  assert.ok(section, "no acceptance section");
  assert.match(section, /People/, "the section does not name the People line");
});
