// Contract tests for drawing a-trace-pins-what-it-read. One per seam,
// numbered to match. Seam 1 is driven with text, seam 2 differentially so
// no test recomputes the sha the module computes, seams 3 and 4 through the
// command on fixture roots. The writer runs on a copy: a test that leaves
// the repository dirty has changed what it was measuring.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, cpSync, mkdtempSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = (n) => join(HERE, "fixtures", n);
// Imported inside each seam. A namespace import saves a module missing an
// export; it does not save one that fails to load, and four seams would
// then share one red saying nothing about any of them.
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
  assert.doesNotMatch(out, /^usage: kaal/m, `the flag does not exist: ${out}`);
const copy = (name) => {
  const dir = join(mkdtempSync(join(tmpdir(), "kaal-pin-")), name);
  cpSync(F(name), dir, { recursive: true });
  return dir;
};
const SHA = /^[0-9a-f]{64}$/;

test("1. a value splits into a name and a pin, or a name and none", async () => {
  const splitTrace = await need("splitTrace");
  const one = splitTrace("alpha@" + "a".repeat(64));
  assert.deepEqual(
    one.map((e) => e.name),
    ["alpha"],
    "the name was not read off a pinned value",
  );
  assert.equal(one[0].pin, "a".repeat(64), "the pin was not read");
  // A list, and the liberties `Feeds:` already takes.
  const two = splitTrace("`beta`, gamma@" + "b".repeat(64) + ".");
  assert.deepEqual(
    two.map((e) => e.name),
    ["beta", "gamma"],
    JSON.stringify(two),
  );
  assert.equal(two[0].pin, null, "an unpinned name grew a pin");
  assert.equal(two[1].pin, "b".repeat(64), "the second name lost its pin");
  // `nothing` yields no entries, so it can never carry one.
  assert.deepEqual(splitTrace("nothing"), [], "nothing produced an entry");
  assert.deepEqual(splitTrace(""), [], "an empty value produced an entry");
  assert.equal(splitTrace.length, 1, "the splitter takes a second argument");
});

test("2. the sha is of the region the row names, and of nothing else", async () => {
  const regionSha = await need("regionSha");
  const KINDS = await need("KINDS");
  // The rows carry a region. A requirement's is a section; a principle's is
  // the whole file, which is what having no region means.
  const row = (k) =>
    KINDS[k] ??
    (Array.isArray(KINDS)
      ? KINDS.find((r) => (r.kind ?? r.name) === k)
      : undefined);
  assert.ok(row("requirement"), "no requirement row");
  assert.match(
    JSON.stringify(row("requirement")),
    /Acceptance criteria/,
    `the requirement row names no region: ${JSON.stringify(row("requirement"))}`,
  );
  const dir = copy("to-write");
  const before = regionSha(dir, "requirement", "alpha");
  assert.match(before, SHA, `not a sha: ${before}`);
  const p = join(dir, "requirements", "alpha", "requirement.md");
  // Outside the region: the 45 in 47 the runs found. A status flipping to
  // closed must not invalidate a drawing that answered the criteria.
  const t = readFileSync(p, "utf8");
  writeFileSync(p, t.replace("- Status: closed", "- Status: open"));
  assert.equal(
    regionSha(dir, "requirement", "alpha"),
    before,
    "an edit outside the pinned region moved the sha",
  );
  // Inside it: the 2 in 47, and the only case worth reporting.
  const t2 = readFileSync(p, "utf8");
  writeFileSync(
    p,
    t2.replace("1. The fixture holds.", "1. The fixture holds differently."),
  );
  assert.notEqual(
    regionSha(dir, "requirement", "alpha"),
    before,
    "an edit inside the pinned region did not move the sha",
  );
  // A name that is not there is null, never a throw and never a sha.
  assert.equal(regionSha(dir, "requirement", "nobody-wrote-this"), null);
});

test("3. a stale pin and a dangling name are reported in different words", async () => {
  const stale = kaal("traces", F("stale"));
  const out = said(stale);
  notUsage(out);
  // The same assertion the acceptance test dropped in #157, carried here and
  // missed: criterion 2 asks for the report and its words and says nothing
  // about an exit code, and `a-pin-says-who-cleared-it` supersedes the
  // criterion that made a stale pin a failure. It is a state with an owner
  // there and its second criterion owns what this command exits with.
  //
  // It stayed invisible for a day because this task's run record went stale
  // the same morning, so both walls read the suite as not delivered rather
  // than regressed. One record per task, read by two walls, about one of the
  // two suites, and a fresh record is the only thing that tells an unbuilt
  // task from a broken one.
  for (const [what, re] of [
    ["the artefact", /alpha/],
    ["the kind", /requirement/],
    ["the region", /Acceptance criteria/],
    ["that the text moved", /moved|changed|no longer/i],
  ])
    assert.match(out, re, `${what} is not in the finding: ${out}`);
  // The name resolves, so reporting it as missing sends a reader to rename
  // a file that is exactly where it should be.
  assert.doesNotMatch(
    out,
    /is not at |resolves to nothing/i,
    `a stale pin was reported as a missing name: ${out}`,
  );
  // Both at once, told apart by their words and not only their fields.
  const both = said(kaal("traces", F("both")));
  const lines = both.split("\n").filter((l) => l.trim());
  const s = lines.filter((l) => /Acceptance criteria/.test(l));
  const d = lines.filter((l) => /a-principle-nobody-wrote/.test(l));
  assert.equal(s.length, 1, `expected one line about the pin: ${both}`);
  assert.equal(d.length, 1, `expected one finding about the name: ${both}`);
  assert.match(s[0], /moved|changed|no longer/i, s[0]);
  assert.doesNotMatch(d[0], /moved|changed|no longer/i, d[0]);
});

test("4. the writer pins what resolves, changes nothing else, and repeats", () => {
  const clean = kaal("traces", F("unpinned"));
  assert.equal(
    clean.status,
    0,
    `an unpinned trace was reported: ${said(clean)}`,
  );

  const dir = copy("to-write");
  const rel = join("architecture", "alpha", "drawing.md");
  const before = readFileSync(join(dir, rel), "utf8");
  const first = kaal("traces", dir, "--write");
  notUsage(said(first));
  assert.equal(first.status, 0, `the writer refused: ${said(first)}`);
  const after = readFileSync(join(dir, rel), "utf8");
  // Only the trace lines moved, compared line by line so a reformatted page
  // that still parses is still a failure.
  const [b, a] = [before.split("\n"), after.split("\n")];
  assert.equal(b.length, a.length, "the writer added or removed lines");
  const moved = b.map((l, i) => [i, l, a[i]]).filter(([, l, m]) => l !== m);
  assert.ok(moved.length >= 1, "the writer wrote no pin at all");
  for (const [, was, now] of moved) {
    assert.match(
      was,
      /^\s+(requirement|principles):/,
      `changed a line that is not a trace: ${was}`,
    );
    assert.match(now, /@[0-9a-f]{64}\b/, `no pin written: ${now}`);
  }
  // What it wrote is what the checker accepts, which is the only way the
  // two halves are proven to agree.
  const checked = kaal("traces", dir);
  assert.equal(
    checked.status,
    0,
    `the writer's own output is red: ${said(checked)}`,
  );
  // A name that does not resolve is left as it is. Without this the
  // writer may stamp `name@null` on it, and the isolation that removed the
  // guard reddened nothing at all, which is a question and not an answer.
  const dang = copy("write-dangling");
  kaal("traces", dang, "--write");
  const line = readFileSync(join(dang, rel), "utf8")
    .split("\n")
    .find((l) => /^\s+principles:/.test(l));
  assert.equal(
    line.trim(),
    "principles: a-principle-nobody-wrote",
    `the writer pinned a name that resolves to nothing: ${line}`,
  );
  // Idempotent: a second run on its own output writes nothing.
  const second = kaal("traces", dir, "--write");
  assert.equal(second.status, 0, `the second run refused: ${said(second)}`);
  assert.equal(
    readFileSync(join(dir, rel), "utf8"),
    after,
    "the writer is not idempotent",
  );
});
