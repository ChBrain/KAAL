// Acceptance tests for requirement the-release-runs-on-a-key. One per
// criterion. Surface only: what `kaal release` prints and exits with, and
// the text of the release workflow, the surface page and the operate skill.
// The command is driven on fixture trees beside this file, never on the
// league's own, whose version and records move with every release.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIX = (n) => join(dirname(fileURLToPath(import.meta.url)), "fixtures", n);
const fold = (s) => s.replace(/\s+/g, " ");
// In the tree, with no root, which is how the workflow runs it and the only
// form it has: its argument is a version, never a path.
const kaal = (dir, ...args) =>
  spawnSync(
    process.execPath,
    [join(ROOT, "bin", "kaal.mjs"), "release", ...args],
    { encoding: "utf8", cwd: dir },
  );
const said = (r) => r.stdout + r.stderr;

test("1. a tree that agrees with the version answers", () => {
  const r = kaal(FIX("agrees"), "0.0.1");
  assert.equal(r.status, 0, `refused a tree that agrees: ${said(r)}`);
  assert.match(said(r), /0\.0\.1/, `the version is not named: ${said(r)}`);
  // The record it found, so the answer says what it rests on rather than
  // only that it is content.
  assert.match(
    said(r),
    /deploy\/releases\/0\.0\.1\.md|0\.0\.1\.md/,
    `the record it found is not named: ${said(r)}`,
  );
});

test("2. a version the tree does not carry is a finding naming both", () => {
  const r = kaal(FIX("mismatch"), "0.0.1");
  assert.equal(r.status, 1, `answered a mislabelled release: ${said(r)}`);
  // Both numbers, each asserted on its own: one alternation is satisfied by
  // a finding that names only the version it was asked for.
  assert.match(
    said(r),
    /0\.0\.1/,
    `the version asked for is not named: ${said(r)}`,
  );
  assert.match(
    said(r),
    /0\.0\.2/,
    `the version the tree carries is not named: ${said(r)}`,
  );
});

test("3. a missing release record is a finding naming the path", () => {
  const r = kaal(FIX("no-record"), "0.0.1");
  assert.equal(r.status, 1, `answered without a plan: ${said(r)}`);
  assert.match(
    said(r),
    /deploy\/releases\/0\.0\.1\.md/,
    `the path it looked for is not named: ${said(r)}`,
  );
});

test("4. the command is on the surface page and guarded like the rest", () => {
  const m = readFileSync(join(ROOT, "SURFACE.md"), "utf8").match(
    /^## release\n([\s\S]*?)(?=^## |(?![\s\S]))/m,
  );
  assert.ok(m, "the surface page has no release entry");
  const e = fold(m[1]);
  assert.match(e, /version/i, `what it answers is not named: ${e}`);
  assert.match(e, /Exits 0, 1 (and|or) 2/i, `the exit codes are wrong: ${e}`);
  // A tree that is not this league's is not this command's question either.
  const away = kaal(FIX("foreign"), "0.0.1");
  assert.equal(away.status, 2, `answered a foreign tree: ${said(away)}`);
});

test("5. the workflow runs on a key, and tags after the board and the check", () => {
  const p = join(ROOT, ".github", "workflows", "release.yml");
  assert.ok(existsSync(p), "there is no release workflow");
  const w = readFileSync(p, "utf8");
  // Started by a person and by nothing else: no push, no schedule, no
  // pull_request. Read from the trigger block alone, because those words
  // appear in comments for other reasons.
  const on = w.match(/^on:\n([\s\S]*?)(?=^\S)/m)?.[1] ?? "";
  assert.match(on, /workflow_dispatch/, `it is not dispatched: ${on}`);
  assert.doesNotMatch(
    on,
    /^\s*(push|pull_request|schedule|release):/m,
    `something other than a person can start it: ${on}`,
  );
  assert.match(on, /inputs:[\s\S]*version/, `it takes no version: ${on}`);
  // The narrowest permission that can tag, and nothing wider.
  const perms = w.match(/^permissions:\n([\s\S]*?)(?=^\S)/m)?.[1] ?? "";
  assert.match(perms, /contents:\s*write/, `it cannot tag: ${perms}`);
  assert.doesNotMatch(
    perms,
    /write/g &&
      /(packages|id-token|actions|deployments|pull-requests):\s*write/,
    `it takes more than it needs: ${perms}`,
  );
  // The board and the check come before anything that makes a tag.
  // Steps, not the file: the header comment explains what `kaal release`
  // is for, and searching the whole file found the explanation rather than
  // the step, so the check could be deleted with this test still green.
  const steps = w
    .split("\n")
    .map((l) =>
      /^\s*(-|#)/.test(l) && !/^\s*#/.test(l)
        ? l
        : /^\s{6,}/.test(l) && !/^\s*#/.test(l)
          ? l
          : "",
    );
  const at = (re) => steps.findIndex((l) => l && re.test(l));
  const board = at(/npm test/);
  const check = at(/kaal\.mjs release|kaal release/);
  const tag = at(/git tag|createRef|refs\/tags/);
  assert.ok(board > -1, "the workflow does not run the board");
  assert.ok(check > -1, "the workflow does not run the check");
  assert.ok(tag > -1, "the workflow never makes a tag");
  assert.ok(board < tag, `the board runs after the tag: ${board} then ${tag}`);
  assert.ok(check < tag, `the check runs after the tag: ${check} then ${tag}`);
});

test("6. the operate skill knows a dispatch is a key, and what its tests are", () => {
  const t = readFileSync(join(ROOT, "skills", "operate", "SKILL.md"), "utf8");
  const section = (h) => {
    const m = t.match(
      new RegExp(`^## ${h}[^\\n]*\\n([\\s\\S]*?)(?=^## )`, "m"),
    );
    assert.ok(m, `the skill has no section ${h}`);
    return m[1];
  };
  const paras = (h, re) =>
    section(h)
      .split(/\n\s*\n/)
      .map(fold)
      .filter((x) => re.test(x))
      .join(" ");
  // A dispatch is a key, in the section that rules the key.
  const key = paras("1\\. Read the key", /dispatch|run a person starts/i);
  assert.ok(key, "the key's rules never mention a dispatch");
  assert.match(key, /version/i, `the version is not part of it: ${key}`);
  assert.match(key, /target/i, `the target is not part of it: ${key}`);
  assert.match(key, /record/i, `the record is not where it lands: ${key}`);
  // And the case the v0.0.1 record argued and this skill did not have.
  const proof = paras("3\\. Write the proof", /\bref\b|wrapper/i);
  assert.ok(proof, "the proof's rules never mention the case");
  assert.match(
    proof,
    /refus/i,
    `the refusals are not named as the tests: ${proof}`,
  );
  assert.match(proof, /wrapper/i, `what they replace is not named: ${proof}`);
});
