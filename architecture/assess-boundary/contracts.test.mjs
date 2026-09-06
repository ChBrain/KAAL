// Contract tests for the drawing assess-boundary. One per seam. Blind to
// the code: the tool as a command, on fixture roots and on directories
// built here, so nothing depends on the league's own tree.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  cpSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const RQ = join(ROOT, "requirements", "assess-boundary", "fixtures");
const kaal = (args, cwd) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
const temp = () => mkdtempSync(join(tmpdir(), "kaal-boundary-"));
const SHA = "1234567890abcdef1234567890abcdef12345678";
/** A directory carrying the git files a resolver reads, and nothing else. */
const withRefs = (dir, head, ref) => {
  mkdirSync(join(dir, ".git", "refs", "heads"), { recursive: true });
  writeFileSync(join(dir, ".git", "HEAD"), head);
  if (ref) writeFileSync(join(dir, ".git", "refs", "heads", "main"), ref);
  return dir;
};

test("1. tree to descriptor: the sha comes from the ref files, a missing ref is named, and two renders are equal", () => {
  const dir = temp();
  try {
    const named = withRefs(
      join(dir, "named"),
      "ref: refs/heads/main\n",
      SHA + "\n",
    );
    const a = kaal(["assess", named], dir);
    assert.equal(a.status, 0, a.stderr);
    const d = JSON.parse(a.stdout);
    assert.equal(d.target.resolved_sha, SHA);
    assert.ok(
      !("unresolved" in d.target),
      "a resolved target carries a reason",
    );
    assert.deepEqual(Object.keys(d).sort(), [
      "access",
      "mode",
      "schema",
      "target",
    ]);
    assert.doesNotMatch(a.stdout, /"[^"]*(_at|time|clock)[^"]*"\s*:/i);
    const again = kaal(["assess", named], dir);
    assert.equal(again.stdout, a.stdout, "two renders differ");

    const detached = withRefs(join(dir, "detached"), SHA + "\n", null);
    assert.equal(
      JSON.parse(kaal(["assess", detached], dir).stdout).target.resolved_sha,
      SHA,
    );

    const dangling = withRefs(
      join(dir, "dangling"),
      "ref: refs/heads/main\n",
      null,
    );
    const g = JSON.parse(kaal(["assess", dangling], dir).stdout);
    assert.equal(g.target.resolved_sha, null);
    assert.match(g.target.unresolved, /refs\/heads\/main/);

    const bare = JSON.parse(kaal(["assess", join(RQ, "plain")], dir).stdout);
    assert.equal(bare.target.resolved_sha, null);
    assert.ok(bare.target.unresolved.trim());
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("2. the caller's path to a verdict: refused inside either repository, permitted elsewhere, and refused before the target is read", () => {
  const dir = temp();
  try {
    const target = join(dir, "target");
    cpSync(join(RQ, "plain"), target, { recursive: true });
    const league = kaal(
      ["assess", target, "--output", join(ROOT, "evals", "no.json")],
      dir,
    );
    assert.equal(league.status, 1, league.stdout);
    assert.match(league.stderr, /league's own tree/);
    const inTarget = kaal(
      ["assess", target, "--output", join(target, "no.json")],
      dir,
    );
    assert.equal(inTarget.status, 1, inTarget.stdout);
    assert.match(inTarget.stderr, /inside the target/);
    const elsewhere = kaal(
      ["assess", target, "--output", join(dir, "yes.json")],
      dir,
    );
    assert.equal(elsewhere.status, 0, elsewhere.stderr);
    // The order: with a target that does not exist, the refusal still comes,
    // so the path is judged before anything is read.
    const missing = join(dir, "no-such-target");
    const first = kaal(
      ["assess", missing, "--output", join(ROOT, "evals", "no.json")],
      dir,
    );
    assert.equal(first.status, 1);
    assert.match(first.stderr, /league's own tree/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("3. document to the caller's disk: one file, whose bytes are what the command prints", () => {
  const dir = temp();
  try {
    const target = withRefs(
      join(dir, "t"),
      "ref: refs/heads/main\n",
      SHA + "\n",
    );
    const out = join(dir, "out");
    mkdirSync(out);
    const file = join(out, "d.json");
    const w = kaal(["assess", target, "--output", file], dir);
    assert.equal(w.status, 0, w.stderr);
    assert.deepEqual(readdirSync(out), ["d.json"]);
    assert.equal(
      readFileSync(file, "utf8"),
      kaal(["assess", target], dir).stdout,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("4. the assess tree to the wall: the sink may write and not reach, and a test beside the modules is never read", () => {
  const clean = kaal(["boundary"], join(RQ, "clean-assess"));
  assert.equal(clean.status, 0, clean.stderr);
  const sink = kaal(["boundary"], join(HERE, "fixtures", "reaching-sink"));
  assert.equal(sink.status, 1, sink.stdout);
  assert.match(sink.stderr, /output\.mjs reaches the shell or the network/);
  assert.doesNotMatch(sink.stderr, /output\.mjs writes/);
  assert.doesNotMatch(sink.stderr, /probe\.test\.mjs/);
  const both = kaal(["boundary"], join(RQ, "second-writer"));
  assert.equal(both.status, 1, both.stdout);
  assert.match(both.stderr, /collect\.mjs writes/);
  assert.match(both.stderr, /run\.mjs reaches the shell or the network/);
});
