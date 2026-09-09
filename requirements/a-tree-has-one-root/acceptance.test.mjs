// Acceptance tests for requirement a-tree-has-one-root. One per criterion.
// Surface only: the requirement pages as text, the analyst's template, and
// `kaal traces` run on fixture roots that are each one shape of forest.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, globSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = (n) => join(HERE, "fixtures", n);
const TEMPLATE = join(
  ROOT,
  "skills",
  "analyse",
  "references",
  "requirement.md",
);
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
  });
const said = (r) => r.stdout + r.stderr;
// A finding and a usage error share an exit code, so a run that never
// reached the command would satisfy every status assertion below.
const notUsage = (out) =>
  assert.doesNotMatch(
    out,
    /^usage: kaal/m,
    `the command does not exist: ${out}`,
  );
const parentOf = (text) => {
  const b = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)?.[1];
  const m = b?.match(/^traces:\s*$\n((?:[ \t]+\S.*\n?)*)/m);
  return m?.[1].match(/^\s+parent:\s*(.*)$/m)?.[1].trim() ?? null;
};
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const pages = () =>
  globSync("requirements/*/requirement.md", { cwd: ROOT }).sort();

test("1. every requirement names its parent, and the template offers it", () => {
  const all = pages();
  assert.ok(all.length >= 50, `found ${all.length} requirements`);
  const without = all.filter((p) => !parentOf(read(p)));
  assert.deepEqual(without, [], `no parent: ${without.slice(0, 6).join(", ")}`);
  // A value is a name or `none`, never a sentence.
  for (const p of all) {
    const v = parentOf(read(p));
    if (/^none$/i.test(v)) continue;
    assert.match(v, /^[a-z0-9][a-z0-9-]*$/, `${p}: "${v}" is not a task name`);
  }
  assert.ok(
    parentOf(readFileSync(TEMPLATE, "utf8")) !== null,
    "the analyst's template does not offer a parent",
  );
});

test("2. a second root with no argument is a finding; an argued one is not", () => {
  const bare = kaal("traces", F("two-roots"));
  const out = said(bare);
  notUsage(out);
  assert.equal(bare.status, 1, `two unargued roots were allowed: ${out}`);
  // The roots are named. Which of the two is the trunk is nobody's to
  // decide here, so both being named is the honest report.
  assert.match(out, /\ba\b/, `the first root is not named: ${out}`);
  assert.match(out, /\bb\b/, `the second root is not named: ${out}`);
  // And an argument is enough. The board reads that it argued and never
  // what the argument says, which is the rule the People line already sets.
  const ok = kaal("traces", F("argued"));
  assert.equal(ok.status, 0, `an argued second root was reported: ${said(ok)}`);
});

test("3. a cycle among parents is a finding naming the ring", () => {
  const r = kaal("traces", F("cycle"));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 1, `a cycle was allowed: ${out}`);
  assert.match(
    out,
    /cycle|ring|loop/i,
    `the finding does not say what it is: ${out}`,
  );
  for (const n of ["a", "b"])
    assert.match(
      out,
      new RegExp(`\\b${n}\\b`),
      `${n} is not in the ring: ${out}`,
    );
  // A cycle has no root, so reporting it as a missing trunk would send a
  // reader to write an argument instead of breaking the ring.
  assert.doesNotMatch(
    out,
    /Root because/,
    `a cycle was reported as a root: ${out}`,
  );
});

test("4. a drawing answering none or more than one requirement is a finding", () => {
  const r = kaal("traces", F("two-answers"));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 1, `a drawing answering two was allowed: ${out}`);
  assert.match(out, /\ba\b/, `the drawing is not named: ${out}`);
  // Both requirements resolve, so this cannot arrive as a dangling name.
  assert.doesNotMatch(
    out,
    /resolves to nothing|no requirements\//i,
    `answering two was reported as a missing name: ${out}`,
  );
});

test("5. a star is reported, and a tree with depth is not", () => {
  const star = kaal("traces", F("star"));
  const out = said(star);
  notUsage(out);
  assert.equal(star.status, 1, `a star passed as a tree: ${out}`);
  assert.match(out, /root/i, `the finding does not name the trunk: ${out}`);
  const deep = kaal("traces", F("deep"));
  assert.equal(deep.status, 0, `a tree with depth was reported: ${said(deep)}`);
});

test("6. this tree is one tree: rooted, acyclic, argued where it forks", () => {
  const r = kaal("traces", ROOT);
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 0, `the league is not yet one tree: ${out}`);
  // Answering is not the same as having a shape: a reader that never looked
  // for a parent would also answer. So the shape is read here as text, and
  // it must not be a star either.
  const roots = pages().filter((p) => /^none$/i.test(parentOf(read(p)) ?? ""));
  assert.ok(roots.length >= 1, "no root at all");
  const trunk = roots[0].split("/")[1];
  const onTrunk = pages().filter((p) => parentOf(read(p)) === trunk);
  assert.ok(
    onTrunk.length < pages().length / 2,
    `${onTrunk.length} of ${pages().length} requirements hang off the trunk; that is a star`,
  );
});
