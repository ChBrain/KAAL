// Acceptance tests for requirement a-retro-names-what-it-read. One per
// criterion. Surface only: the `retro-4ls` skill's text and what
// `kaal retros` prints and exits with. The command is driven on fixture
// roots beside this file and never on the league's own tree, whose counts
// move every time anyone files a retro.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FIX = (n) => join(HERE, "fixtures", n);
const text = () =>
  readFileSync(join(ROOT, "skills", "retro-4ls", "SKILL.md"), "utf8");
const fold = (s) => s.replace(/\s+/g, " ");
const kaal = (root) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), "retros", root], {
    encoding: "utf8",
  });

test("1. the retro carries what it read, and the skill says what belongs there", () => {
  // The template is a fenced block in the skill, so it is read as a block
  // and not as the whole page: the page says `Feeds:` in its prose too.
  const block = text().match(/```\n# Retrospective[\s\S]*?```/)?.[0];
  assert.ok(block, "the skill has no output format block");
  assert.match(block, /^Feeds: /m, "the block has no Feeds line to sit beside");
  assert.match(block, /^Read: /m, "the block has no Read line");
  // And the rule for it, in the section that already rules the Feeds line.
  const loop = fold(
    text().match(/^## Feed the loop\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ??
      "",
  );
  assert.ok(loop, "the skill has no Feed the loop section");
  const rule = loop
    .split(/(?<=\.)\s+/)
    .filter((x) => /\bRead:/.test(x))
    .join(" ");
  assert.ok(rule, `the loop's rules never mention the Read line: ${loop}`);
  assert.match(
    rule,
    /follow|read|leaned|used/i,
    `what belongs on the line is not said: ${rule}`,
  );
  assert.match(
    rule,
    /not the one|never the .*it feeds|other than/i,
    `the skill it feeds is not excluded: ${rule}`,
  );
});

test("2. every skill gets a read count beside its unconsumed count", () => {
  const r = kaal(FIX("mixed"));
  assert.equal(r.status, 0, `refused a clean tree: ${r.stderr}`);
  // Counted from the fixture, so this cannot go red when the fixture grows.
  const skills = readdirSync(join(FIX("mixed"), "skills")).sort();
  assert.ok(skills.length > 1, `the fixture holds ${skills.length} skills`);
  for (const s of skills) {
    assert.match(
      r.stdout,
      new RegExp(`^${s}: \\d+ unconsumed$`, "m"),
      `no unconsumed line for ${s}: ${r.stdout}`,
    );
    assert.match(
      r.stdout,
      new RegExp(`^${s}: \\d+ read$`, "m"),
      `no read line for ${s}: ${r.stdout}`,
    );
  }
});

test("3. a read is counted read, and never counted unconsumed", () => {
  const r = kaal(FIX("mixed"));
  assert.equal(r.status, 0, r.stderr);
  // one.md feeds alpha and reads beta; two.md feeds alpha; three.md feeds
  // beta and reads gamma, and a requirement names three.md, so it is
  // consumed. beta is read once and unconsumed zero times: the read does not
  // become a retro that could fire the rule of ten.
  assert.match(r.stdout, /^alpha: 2 unconsumed$/m, r.stdout);
  assert.match(r.stdout, /^alpha: 0 read$/m, r.stdout);
  assert.match(r.stdout, /^beta: 0 unconsumed$/m, r.stdout);
  assert.match(r.stdout, /^beta: 1 read$/m, r.stdout);
  // And a consumed retro's read still counts, or the number falls the day a
  // stack is run and the skill goes quiet again.
  assert.match(r.stdout, /^gamma: 0 unconsumed$/m, r.stdout);
  assert.match(r.stdout, /^gamma: 1 read$/m, r.stdout);
});

test("4. a Read line naming something that is not a skill is a finding", () => {
  const r = kaal(FIX("unknown"));
  assert.equal(r.status, 1, `answered instead of finding: ${r.stdout}`);
  const said = r.stdout + r.stderr;
  assert.match(said, /one\.md/, `the retro is not named: ${said}`);
  assert.match(said, /delta/, `the unknown name is not named: ${said}`);
});

test("5. a retro with no Read line is not a finding", () => {
  const r = kaal(FIX("none"));
  assert.equal(
    r.status,
    0,
    `refused a tree of retros as they are filed: ${r.stderr}`,
  );
  for (const s of readdirSync(join(FIX("none"), "skills")))
    assert.match(r.stdout, new RegExp(`^${s}: 0 read$`, "m"), r.stdout);
});
