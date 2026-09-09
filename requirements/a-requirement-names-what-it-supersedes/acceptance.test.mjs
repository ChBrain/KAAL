// Acceptance tests for requirement a-requirement-names-what-it-supersedes.
// One per criterion. Surface only: the requirement pages as text, the
// analyst's template, and `kaal acceptance` run on fixture requirements.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, globSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const F = join(HERE, "fixtures");
const TEMPLATE = join(
  ROOT,
  "skills",
  "analyse",
  "references",
  "requirement.md",
);

// The league's own requirements, one directory deep. A fixture lives under
// requirements/<task>/fixtures/, so the glob's single star excludes them and
// no filter by name is needed.
const pages = () =>
  globSync("requirements/*/requirement.md", { cwd: ROOT }).sort();
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const block = (text) => text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)?.[1];
// The value of a frontmatter key, read from the block alone so no sentence
// further down the page can answer for it.
const key = (text, k) => {
  const b = block(text);
  return b
    ? (b.match(new RegExp(`^${k}:\\s*(.*)$`, "m"))?.[1].trim() ?? null)
    : null;
};
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
  });
const acceptance = (fixture) =>
  kaal("acceptance", join(F, fixture, "acceptance.test.mjs"));

test("1. every requirement and the template open with a block carrying supersedes", () => {
  const all = pages();
  assert.ok(all.length >= 50, `found ${all.length} requirements`);
  const without = all.filter((p) => !block(read(p)));
  assert.deepEqual(without, [], `no frontmatter block: ${without.join(", ")}`);
  const noKey = all.filter((p) => key(read(p), "supersedes") === null);
  assert.deepEqual(noKey, [], `no supersedes key: ${noKey.join(", ")}`);
  const tmpl = readFileSync(TEMPLATE, "utf8");
  assert.ok(block(tmpl), "the analyst's template has no frontmatter block");
  assert.notEqual(
    key(tmpl, "supersedes"),
    null,
    "the template's block has no supersedes key",
  );
});

test("2. the value is names or nothing, and never a sentence", () => {
  for (const p of pages()) {
    const v = key(read(p), "supersedes");
    assert.ok(v, `${p}: the supersedes value is empty`);
    if (/^nothing$/i.test(v)) continue;
    // Names, commas and the two liberties `Feeds:` takes. A space inside a
    // name is the shape every one of the twelve carries today, so this is
    // the assertion the migration has to earn.
    for (const raw of v.split(",")) {
      const name = raw.trim().replace(/^`|`$|\.$/g, "");
      assert.match(
        name,
        /^[a-z0-9][a-z0-9-]*$/,
        `${p}: "${name}" is not a task name; prose belongs in the Handoff`,
      );
    }
  }
});

test("3. a name that resolves to no requirement is a finding", () => {
  const r = acceptance("dangling");
  const said = r.stdout + r.stderr;
  assert.equal(r.status, 1, `a dangling supersede was allowed: ${said}`);
  assert.match(said, /dangling/, `the requirement is not named: ${said}`);
  assert.match(
    said,
    /a-task-nobody-wrote/,
    `the name that resolves to nothing is not named: ${said}`,
  );
});

test("4. a declared name the prose does not carry is a finding", () => {
  const r = acceptance("disagrees");
  const said = r.stdout + r.stderr;
  assert.equal(r.status, 1, `a disagreement was allowed: ${said}`);
  assert.match(said, /disagrees/, `the requirement is not named: ${said}`);
  // The declared name is the one missing from the prose, and it is the one
  // reported. `dangling` resolves, so this is not the criterion 3 finding
  // arriving under another name.
  assert.match(
    said,
    /dangling/,
    `the name the prose does not carry is not named: ${said}`,
  );
});

test("5. a requirement with no block, or no key, is reported and named", () => {
  const r = acceptance("no-block");
  const said = r.stdout + r.stderr;
  assert.equal(
    r.status,
    1,
    `a requirement with no frontmatter passed: ${said}`,
  );
  assert.match(said, /no-block/, `the requirement is not named: ${said}`);
  assert.match(
    said,
    /supersedes/i,
    `the finding does not say what is missing: ${said}`,
  );
});

test("6. the Handoff still carries the prose for every task that is named", () => {
  const named = pages().filter(
    (p) => !/^nothing$/i.test(key(read(p), "supersedes") ?? "nothing"),
  );
  assert.ok(
    named.length >= 12,
    `only ${named.length} requirements declare a supersede; the runs found 12`,
  );
  for (const p of named) {
    const line = read(p).match(/^- Supersedes: (.+)$/m);
    assert.ok(line, `${p}: the Handoff has no Supersedes line`);
    // The prose, not the name. A line that is only the name repeats the
    // frontmatter and says nothing a reader could not already compute, so
    // the words that made it worth keeping have to still be there.
    const prose = line[1].replace(/`[a-z0-9-]+`|[a-z0-9-]+/g, "").trim();
    assert.ok(
      prose.replace(/[.,;:]/g, "").trim().length > 0,
      `${p}: the Supersedes line is a bare name; which claim moved?`,
    );
  }
});
