// Acceptance tests for requirement the-board-runs-on-two-runtimes. One per
// criterion. Surface only: the text of the ci workflow and the text of
// public-v1's fourth acceptance test. No count over the file is asserted
// anywhere here, which is the defect criterion 3 exists to correct.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ci = () =>
  readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
// One job's block: from its two space key to the next one, so a step is read
// inside the job that holds it and not anywhere in the file.
const job = (text, name) =>
  text.match(
    new RegExp(`^  ${name}:\\n([\\s\\S]*?)(?=^  \\S|(?![\\s\\S]))`, "m"),
  )?.[1];
const jobs = (text) =>
  [...text.slice(text.indexOf("\njobs:")).matchAll(/^  ([a-z0-9-]+):$/gm)].map(
    (m) => m[1],
  );

test("1. a job runs the board on the next major runtime", () => {
  const t = ci();
  const names = jobs(t);
  assert.ok(names.length > 1, `the workflow holds ${names.length} job(s)`);
  // Found by what it is, not by its name: the criterion is about a job that
  // runs the board on node 24, and the name is the build's to choose.
  const found = names
    .map((n) => [n, job(t, n)])
    .filter(
      ([, b]) =>
        b &&
        /runs-on: ubuntu-latest/.test(b) &&
        /node-version: 24\b/.test(b) &&
        /^\s*- run: npm test\s*$/m.test(b),
    );
  assert.equal(
    found.length,
    1,
    `expected one board job on node 24, found ${found.map(([n]) => n).join(", ") || "none"}`,
  );
  const [name, block] = found[0];
  assert.match(block, /fetch-depth: 0/, `${name} does not fetch the history`);
  // The one command and nothing else as its test step.
  const runs = block
    .match(/^\s*- run: (.+)$/gm)
    .map((l) => l.split("- run: ")[1].trim());
  assert.deepEqual(
    runs.filter((r) => r.includes("test")),
    ["npm test"],
    `${name} runs more than the one command`,
  );
});

test("2. the required check keeps its name and gains no matrix", () => {
  const t = ci();
  assert.ok(jobs(t).includes("walls"), "there is no job named walls");
  const block = job(t, "walls");
  assert.match(block, /runs-on: ubuntu-latest/, "walls left ubuntu");
  // A matrix renames the check to `walls (22)` and un-requires the board.
  assert.doesNotMatch(
    block,
    /^\s*strategy:/m,
    "walls gained a matrix, which renames the required check",
  );
  assert.match(
    block,
    /^\s*- run: npm test\s*$/m,
    "walls stopped running the board",
  );
});

test("3. the closed test names the jobs it checks instead of counting them", () => {
  const t = readFileSync(
    join(ROOT, "requirements", "public-v1", "acceptance.test.mjs"),
    "utf8",
  );
  const it = t.match(/test\("4\.[\s\S]*?\n\}\);/)?.[0];
  assert.ok(it, "public-v1 has no fourth test");
  // No total over the file. The criterion names two jobs and says nothing
  // about how many others there may be.
  assert.doesNotMatch(
    it,
    /\.length,\s*\d+/,
    `the fourth test still counts jobs: ${it}`,
  );
  // And it still holds what the criterion does say: each named job runs the
  // one command. Read as two assertions, because one alternation would pass
  // on a test that checks only one of them. The body, not the whole test:
  // its own title says "ci keeps walls on ubuntu", so a match over the test
  // was green with every mention of the job removed from what it asserts.
  const body = it.slice(it.indexOf("\n"));
  // The job named as a literal, not the word anywhere. `walls` survives in
  // the test's own title and in any local it is bound to, so both a match
  // over the whole test and a word match over the body were green with the
  // job removed from everything the test actually looks up.
  assert.match(
    body,
    /["'`]walls["'`]/,
    "the walls job is no longer named as a job",
  );
  assert.match(body, /windows-latest/, "the windows job is no longer named");
  const npmTest = [...it.matchAll(/npm test/g)].length;
  assert.ok(
    npmTest >= 2,
    `the one command is asserted ${npmTest} time(s), not once for each job`,
  );
});
