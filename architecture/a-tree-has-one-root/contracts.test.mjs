// Contract tests for drawing a-tree-has-one-root. One per seam, numbered to
// match. Seam 1 reads the row as data and drives a crossing on a fixture;
// seams 2 to 5 drive the command on one fixture root per shape of forest, so
// no finding can be reported in another's words.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = (n) => join(HERE, "fixtures", n);
// Imported inside each seam: a namespace import saves a missing export, not
// a module that fails to load, and five seams would share one red.
const need = async (name) => {
  const mod = await import("../../bin/lib/traces.mjs");
  assert.ok(mod[name], `no ${name} export`);
  return mod[name];
};
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
// Findings that are not about an unrecognised kind. Before `parent` is in
// the table every fixture here reports "no such kind", and an exit code
// alone would make each of these tests green for a reason that has nothing
// to do with its seam.
const real = (out) => lines(out).filter((l) => !/no such kind/.test(l));
const isReal = (out, what) =>
  assert.ok(
    real(out).length,
    `the only findings were about an unrecognised kind (${what}): ${out}`,
  );

test("1. a parent resolves inside the declaring artefact's own tree", async () => {
  const KINDS = await need("KINDS");
  assert.ok(KINDS.parent, "the table has no parent row");
  // The row that reads more of the question than the others: it is handed
  // the artefact that declared it, so a drawing's parent and a
  // requirement's resolve in different places from the same name.
  const where = KINDS.parent.where;
  const asDrawing = where("alpha", { dir: "architecture", artefact: "beta" });
  const asRequirement = where("alpha", {
    dir: "requirements",
    artefact: "beta",
  });
  assert.notEqual(
    asDrawing,
    asRequirement,
    `parent resolved to one place for both trees: ${asDrawing}`,
  );
  assert.match(String(asDrawing), /architecture/, String(asDrawing));
  assert.match(String(asRequirement), /requirements/, String(asRequirement));
  // And a value that crosses is a finding whose words say the edge is
  // wrong, not that the name is missing: `alpha` exists, as a requirement.
  const r = kaal("traces", F("crosses"));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 1, `a parent crossing a tree was allowed: ${out}`);
  isReal(out, "crosses");
  assert.match(out, /\bbeta\b/, `the drawing is not named: ${out}`);
  assert.match(out, /parent/, `the kind is not named: ${out}`);
});

test("2. a cycle is a finding naming every artefact in the ring", () => {
  const r = kaal("traces", F("ring"));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 1, `a ring was allowed: ${out}`);
  isReal(out, "ring");
  assert.match(
    out,
    /cycle|ring|loop/i,
    `the finding does not say what it is: ${out}`,
  );
  // One finding naming the whole ring, not three findings naming one each.
  // Asserting the three names appear anywhere in the output passes on a
  // walk that stops at the first repeat, because every artefact starts its
  // own walk and the three single name findings between them say it all.
  const ring = real(out).find((l) =>
    ["one", "two", "three"].every((n) => new RegExp(`\\b${n}\\b`).test(l)),
  );
  assert.ok(ring, `no single finding names the whole ring: ${out}`);
  // A ring has no root, so reporting it as one sends a reader to write an
  // argument instead of breaking the ring.
  assert.doesNotMatch(
    out,
    /Root because/,
    `a ring was reported as a root: ${out}`,
  );
});

test("3. the trunk is one root, and any other root argues or is a finding", () => {
  const bare = kaal("traces", F("bare-root"));
  const a = said(bare);
  notUsage(a);
  assert.equal(bare.status, 1, `an unargued second root passed: ${a}`);
  isReal(a, "bare-root");
  assert.match(a, /\balpha\b/, `the second root is not named: ${a}`);
  // The argument is the whole difference: same shape, one line added.
  const argued = kaal("traces", F("argued-root"));
  assert.equal(
    argued.status,
    0,
    `an argued second root was reported: ${said(argued)}`,
  );
  // The trunk is a place, so a tree with none and a tree with two are both
  // findings, and neither reads like the unargued root above.
  const none = kaal("traces", F("no-trunk"));
  assert.equal(none.status, 1, `a tree with no trunk passed: ${said(none)}`);
  isReal(said(none), "no-trunk");
  const two = kaal("traces", F("two-trunks"));
  const t = said(two);
  assert.equal(two.status, 1, `a tree with two trunks passed: ${t}`);
  isReal(t, "two-trunks");
  assert.match(t, /charter|league/, `neither trunk is named: ${t}`);
});

test("4. a star is reported, a tree with depth is not", () => {
  const star = kaal("traces", F("star"));
  const out = said(star);
  notUsage(out);
  assert.equal(star.status, 1, `a star passed as a tree: ${out}`);
  isReal(out, "star");
  // The finding names the tree and both numbers, so a reader can disagree
  // with the share rather than only with the verdict.
  const line = lines(out).find((l) => /\b4\b/.test(l) && /\b5\b/.test(l));
  assert.ok(line, `the finding does not name both numbers: ${out}`);
  assert.match(
    line,
    /requirements/,
    `the finding does not name the tree: ${line}`,
  );
  const deep = kaal("traces", F("deep"));
  assert.equal(deep.status, 0, `a tree with depth was reported: ${said(deep)}`);
});

test("5. a drawing answers exactly one requirement, which is the edge across", () => {
  const none = kaal("traces", F("answers-none"));
  const a = said(none);
  notUsage(a);
  assert.equal(none.status, 1, `a drawing answering none passed: ${a}`);
  isReal(a, "answers-none");
  assert.match(a, /\balpha\b/, `the drawing is not named: ${a}`);
  const two = kaal("traces", F("answers-two"));
  const b = said(two);
  assert.equal(two.status, 1, `a drawing answering two passed: ${b}`);
  isReal(b, "answers-two");
  assert.match(b, /\bgamma\b/, `the drawing is not named: ${b}`);
  // Both names resolve, so this cannot arrive as a dangling name.
  assert.doesNotMatch(
    b,
    /is not at |resolves to nothing/i,
    `answering two was reported as a missing name: ${b}`,
  );
});
