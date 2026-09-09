// Acceptance tests for requirement a-trace-pins-what-it-read. One per
// criterion. Surface only: `kaal traces` on fixture roots, the pages as
// text, and the writer run on a copy so the repository is never written to.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, cpSync, mkdtempSync, globSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
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
// A finding and a usage error share an exit code, so a run that never
// reached the command would satisfy every status assertion below.
const notUsage = (out) =>
  assert.doesNotMatch(
    out,
    /^usage: kaal/m,
    `the command does not exist: ${out}`,
  );
const traces = (rel, root = ROOT) => {
  const b = readFileSync(join(root, rel), "utf8").match(
    /^---\r?\n([\s\S]*?)\r?\n---\r?\n/,
  )?.[1];
  const m = b?.match(/^traces:\s*$\n((?:[ \t]+\S.*\n?)*)/m);
  if (!m) return {};
  return Object.fromEntries(
    m[1]
      .split("\n")
      .map((l) => l.match(/^\s+([A-Za-z_][\w-]*):\s*(.*)$/))
      .filter(Boolean)
      .map((kv) => [kv[1], kv[2].trim()]),
  );
};
const PIN = /@[0-9a-f]{64}\b/;
// The writer is run on a copy, never on the fixture: a test that leaves the
// repository dirty has changed the thing it was measuring.
const copy = (name) => {
  const dir = join(mkdtempSync(join(tmpdir(), "kaal-pins-")), name);
  cpSync(F(name), dir, { recursive: true });
  return dir;
};

test("1. a value is a name or a name and a pin, and the table names the region", () => {
  // Read from the surface the build must produce: the drawing template says
  // what a trace looks like, and the surface page says what is pinned.
  const tmpl = readFileSync(
    join(ROOT, "skills", "architect", "references", "drawing.md"),
    "utf8",
  );
  assert.match(
    tmpl,
    /<name>@<sha>|name@sha/,
    "the drawing template does not offer a pinned trace",
  );
  const surface = readFileSync(join(ROOT, "SURFACE.md"), "utf8");
  const entry = surface
    .split(/\n(?=#{2,3} )/)
    .find((s) => /^#{2,3} .*\btraces\b/m.test(s));
  assert.ok(entry, "SURFACE.md has no traces entry");
  // Each kind's region, named where a caller can read it. The requirement's
  // is a section; a principle's is the whole file.
  assert.match(
    entry,
    /Acceptance criteria/,
    `the region pinned for a requirement is not named: ${entry}`,
  );
  assert.match(
    entry,
    /whole file|entire file|the file/i,
    `the region pinned for a principle is not named: ${entry}`,
  );
});

test("2. a pin that no longer matches is a finding naming what moved", () => {
  const r = kaal("traces", F("stale"));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 1, `a stale pin was allowed: ${out}`);
  for (const [what, re] of [
    ["the artefact", /\bt\b/],
    ["the kind", /requirement/],
    ["the region", /Acceptance criteria/],
    ["that the text moved", /moved|changed|no longer/i],
  ])
    assert.match(out, re, `${what} is not in the finding: ${out}`);
  // The name resolves. Reporting it as missing would send a reader to fix
  // the wrong thing.
  assert.doesNotMatch(
    out,
    /no requirements\/t|does not exist|resolves to nothing/i,
    `a stale pin was reported as a missing name: ${out}`,
  );
});

test("3. a stale pin and a dangling name are two findings in different words", () => {
  const r = kaal("traces", F("both"));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 1, `neither was reported: ${out}`);
  const lines = out.split("\n").filter((l) => l.trim());
  const stale = lines.filter((l) => /Acceptance criteria/.test(l));
  const dangling = lines.filter((l) => /a-principle-nobody-wrote/.test(l));
  assert.equal(stale.length, 1, `expected one pin finding: ${out}`);
  assert.equal(dangling.length, 1, `expected one name finding: ${out}`);
  // Different words, each asserted on its own. Two findings that read the
  // same tell a reader nothing about which fix each one wants.
  assert.match(stale[0], /moved|changed|no longer/i, stale[0]);
  assert.doesNotMatch(dangling[0], /moved|changed|no longer/i, dangling[0]);
});

test("4. a trace with no pin, and one naming nothing, are not findings", () => {
  const r = kaal("traces", F("unpinned"));
  const out = said(r);
  assert.equal(r.status, 0, `an unpinned trace was reported: ${out}`);
  // And the fixture still says what it was built to say, or this test has
  // been passing on a tree that stopped exercising the case.
  assert.equal(
    traces("architecture/t/drawing.md", F("unpinned")).requirement,
    "t",
  );
  assert.equal(
    traces("requirements/t/requirement.md", F("unpinned")).supersedes,
    "nothing",
  );
});

test("5. the writer pins what it can resolve, changes nothing else, and repeats", () => {
  const dir = copy("to-write");
  const rel = "architecture/t/drawing.md";
  const before = readFileSync(join(dir, rel), "utf8");
  const first = kaal("traces", dir, "--write");
  notUsage(said(first));
  assert.equal(first.status, 0, `the writer refused: ${said(first)}`);
  const after = readFileSync(join(dir, rel), "utf8");
  assert.match(
    traces(rel, dir).requirement,
    new RegExp(`^t${PIN.source}$`),
    `the trace was not pinned: ${traces(rel, dir).requirement}`,
  );
  // Nothing else on the page. Compared line by line, so a reformatted page
  // that happens to still parse is still a failure.
  const [b, a] = [before.split("\n"), after.split("\n")];
  assert.equal(b.length, a.length, "the writer added or removed lines");
  const moved = b.map((l, i) => [i, l, a[i]]).filter(([, l, m]) => l !== m);
  assert.equal(
    moved.length,
    1,
    `more than the pin changed: ${JSON.stringify(moved)}`,
  );
  assert.match(moved[0][1], /^\s+requirement: t$/, moved[0][1]);
  // Idempotent: a second run on its own output writes nothing.
  const second = kaal("traces", dir, "--write");
  assert.equal(second.status, 0, `the second run refused: ${said(second)}`);
  assert.equal(
    readFileSync(join(dir, rel), "utf8"),
    after,
    "the writer is not idempotent",
  );
});

test("6. every trace in this tree that can carry a pin carries a current one", () => {
  const r = kaal("traces", ROOT);
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 0, `the league's own traces are not current: ${out}`);
  // The command answering is not the same as the tree being pinned: a
  // reader that never looked for a pin would also answer. So count them,
  // read as text, without recomputing a sha here.
  const pinned = [
    ...globSync("requirements/*/requirement.md", { cwd: ROOT }),
    ...globSync("architecture/*/drawing.md", { cwd: ROOT }),
  ].filter((p) => Object.values(traces(p)).some((v) => PIN.test(v)));
  assert.ok(
    pinned.length >= 12,
    `only ${pinned.length} artefacts carry a pin; the tree has 48 drawings`,
  );
});
