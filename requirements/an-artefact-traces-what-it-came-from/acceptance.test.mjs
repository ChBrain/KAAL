// Acceptance tests for requirement an-artefact-traces-what-it-came-from.
// One per criterion. Surface only: the pages as text, the two templates, the
// surface page, and `kaal traces` run on fixture roots.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, globSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = (n) => join(HERE, "fixtures", n);
const REQ_TEMPLATE = join(
  ROOT,
  "skills",
  "analyse",
  "references",
  "requirement.md",
);
const DRAW_TEMPLATE = join(
  ROOT,
  "skills",
  "architect",
  "references",
  "drawing.md",
);

// The league's own artefacts, one directory deep. A fixture lives under
// requirements/<task>/fixtures/, so the single star excludes them.
const artefacts = () =>
  [
    ...globSync("requirements/*/requirement.md", { cwd: ROOT }),
    ...globSync("architecture/*/drawing.md", { cwd: ROOT }),
  ].sort();
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const block = (text) => text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)?.[1];
// The traces map read from the block alone, so no sentence further down the
// page can answer for it. Sub keys are the indented lines beneath `traces:`.
const traces = (text) => {
  const b = block(text);
  if (!b) return null;
  const m = b.match(/^traces:\s*$\n((?:[ \t]+\S.*\n?)*)/m);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^\s+([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
};
const names = (v) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim().replace(/^`|`$|\.$/g, ""))
    .filter((s) => s && !/^nothing$/i.test(s));
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
  });
const said = (r) => r.stdout + r.stderr;
// A finding and a usage error share an exit code, so a run that never
// reached the command would satisfy every status assertion below. Each
// finding test asserts it was the wall talking.
const notUsage = (out) =>
  assert.doesNotMatch(
    out,
    /^usage: kaal/m,
    `the command does not exist: ${out}`,
  );

test("1. every requirement and drawing, and both templates, carry a traces map", () => {
  const all = artefacts();
  assert.ok(all.length >= 100, `found ${all.length} artefacts`);
  const bad = all.filter((p) => traces(read(p)) === null);
  assert.deepEqual(bad, [], `no traces map: ${bad.slice(0, 6).join(", ")}`);
  for (const [what, p] of [
    ["the analyst's template", REQ_TEMPLATE],
    ["the drawing template", DRAW_TEMPLATE],
  ])
    assert.notEqual(
      traces(readFileSync(p, "utf8")),
      null,
      `${what} carries no traces map`,
    );
});

test("2. the command answers a tree whose traces resolve, and the page names it", () => {
  const ok = kaal("traces", F("clean"));
  assert.equal(ok.status, 0, `a clean tree was refused: ${said(ok)}`);
  // Not this tree's question is the third code, and the reason is its own.
  const elsewhere = kaal("traces", join(HERE, "fixtures"));
  assert.equal(
    elsewhere.status,
    2,
    `answered a tree it cannot read: ${said(elsewhere)}`,
  );
  // The usage line and the surface page, which criterion 4 of
  // the-surface-is-written-down binds to each other.
  assert.match(said(kaal("nonsense")), /traces/, "the usage line omits traces");
  const surface = read("SURFACE.md");
  const entry = surface
    .split(/\n(?=#{2,3} )/)
    .find((s) => /^#{2,3} .*\btraces\b/m.test(s));
  assert.ok(entry, "SURFACE.md has no traces entry");
  for (const [what, re] of [
    ["what it answers", /answer|report|resolv/i],
    ["what it reads", /frontmatter|traces|artefact/i],
    ["its exit codes", /\b0\b[\s\S]*\b1\b[\s\S]*\b2\b/],
  ])
    assert.match(entry, re, `the traces entry does not say ${what}: ${entry}`);
});

test("3. a name that resolves to nothing is a finding, for either artefact", () => {
  const r = kaal("traces", F("dangling"));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 1, `a dangling trace was allowed: ${out}`);
  // Both artefact kinds, each asserted on its own: one fixture holds a
  // requirement and a drawing, so a reader that knows only one is red here.
  for (const [what, re] of [
    ["the requirement's kind", /supersedes/],
    ["the requirement's name", /a-task-nobody-wrote/],
    ["the drawing's kind", /principles/],
    ["the drawing's name", /a-principle-nobody-wrote/],
  ])
    assert.match(out, re, `${what} is not in the findings: ${out}`);
});

test("4. a kind the table does not know is a finding, never a silence", () => {
  const r = kaal("traces", F("unknown-kind"));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 1, `an unknown kind passed in silence: ${out}`);
  assert.match(out, /invented/, `the kind is not named: ${out}`);
});

test("5. no block and no map are findings; nothing is an ordinary value", () => {
  const r = kaal("traces", F("no-block"));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 1, `an artefact with no frontmatter passed: ${out}`);
  assert.match(out, /\bt\b/, `the artefact is not named: ${out}`);
  assert.match(
    out,
    /traces/i,
    `the finding does not say what is missing: ${out}`,
  );
  // And the clean tree above carries `supersedes: nothing`, so a kind that
  // names nothing is not a finding. Asserted here rather than in test 2, so
  // the value and the command's answer fail apart.
  assert.deepEqual(
    names(
      traces(
        readFileSync(
          join(F("clean"), "requirements", "t", "requirement.md"),
          "utf8",
        ),
      ).supersedes,
    ),
    [],
    "the clean fixture no longer exercises a kind valued nothing",
  );
});

test("6. the prose stays, and carries every name the trace declares", () => {
  // The board holds it, not only this run. Without this the criterion is
  // true on the day the tree is migrated and true of nothing afterwards.
  const r = kaal("traces", F("silent-prose"));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 1, `a name the prose drops was allowed: ${out}`);
  assert.match(out, /\bt\b/, `the requirement is not named: ${out}`);
  // The declared name is the one missing from the prose, and `t` resolves,
  // so this cannot be the criterion 3 finding under another name.
  assert.doesNotMatch(
    out,
    /something-else/,
    `the wall read a name out of the prose: ${out}`,
  );

  const named = globSync("requirements/*/requirement.md", { cwd: ROOT })
    .sort()
    .map((p) => [p, names(traces(read(p))?.supersedes)])
    .filter(([, ns]) => ns && ns.length);
  assert.ok(
    named.length >= 12,
    `only ${named.length} requirements trace a supersede; the runs found 12`,
  );
  for (const [p, ns] of named) {
    const line = read(p).match(/^- Supersedes: (.+)$/m);
    assert.ok(line, `${p}: the Handoff has no Supersedes line`);
    for (const n of ns)
      assert.ok(line[1].includes(n), `${p}: the prose does not carry ${n}`);
    // The prose, not the name. A line that is only the names repeats the
    // trace and says nothing a reader could not already compute, so the
    // words that made it worth keeping have to still be there.
    const rest = line[1].replace(/`?[a-z0-9-]+`?/g, "").replace(/[.,;:]/g, "");
    assert.ok(
      rest.trim().length > 0,
      `${p}: the Supersedes line is bare names; which claim moved?`,
    );
  }
});
