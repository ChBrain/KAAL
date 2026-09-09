// Acceptance tests for requirement a-seat-claims-what-it-covers. One per
// criterion. Surface only: `kaal coverage` on fixture roots and on this tree,
// the board's config, and the pages swept for a declared number.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, globSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const F = (n) => join(dirname(fileURLToPath(import.meta.url)), "fixtures", n);
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
  });
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout}${r.stderr}`;
const notUsage = (out) =>
  assert.doesNotMatch(
    out,
    /^usage: kaal/m,
    `the command does not exist: ${out}`,
  );
const rowFor = (out, seat) =>
  out.split("\n").find((l) => new RegExp(`\\b${seat}\\b`).test(l)) ?? "";

test("1. one row per seat, each naming the seat, what it counts, how many of how many, and the share", () => {
  const r = kaal("coverage", F("covered"));
  const out = said(r);
  notUsage(out);
  for (const seat of ["analyst", "architect", "tester"]) {
    const row = rowFor(out, seat);
    assert.ok(row, `no row for the ${seat}: ${out}`);
    // What it counts, in words, so a row is readable without the criteria.
    assert.match(row, /[a-z]{4,}/, `the ${seat}'s row says nothing: ${row}`);
    assert.match(row, /\b2 of 2\b/, `the ${seat}'s row does not count: ${row}`);
    assert.match(
      row,
      /100\s*%|\b100\b/,
      `the ${seat}'s row has no share: ${row}`,
    );
  }
});

test("2. the architect counts drawings that declare a requirement, the tester counts fresh records", () => {
  const out = said(kaal("coverage", F("gaps")));
  notUsage(out);
  // Three stated; beta has no drawing; gamma has no record.
  assert.match(rowFor(out, "analyst"), /\b3\b/, rowFor(out, "analyst"));
  assert.match(
    rowFor(out, "architect"),
    /\b2 of 3\b/,
    rowFor(out, "architect"),
  );
  assert.match(rowFor(out, "tester"), /\b2 of 3\b/, rowFor(out, "tester"));
});

test("3. every row names what it does not cover, and says how many more when it stops", () => {
  const out = said(kaal("coverage", F("gaps")));
  notUsage(out);
  assert.match(out, /\bbeta\b/, `the undrawn task is not named: ${out}`);
  assert.match(out, /\bgamma\b/, `the unproved task is not named: ${out}`);
  // A row that stops early says so, rather than trailing off. On this fixture
  // nothing is elided, so the claim is read on the league's own tree, where
  // seven are missing from one row.
  const mine = said(kaal("coverage", ROOT));
  const arch = rowFor(mine, "architect");
  const names = (arch.match(/[a-z][a-z0-9-]{6,}/g) ?? []).length;
  if (!/\ball\b/.test(arch))
    assert.ok(
      names > 0 && (/\bmore\b/.test(arch) || names >= 5),
      `the row neither names them nor says how many more: ${arch}`,
    );
});

test("4. no page declares any of these numbers, and the command reads none", () => {
  // A percentage written into a page is a claim nobody checks. The tree is
  // swept for one so this cannot become true by somebody adding it later.
  const pages = globSync("{requirements,architecture,tests,kaal}/**/*.md", {
    cwd: ROOT,
  });
  const declaring = pages.filter((rel) =>
    /^- (Coverage|Covered|Verified):/m.test(
      readFileSync(join(ROOT, rel), "utf8"),
    ),
  );
  assert.deepEqual(
    declaring,
    [],
    `these pages declare a coverage number: ${declaring.join(", ")}`,
  );
});

test("5. it answers on a tree with requirements, refuses the question on one without, and never finds", () => {
  const has = kaal("coverage", F("covered"));
  notUsage(said(has));
  assert.equal(
    has.status,
    0,
    `a tree with requirements answered ${has.status}`,
  );
  // A gap is not a finding: coverage is a fact about how far the work has
  // got, and this command has no way to fail.
  const gaps = kaal("coverage", F("gaps"));
  assert.equal(gaps.status, 0, `a tree with gaps was a finding: ${said(gaps)}`);
  const none = kaal("coverage", F("no-requirements"));
  assert.equal(
    none.status,
    2,
    `a tree with no requirement answered ${none.status}: ${said(none)}`,
  );
});

test("6. the board runs it, and its line carries the counts", () => {
  const gates = JSON.parse(
    readFileSync(join(ROOT, "kaal.config.json"), "utf8"),
  ).gates;
  const gate = gates.find((g) => /coverage/.test(g.command ?? ""));
  assert.ok(gate, `no gate runs coverage: ${gates.map((g) => g.name)}`);
  // The board reads a count from a wall that declares one, so the line a
  // reader sees carries the numbers rather than only the word ok.
  assert.ok(
    gate.count,
    `the board reads no count from the coverage wall: ${JSON.stringify(gate)}`,
  );
});

test("7. on this tree the rows agree with the tree counted independently", () => {
  const out = said(kaal("coverage", ROOT));
  notUsage(out);
  const tasks = globSync("requirements/*/requirement.md", { cwd: ROOT }).map(
    (p) => p.replaceAll("\\", "/").split("/")[1],
  );
  const drawings = globSync("architecture/*/drawing.md", { cwd: ROOT }).map(
    (p) => readFileSync(join(ROOT, p), "utf8"),
  );
  const answered = tasks.filter((t) =>
    drawings.some((d) =>
      new RegExp(`^\\s+requirement: ${t}(@|\\s*$)`, "m").test(d),
    ),
  ).length;
  const recorded = tasks.filter((t) =>
    existsSync(join(ROOT, "tests", "runs", `${t}.md`)),
  ).length;
  assert.ok(tasks.length >= 60, `counted ${tasks.length} requirements`);
  assert.match(
    rowFor(out, "analyst"),
    new RegExp(`\\b${tasks.length}\\b`),
    `the analyst's row disagrees with ${tasks.length} stated: ${rowFor(out, "analyst")}`,
  );
  assert.match(
    rowFor(out, "architect"),
    new RegExp(`\\b${answered} of ${tasks.length}\\b`),
    `the architect's row disagrees with ${answered}: ${rowFor(out, "architect")}`,
  );
  assert.match(
    rowFor(out, "tester"),
    new RegExp(`\\b${recorded} of ${tasks.length}\\b`),
    `the tester's row disagrees with ${recorded}: ${rowFor(out, "tester")}`,
  );
});
