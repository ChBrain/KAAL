// Contract tests for drawing the-test-tree-is-written-down. One per seam,
// numbered to match. Every seam drives `kaal traces` on one fixture root per
// shape, so no finding can be reported in another's words, and the seams that
// read a table read it as data rather than through the command.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = (n) => join(HERE, "fixtures", n);
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
  });
const said = (r) => r.stdout + r.stderr;
const notUsage = (out) =>
  assert.doesNotMatch(
    out,
    /^usage: kaal/m,
    `the command does not exist: ${out}`,
  );
const lines = (out) => out.split("\n").filter((l) => l.trim());
// A finding that is about the page it names, and not about a kind the table
// does not hold. Before `tests` is a place every fixture here reports the
// same thing about `parent`, and an exit code alone would make each of these
// green for a reason that has nothing to do with its seam.
const about = (out, name) =>
  lines(out).filter((l) => new RegExp(`\\b${name}\\b`).test(l));
// The same, narrowed to one kind. Seams 2 to 4 read only their own findings,
// so a break in the place beneath them reddens seam 1 and not all four: an
// isolation that cannot fall alone answers nothing. The two kinds are the
// two directions, and a plan is usually named for its wall, so reading them
// together would let either seam pass on the other's finding.
const ofKind = (out, name, kind) =>
  about(out, name).filter((l) => new RegExp(`: ${kind}: `).test(l));
const namesKind = (out, name, kind, what) =>
  assert.ok(
    ofKind(out, name, kind).length,
    `no ${kind} finding names ${name} (${what}): ${out}`,
  );
const silentKind = (out, name, kind, what) =>
  assert.deepEqual(
    ofKind(out, name, kind),
    [],
    `${name} was a ${kind} finding and should not be (${what})`,
  );
const names = (out, name, what) =>
  assert.ok(
    about(out, name).length,
    `no finding names ${name} (${what}): ${out}`,
  );
const silentAbout = (out, name, what) =>
  assert.deepEqual(
    about(out, name),
    [],
    `${name} was a finding and should not be (${what})`,
  );

test("1. tests/ is a place: its pages are artefacts, and a parent inside it resolves to a page", () => {
  const r = kaal("traces", F("reads"));
  const out = said(r);
  notUsage(out);
  // The listing reaches through subdirectories, and stops at `.md`.
  // `dangling` is a plan under `tests/plans/` whose wall exists and whose
  // count is right, so the only thing that can be said about it is that its
  // parent resolves to nothing, and a place that listed only the top of
  // `tests/` would never say it.
  assert.equal(r.status, 1, `an unresolvable parent was allowed: ${out}`);
  names(out, "dangling", "a page under a subdirectory of tests/");
  silentAbout(out, "notes", "a file under tests/ that is not .md");
  // And where a name inside the place resolves. `acceptance` sits under
  // `tests/plans/` and declares the strategy, which sits beside `plans/`, so
  // a finding here is a place that resolved the name beneath the declaring
  // page rather than beside the place's own root.
  silentAbout(out, "acceptance", "a parent naming another page of the place");
});

test("2. a plan naming a wall the config does not hold is a finding naming the plan", () => {
  const r = kaal("traces", F("plan-names-nothing"));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 1, `a plan naming no wall was allowed: ${out}`);
  namesKind(out, "orphaned", "plan", "the plan whose wall does not exist");
  assert.match(out, /\bnonesuch\b/, `the name it carried is not said: ${out}`);
  // The plan that names a wall the config does hold is not swept up with it.
  silentKind(out, "acceptance", "plan", "the plan whose wall exists");
  // Naming no wall at all is the same seam's other half: a page of the place
  // that is not the root is a plan, and a plan is about one wall.
  const none = kaal("traces", F("plan-names-no-wall"));
  const noneOut = said(none);
  assert.equal(none.status, 1, `a plan naming no wall was allowed: ${noneOut}`);
  namesKind(noneOut, "wordless", "plan", "the plan that names no wall");
  silentKind(noneOut, "acceptance", "plan", "the plan that names one");
});

test("3. a test gate no plan names is a finding naming the wall, and a gate that runs no tests owes nothing", () => {
  const r = kaal("traces", F("wall-has-no-plan"));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 1, `a wall with no plan was allowed: ${out}`);
  namesKind(out, "acceptance", "wall", "the test gate no plan is about");
  silentKind(out, "format", "wall", "a gate whose command runs no tests");
  // The other way a wall can be wrong: two plans claiming it. The finding
  // names the wall, because the pair is the fault and neither plan is.
  const two = kaal("traces", F("two-plans-one-wall"));
  const twoOut = said(two);
  assert.equal(two.status, 1, `two plans on one wall were allowed: ${twoOut}`);
  namesKind(twoOut, "acceptance", "wall", "the wall two plans are about");
});

test("4. a plan's suites are its wall's suites, counted as they match", () => {
  const wrong = kaal("traces", F("count-wrong"));
  const out = said(wrong);
  notUsage(out);
  assert.equal(wrong.status, 1, `a count that disagrees was allowed: ${out}`);
  const finding = ofKind(out, "acceptance", "plan").join("\n");
  assert.ok(finding, `no plan finding names the plan: ${out}`);
  assert.match(finding, /\b7\b/, `the number stated is not said: ${finding}`);
  assert.match(finding, /\b1\b/, `the number found is not said: ${finding}`);
  // A plan counting correctly over globs that are not its wall's is the
  // other half of the seam, and it says so in different words: the number is
  // right and the plan is about something else.
  const other = kaal("traces", F("wrong-suites"));
  const otherOut = said(other);
  assert.equal(
    other.status,
    1,
    `a plan documenting another wall's suites was allowed: ${otherOut}`,
  );
  namesKind(otherOut, "contracts", "plan", "the glob the plan carries");
});

test("5. the strategy roots the test tree, and the depth rule does not read it", () => {
  // The ask's own shape: a strategy and three plans hanging off it. Three of
  // four is over the share the depth rule refuses, so a silent board here is
  // the whole of the seam, and it says what no table read could: the shape
  // passes, whatever the rule is written over.
  const r = kaal("traces", F("the-shape"));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 0, `the ask's own shape was a finding: ${out}`);
  // And the root rule does read tests/, which is what says the exemption is
  // the depth rule alone and not the place.
  const bare = kaal("traces", F("root-unargued"));
  const bareOut = said(bare);
  assert.equal(
    bare.status,
    1,
    `an unargued root under tests/ was allowed: ${bareOut}`,
  );
  names(bareOut, "strategy", "the unargued root");
});
