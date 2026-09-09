// Contract tests for drawing a-seat-claims-what-it-covers. One per seam,
// numbered to match. The fixture roots are the analyst's, beside the
// requirement: a count is a count whichever seat is asking, and a second set
// would be two answers to one question.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  cpSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = (n) =>
  join(ROOT, "requirements", "a-seat-claims-what-it-covers", "fixtures", n);
// Imported inside each seam: a namespace import at the top saves a missing
// export, not a module that fails to load, and one absent file would share
// its red across all five.
const need = async (file, name) => {
  const mod = await import(`../../bin/lib/${file}`);
  assert.ok(mod[name], `no ${name} export from ${file}`);
  return mod[name];
};
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
  });
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout}${r.stderr}`;
const copy = (name, fn) => {
  const to = mkdtempSync(join(tmpdir(), "kaal-cover-"));
  cpSync(F(name), to, { recursive: true });
  try {
    return fn(to);
  } finally {
    rmSync(to, { recursive: true, force: true });
  }
};

test("1. a row per seat: the table names each seat, its word, and what counts it", async () => {
  const SEATS = await need("coverage.mjs", "SEATS");
  assert.ok(Array.isArray(SEATS), "the seats are not a table");
  assert.deepEqual(
    SEATS.map((s) => s.name),
    ["analyst", "architect", "tester"],
    "the table is not the seats the ask names, in the chain's order",
  );
  for (const s of SEATS) {
    // A word for what it counts, so a row reads without the criteria beside
    // it, and a function that counts it, so a seat is a row and not a branch.
    assert.match(
      String(s.counts),
      /^[a-z][a-z ]{3,}$/,
      `${s.name} has no word: ${s.counts}`,
    );
    assert.equal(typeof s.covered, "function", `${s.name} carries no counter`);
  }
});

test("2. the subjects: each row's covered and missing are read from the edges, not from a directory", async () => {
  const subjects = await need("coverage.mjs", "subjects");
  const rows = subjects(F("gaps"));
  const by = Object.fromEntries(rows.map((r) => [r.name, r]));
  assert.equal(
    by.analyst.of.length,
    3,
    `three stated, read ${by.analyst.of.length}`,
  );
  // beta has no drawing; gamma has no record. A row counting directories
  // would answer three for the architect, because a drawing directory is not
  // what the criterion counts: the declared edge is.
  assert.deepEqual(by.architect.covered.sort(), ["alpha", "gamma"]);
  assert.deepEqual(by.architect.missing, ["beta"]);
  assert.deepEqual(by.tester.covered.sort(), ["alpha", "beta"]);
  assert.deepEqual(by.tester.missing, ["gamma"]);
  // And the two lists are every task, always: a row that loses one is a row
  // whose percentage is of nothing.
  for (const r of rows)
    assert.equal(
      r.covered.length + r.missing.length,
      r.of.length,
      `${r.name} covers ${r.covered.length} and misses ${r.missing.length} of ${r.of.length}`,
    );
  // The two cases that tell a reading from a guess, built here because the
  // fixtures beside the requirement cannot show them: there the drawing
  // directories and the declared answers happen to be the same set, and a
  // record is either fresh or absent. A row counting directories, and a row
  // counting records without asking whether they still speak for the suite,
  // both answer correctly there and wrongly here.
  copy("gaps", (root) => {
    mkdirSync(join(root, "architecture", "beta"), { recursive: true });
    writeFileSync(
      join(root, "architecture", "beta", "drawing.md"),
      "---\ntraces:\n  requirement: alpha\n---\n\n# Drawing: beta\n",
    );
    writeFileSync(
      join(root, "tests", "runs", "gamma.md"),
      `# Run: gamma\n\n- Task: gamma\n- Suite: requirements/gamma/acceptance.test.mjs\n- Ran: 2026-09-09\n- Suite sha: ${"0".repeat(64)}\n- Passing: 1\n- Failing: 0\n`,
    );
    const by2 = Object.fromEntries(subjects(root).map((r) => [r.name, r]));
    assert.ok(
      by2.architect.missing.includes("beta"),
      `a drawing that answers another task covered its own: ${by2.architect.missing}`,
    );
    assert.ok(
      by2.tester.missing.includes("gamma"),
      `a stale record counted as proof: ${by2.tester.missing}`,
    );
  });
});

test("3. the row: the seat, the word, how many of how many, the share, and what it misses", async () => {
  const row = await need("coverage.mjs", "row");
  const line = row({
    name: "architect",
    counts: "answered by a drawing",
    covered: ["alpha", "gamma"],
    missing: ["beta"],
    of: ["alpha", "beta", "gamma"],
  });
  assert.match(line, /\barchitect\b/, line);
  assert.match(line, /answered by a drawing/, line);
  assert.match(line, /\b2 of 3\b/, line);
  assert.match(line, /\b66\b/, `no whole percentage: ${line}`);
  assert.match(line, /\bbeta\b/, `the miss is not named: ${line}`);
  // A row covering everything says so rather than naming nothing.
  const full = row({
    name: "tester",
    counts: "proved by a run",
    covered: ["alpha"],
    missing: [],
    of: ["alpha"],
  });
  assert.match(full, /\b1 of 1\b/, full);
  assert.doesNotMatch(full, /:\s*$/, `a covered row trails off: ${full}`);
  // And a row with more misses than it will name says how many more.
  const many = row({
    name: "architect",
    counts: "answered by a drawing",
    covered: [],
    missing: Array.from({ length: 40 }, (_, i) => `task-${i}`),
    of: Array.from({ length: 40 }, (_, i) => `task-${i}`),
  });
  assert.match(
    many,
    /\bmore\b/,
    `a long row does not say how many more: ${many}`,
  );
  assert.ok(
    many.length < 400,
    `a row of 40 names was printed whole: ${many.length}`,
  );
});

test("4. the answer: rows and 0 where a tree states something, 2 where it states nothing, never 1", () => {
  for (const [fixture, code] of [
    ["covered", 0],
    ["gaps", 0],
    ["no-requirements", 2],
  ]) {
    const r = kaal("coverage", F(fixture));
    const out = said(r);
    assert.doesNotMatch(
      out,
      /^usage: kaal/m,
      `the command does not exist: ${out}`,
    );
    assert.equal(r.status, code, `${fixture} answered ${r.status}: ${out}`);
  }
  // A gap is a fact and not a finding, so nothing here ever answers 1. What
  // the rows say is seam 3's promise and is not read here: this seam is the
  // code alone, and reading the words too let a break in seam 3 redden this.
  const gaps = kaal("coverage", F("gaps"));
  assert.notEqual(gaps.status, 1, `a gap was a finding: ${said(gaps)}`);
});

test("5. the board's line: a gate saying its line shows is carried while it is green", async () => {
  const runGates = await need("gates.mjs", "runGates");
  copy("covered", (root) => {
    // A wall that passes and says its line belongs on the board: the board
    // prints it. Without the flag the board says only ok, which is what
    // makes a wall that cannot fail invisible.
    const gate = {
      name: "coverage",
      command: `${JSON.stringify(process.execPath)} -e "console.log('analyst: 2 of 2')"`,
      show: true,
    };
    writeFileSync(
      join(root, "kaal.config.json"),
      JSON.stringify({ gates: [gate] }, null, 2),
    );
    const shown = runGates(root);
    assert.match(
      shown.lines.join("\n"),
      /analyst: 2 of 2/,
      `a wall saying its line shows was silent: ${shown.lines.join("\n")}`,
    );
    // And a wall that says nothing keeps the board's one line per wall.
    writeFileSync(
      join(root, "kaal.config.json"),
      JSON.stringify({ gates: [{ ...gate, show: undefined }] }, null, 2),
    );
    const quiet = runGates(root);
    assert.doesNotMatch(
      quiet.lines.join("\n"),
      /analyst: 2 of 2/,
      `a wall that did not ask was printed anyway: ${quiet.lines.join("\n")}`,
    );
  });
});
