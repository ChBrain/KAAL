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
const DRAW_TEMPLATE = join(
  ROOT,
  "skills",
  "architect",
  "references",
  "drawing.md",
);
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const drawings = () =>
  globSync("architecture/*/drawing.md", { cwd: ROOT }).sort();
// The `requirement` kind runs across trees and `parent` runs down one, so a
// drawing parented to its own requirement has confused the two.
const requirementOf = (text) => {
  const b = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)?.[1];
  const m = b?.match(/^traces:\s*$\n((?:[ \t]+\S.*\n?)*)/m);
  return (m?.[1].match(/^\s+requirement:\s*(.*)$/m)?.[1] ?? "")
    .trim()
    .split("@")[0];
};
const pages = () =>
  globSync("requirements/*/requirement.md", { cwd: ROOT }).sort();

test("1. parent is a kind, both templates offer it, and it never runs across", () => {
  for (const [what, tpl] of [
    ["the analyst's template", TEMPLATE],
    ["the drawing template", DRAW_TEMPLATE],
  ])
    assert.ok(
      parentOf(readFileSync(tpl, "utf8")) !== null,
      `${what} does not offer a parent`,
    );
  // A declared parent resolves inside its own tree. Populating a tree is the
  // seat's work, so this asks nothing of an artefact that declares none yet.
  const declared = (files) =>
    files.filter((p) => {
      const v = parentOf(read(p));
      return v && !/^none$/i.test(v);
    });
  for (const [tree, files, dir] of [
    ["requirements", pages(), "requirements"],
    ["architecture", drawings(), "architecture"],
  ])
    for (const p of declared(files)) {
      const v = parentOf(read(p));
      assert.ok(
        globSync(`${dir}/*/`, { cwd: ROOT }).some(
          (d) => d.replace(/\/$/, "").split("/").pop() === v,
        ),
        `${p}: parent ${v} is not in the ${tree} tree`,
      );
    }
  // And never the edge that runs across: a drawing parented to its own
  // requirement flattens architecture into a mirror of requirements.
  const flattened = declared(drawings()).filter(
    (p) => parentOf(read(p)) === requirementOf(read(p)),
  );
  assert.deepEqual(
    flattened,
    [],
    `a drawing is parented to its own requirement: ${flattened.join(", ")}`,
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
  // Not any finding: this one. Before `parent` was a kind the table knew,
  // every fixture here tripped "no such kind" and the exit code alone made
  // this test green for a reason that had nothing to do with the criterion.
  const lines = out
    .split("\n")
    .filter((l) => l.trim() && !/no such kind/.test(l));
  assert.ok(
    lines.length,
    `the only findings were about an unrecognised kind: ${out}`,
  );
  assert.ok(
    lines.some((l) => /\ba\b/.test(l)),
    `the drawing is not named: ${out}`,
  );
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

test("6. a trunk in kaal/, and it is the only artefact declaring none", () => {
  const candidates = [
    ...pages(),
    ...drawings(),
    ...globSync("kaal/**/*.md", { cwd: ROOT }),
    ...globSync("tests/**/*.md", { cwd: ROOT }),
  ];
  const roots = candidates.filter((p) => {
    const v = parentOf(read(p));
    return v !== null && /^none$/i.test(v);
  });
  assert.equal(
    roots.length,
    1,
    `expected one trunk and found ${roots.length}: ${roots.join(", ") || "none"}`,
  );
  // It belongs to no tree, which is why all three can answer to it.
  assert.match(
    roots[0],
    /^kaal\//,
    `the trunk is not under kaal/: ${roots[0]}`,
  );
});

test("7. this tree is one tree: rooted, acyclic, argued where it forks", () => {
  const r = kaal("traces", ROOT);
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 0, `the league is not yet one tree: ${out}`);
  // Answering is not the same as having a shape: a reader that never looked
  // for a parent would also answer. So the shape is read here as text, and
  // it must not be a star either.
  const roots = [
    ...globSync("kaal/*.md", { cwd: ROOT }),
    ...pages(),
    ...drawings(),
  ].filter((p) => /^none$/i.test(parentOf(read(p)) ?? ""));
  assert.equal(
    roots.length,
    1,
    `expected one root and found ${roots.length}: ${roots.join(", ") || "none"}`,
  );
  assert.match(roots[0], /^kaal\//, `the root is not the trunk: ${roots[0]}`);
  // Not a star either. Each tree is measured against its own root, and a
  // tree whose seat has not populated it yet has none, which is silence
  // rather than a shape.
  for (const [dir, files] of [
    ["requirements", pages()],
    ["architecture", drawings()],
  ]) {
    const treeRoot = files.find((p) => /^none$/i.test(parentOf(read(p)) ?? ""));
    if (!treeRoot) continue;
    const name = treeRoot.split("/")[1];
    const on = files.filter((p) => parentOf(read(p)) === name).length;
    assert.ok(
      on <= files.length / 2,
      `${on} of ${files.length} in ${dir} hang off ${name}; that is a star`,
    );
  }
});
