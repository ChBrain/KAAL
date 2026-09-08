// Contract tests for drawing the-release-runs-on-a-key. One per seam,
// numbered to match. Seam 1 is driven through the module, seam 2 through
// the command, seam 3 read from the workflow's text, which is the whole of
// what can be held here: nothing in this tree runs GitHub, and the order a
// dispatch takes is proven by a dispatch.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// The trees the criteria were written against, beside the requirement.
const FIX = (n) =>
  join(ROOT, "requirements", "the-release-runs-on-a-key", "fixtures", n);
// Imported where it is used, not at the top. A namespace import saves a
// file whose module is missing an export; it does not save one whose module
// does not exist, and the first draft of this file failed to load, so three
// seams shared one red that said nothing about any of them.
const load = async () => {
  const p = join(ROOT, "bin", "lib", "release.mjs");
  assert.ok(existsSync(p), "there is no bin/lib/release.mjs");
  const m = await import(pathToFileURL(p).href);
  assert.equal(typeof m.checkRelease, "function", "no checkRelease export");
  return m.checkRelease;
};

test("1. the two facts, read from the tree", async () => {
  const check = await load();
  const good = check(FIX("agrees"), "0.0.1");
  assert.equal(good.ok, true, `refused a tree that agrees: ${good.lines}`);
  assert.ok(good.lines.length, "an answer that says nothing is not an answer");
  // A version the tree does not carry: both numbers, so a reader knows what
  // to change and which way.
  const wrong = check(FIX("mismatch"), "0.0.1");
  assert.equal(wrong.ok, false, "a mislabelled release was allowed");
  const said = wrong.lines.join(" ");
  assert.match(said, /0\.0\.1/, `the version asked for is missing: ${said}`);
  assert.match(said, /0\.0\.2/, `the version carried is missing: ${said}`);
  // No plan: the path, so a reader knows where to write it.
  const unplanned = check(FIX("no-record"), "0.0.1");
  assert.equal(unplanned.ok, false, "a release with no plan was allowed");
  assert.match(
    unplanned.lines.join(" "),
    /deploy[/\\]releases[/\\]0\.0\.1\.md/,
    `the plan's path is missing: ${unplanned.lines}`,
  );
  // One finding per disagreement, counted: a tree that is wrong twice says
  // so twice, or a reader fixes one thing and meets the other.
  const both = check(FIX("mismatch"), "0.0.3");
  assert.equal(both.ok, false, "a tree wrong twice was allowed");
  assert.equal(
    both.lines.length,
    2,
    `expected two findings, got: ${both.lines.join(" | ")}`,
  );
});

test("2. the command's answer, and a reason of its own", () => {
  const kaal = (dir, ...args) =>
    spawnSync(
      process.execPath,
      [join(ROOT, "bin", "kaal.mjs"), "release", ...args],
      { encoding: "utf8", cwd: dir },
    );
  assert.equal(kaal(FIX("agrees"), "0.0.1").status, 0);
  assert.equal(kaal(FIX("mismatch"), "0.0.1").status, 1);
  const away = kaal(FIX("foreign"), "0.0.1");
  assert.equal(away.status, 2, `answered a foreign tree: ${away.stdout}`);
  // Its own words. `class` reads the same file for another question, and
  // two commands refusing alike tell a reader nothing about which spoke.
  // The reason, not the printed line: every refusal is prefixed with the
  // command's own name, so comparing the lines compares the prefixes and
  // was green with both reasons identical.
  const reason = (r) =>
    (r.stdout + r.stderr).replace(/^\w+: not applicable here: /m, "").trim();
  const mine = reason(away);
  const theirs = spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "class", FIX("foreign")],
    { encoding: "utf8", cwd: FIX("foreign") },
  );
  assert.notEqual(
    mine,
    reason(theirs),
    `release and class refuse in the same words: ${mine}`,
  );
  assert.doesNotMatch(mine, /0\.0\.1/, `it read a version as a path: ${mine}`);
});

test("3. the order in the workflow, as written", () => {
  const p = join(ROOT, ".github", "workflows", "release.yml");
  assert.ok(existsSync(p), "there is no release workflow");
  const lines = readFileSync(p, "utf8")
    .split("\n")
    .map((l) => (/^\s*#/.test(l) ? "" : l));
  const at = (re) => lines.findIndex((l) => l && re.test(l));
  // The condition, not any mention: the step's own message names the
  // default branch too, so a search for the words found the echo and was
  // green with the condition deleted, which is worse than absent because
  // the step would then always run and always fail.
  const branch = lines.findIndex(
    (l) => l && /^\s*if:/.test(l) && /default_branch|refs\/heads\/main/.test(l),
  );
  const board = at(/npm test/);
  const refusal = at(/kaal\.mjs release|kaal release/);
  const tag = at(/git tag|createRef|refs\/tags\//);
  for (const [name, i] of [
    ["the branch check", branch],
    ["the board", board],
    ["the refusal", refusal],
    ["the tag", tag],
  ])
    assert.ok(i > -1, `${name} is not in the workflow`);
  // Each before the next, and the tag after all three. Asserted as an order
  // rather than as four positions, so a step moved anywhere is one failure
  // naming where it went.
  assert.deepEqual(
    [branch, board, refusal, tag].slice().sort((a, b) => a - b),
    [branch, board, refusal, tag],
    `out of order: branch ${branch}, board ${board}, refusal ${refusal}, tag ${tag}`,
  );
});
