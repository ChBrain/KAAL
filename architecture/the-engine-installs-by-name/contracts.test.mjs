// Contract tests for drawing the-engine-installs-by-name. One per seam,
// numbered to match. Seams 1 and 2 read the manifest and what `npm pack`
// says the package carries; seams 3 and 4 read workflow text, because
// nothing here holds a token and a test that fakes a registry proves the
// fake.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const W = join(ROOT, ".github", "workflows");
const manifest = () =>
  JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const workflow = (f) => readFileSync(join(W, f), "utf8");
const workflows = () => readdirSync(W).filter((f) => /\.ya?ml$/.test(f));

test("1. the name a registry resolves, and a registry the manifest declares", () => {
  const p = manifest();
  // Three facts, each on its own: an alternation passes on a manifest that
  // is one third of the way there.
  assert.match(p.name, /^@[a-z0-9-]+\/kaal$/, `the name is ${p.name}`);
  assert.notEqual(p.private, true, "the package is still private");
  const registry = String(p.publishConfig?.registry ?? "");
  assert.match(
    registry,
    /^https:\/\/\S+$/,
    `no https registry is declared: ${JSON.stringify(p.publishConfig)}`,
  );
  // A publish that resolves its registry from the machine can go somewhere
  // nobody chose, so the manifest is where a reader finds the answer.
  assert.doesNotMatch(
    workflows().map(workflow).join("\n"),
    /npm publish[^\n]*--registry/,
    "a workflow passes a registry, so the manifest is not the answer",
  );
});

test("2. what the package carries did not widen when private came off", () => {
  const r = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: ROOT,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  assert.equal(r.status, 0, `npm pack refused: ${r.stderr}`);
  const files = JSON.parse(r.stdout)[0].files.map((f) => f.path);
  assert.ok(
    files.some((f) => f.startsWith("bin/")),
    `the tool is not in the package: ${files.join(", ")}`,
  );
  // The six directories that hold the league's own working papers. Read
  // from `npm pack` and never from the manifest, because the manifest is
  // the thing this task changed.
  for (const dir of [
    "requirements",
    "architecture",
    "retros",
    "evals",
    "skills",
    "tests",
  ]) {
    const leaked = files.filter((f) => f.startsWith(`${dir}/`));
    assert.deepEqual(
      leaked,
      [],
      `${dir}/ is in the package: ${leaked.join(", ")}`,
    );
  }
});

test("3. the order in the workflow: the publish is after everything", () => {
  // Steps and not the file. A comment explaining what a step is for names
  // the command it explains, and searching the whole text finds the
  // explanation rather than the step: a comment above the tag saying what
  // `npm publish` needs read as a publish happening before the tag.
  // `the-release-runs-on-a-key`'s acceptance test learned this and this one
  // had not.
  const t = workflow("release.yml")
    .split("\n")
    .map((l) => (/^\s*#/.test(l) ? "" : l))
    .join("\n");
  const at = (re) => {
    const i = t.search(re);
    assert.notEqual(i, -1, `the release workflow has no ${re}`);
    return i;
  };
  const branch = at(/default_branch/);
  const board = at(/npm test/);
  const refusal = at(/kaal\.mjs release/);
  const tag = at(/git push[^\n]*tag|git tag/);
  const publish = at(/npm publish/);
  // Each after the last, and the publish after all of them. Held as
  // written, because nothing here holds a token.
  assert.ok(branch < board, "the board runs before the branch is refused");
  assert.ok(board < refusal, "the refusal runs before the board");
  assert.ok(refusal < tag, "the tag is made before the refusal");
  assert.ok(tag < publish, "the publish happens before the tag");
});

test("4. every write says what it is for, wherever its block sits", () => {
  const blocks = [];
  for (const f of workflows()) {
    const t = workflow(f);
    assert.match(t, /^\s*permissions:/m, `${f}: no permissions block`);
    // Both shapes: a top level block and a job's, which is indented. The
    // rule that read only the first never saw codeql's write at all.
    for (const m of t.matchAll(
      /^([ \t]*)permissions:[ \t]*\n((?:\1[ \t]+.+\n)*)/gm,
    ))
      blocks.push([f, m[2]]);
  }
  assert.ok(
    blocks.some(
      ([, b]) => /^\s+\S/.test(b) && /security-events:\s*write/.test(b),
    ),
    "no job level block was found; the indented shape is still invisible",
  );
  for (const [f, block] of blocks)
    for (const [line, rest] of block.matchAll(/^\s*[a-z-]+:\s*write\b(.*)$/gm))
      assert.match(
        rest,
        /#\s*\S/,
        `${f}: ${line.trim()} does not say what the write is for`,
      );
  // A read needs no reason: it changes nothing, and a reason on every line
  // is a page a consumer scrolls past.
  const reads = blocks
    .flatMap(([, b]) => [...b.matchAll(/^\s*[a-z-]+:\s*read\b(.*)$/gm)])
    .map((m) => m[1]);
  assert.ok(reads.length, "no read was found, so the exclusion is untested");
  assert.ok(
    reads.some((r) => !/#/.test(r)),
    "every read carries a comment, so the rule cannot be excluding them",
  );
});
