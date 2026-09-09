// Contract tests for drawing an-artefact-traces-what-it-came-from. One per
// seam, numbered to match. Seam 1 is driven with text alone, seams 2 and 3
// through the module on fixture roots, seam 4 through the command. Fixture
// roots only: the league's own 103 artefacts move on every task.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = (n) => join(HERE, "fixtures", n);
// Imported inside each seam, not at the top. A namespace import saves a
// module that is missing an export; it does not save a module that does not
// exist yet, and a top level import of one fails the whole file to load so
// that four seams share one red saying nothing about any of them.
const need = async (name) => {
  let mod;
  try {
    mod = await import("../../bin/lib/traces.mjs");
  } catch (e) {
    assert.fail(`no bin/lib/traces.mjs: ${e.message}`);
  }
  assert.ok(mod[name], `no ${name} export`);
  return mod[name];
};
const block = (...lines) => `---\n${lines.join("\n")}\n---\n\n# Page\n`;
const findings = async (root) => (await need("checkTraces"))(root);
const rules = async (root) =>
  (await findings(root))
    .map((f) => `${f.artefact ?? f.task}:${f.kind ?? f.rule ?? ""}`)
    .sort();
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
  });

test("1. three cases the reader keeps apart, and the three ways of naming nothing", async () => {
  const readTrace = await need("readTrace");
  // A map. Collapsing any two of these three loses criterion 5.
  assert.deepEqual(
    readTrace(block("traces:", "  supersedes: a, b")),
    { supersedes: "a, b" },
    "the map was not read",
  );
  // A block with no traces key is an empty map, not a missing block.
  assert.deepEqual(
    readTrace(block("name: something")),
    {},
    "a block without traces was read as no block",
  );
  // No block at all is null.
  assert.equal(
    readTrace("# Page\n\nNo block here.\n"),
    null,
    "a page with no block was read as an empty map",
  );
  // Text in, map out: handed a page and never a root.
  assert.equal(readTrace.length, 1, "the reader takes a second argument");
});

test("2. every kind is a row, an unknown kind is a finding, and nothing resolves nothing", async () => {
  const KINDS = await need("KINDS");
  // A table, read as data. A rule per kind is the shape this task refuses.
  const names = Array.isArray(KINDS)
    ? KINDS.map((k) => k.kind ?? k.name)
    : Object.keys(KINDS);
  assert.deepEqual(
    [...names].sort(),
    ["principles", "requirement", "supersedes"],
    `the table's rows are not the three kinds: ${names.join(", ")}`,
  );
  // A tree where everything resolves says nothing, including a kind valued
  // `nothing` and a drawing whose principle exists.
  assert.deepEqual(
    await findings(F("clean")),
    [],
    "a clean tree produced findings",
  );
  // And one finding of each kind, each asserted on its own, on a tree that
  // holds one of every defect. An alternation would pass on a reader that
  // reports only the first.
  const said = JSON.stringify(await findings(F("findings")));
  for (const [what, re] of [
    ["a name that resolves to nothing", /a-task-nobody-wrote/],
    ["the kind of that name", /supersedes/],
    ["a kind the table does not know", /invented/],
    ["a requirement with no block", /blockless/],
    ["a drawing with no block", /noblock/],
  ])
    assert.match(said, re, `${what} is not reported: ${said}`);
  // An unknown kind is never a silence: the artefact that carries it is
  // named, and it is not the same artefact as any other finding's.
  const rs = await rules(F("findings"));
  assert.ok(
    rs.some((r) => r.startsWith("unknownkind:")),
    `the artefact carrying the unknown kind is not named: ${rs.join(" | ")}`,
  );
});

test("3. the prose must carry every declared name, read one direction only", async () => {
  const said = JSON.stringify(await findings(F("findings")));
  // `silent` declares `dangling`, which resolves, and its prose names
  // something else. So this cannot arrive as the unresolved name finding.
  // Every fixture name is long enough that none is a substring of another:
  // a task called `t` is inside "something-else" and the check would pass
  // on a letter.
  assert.match(said, /silent/, `the requirement is not named: ${said}`);
  const forSilent = (await findings(F("findings"))).filter((f) =>
    JSON.stringify(f).includes("silent"),
  );
  assert.ok(forSilent.length, "no finding for a prose that drops a name");
  assert.ok(
    forSilent.some((f) => JSON.stringify(f).includes("dangling")),
    `the name the prose does not carry is not named: ${JSON.stringify(forSilent)}`,
  );
  // One direction only: `clean`'s prose says more than the trace declares
  // and that is not a finding, or the rule is parsing English.
  assert.deepEqual(
    await findings(F("clean")),
    [],
    "the prose was read backwards",
  );
});

test("4. the command answers, finds, and refuses a tree that is not its own", () => {
  const ok = kaal("traces", F("clean"));
  assert.equal(
    ok.status,
    0,
    `a clean tree was refused: ${ok.stdout}${ok.stderr}`,
  );
  const bad = kaal("traces", F("findings"));
  const out = bad.stdout + bad.stderr;
  assert.doesNotMatch(
    out,
    /^usage: kaal/m,
    `the command does not exist: ${out}`,
  );
  assert.equal(bad.status, 1, `findings did not become an exit code: ${out}`);
  assert.match(out, /a-task-nobody-wrote/, out);
  // Not this tree's question is the third code, and its reason is its own.
  const elsewhere = kaal("traces", HERE);
  assert.equal(
    elsewhere.status,
    2,
    `answered a tree it cannot read: ${elsewhere.stdout}${elsewhere.stderr}`,
  );
});
