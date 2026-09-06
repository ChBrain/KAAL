// Acceptance tests for requirement witness-a-tree. One per criterion.
// Surface only: the command, on trees this test builds in a temporary
// directory. The expected hashes are computed here, from the bytes, so the
// test knows nothing of how the command reads them.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kaal = (args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** A tree with a dotfile, a plain file and a nested one. */
const tree = () => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-witness-"));
  mkdirSync(join(dir, "sub"));
  writeFileSync(join(dir, ".hidden"), "one\n");
  writeFileSync(join(dir, "a.txt"), "two\n");
  writeFileSync(join(dir, "sub", "b.txt"), "three\n");
  return dir;
};
/** This test's own reading of a tree, so the command is never its own judge. */
const readTree = (dir, prefix = "") => {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : 1,
  )) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...readTree(p, `${prefix}${e.name}/`));
    else if (e.isFile())
      out.push(`${sha(readFileSync(p))}  ${prefix}${e.name}`);
  }
  return out;
};

test("1. the manifest: a line per file, sorted, sha and relative path", () => {
  const dir = tree();
  try {
    const r = kaal(["witness", dir]);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(
      r.stdout,
      [
        `${sha("one\n")}  .hidden`,
        `${sha("two\n")}  a.txt`,
        `${sha("three\n")}  sub/b.txt`,
      ].join("\n") + "\n",
    );
    const empty = mkdtempSync(join(tmpdir(), "kaal-witness-empty-"));
    const e = kaal(["witness", empty]);
    assert.equal(e.status, 0, e.stderr);
    assert.equal(e.stdout, "");
    rmSync(empty, { recursive: true, force: true });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("2. the comparison: silent agreement, or every path that moved", () => {
  const dir = tree();
  const manifest = join(
    mkdtempSync(join(tmpdir(), "kaal-witness-m-")),
    "before.txt",
  );
  try {
    writeFileSync(manifest, kaal(["witness", dir]).stdout);
    const same = kaal(["witness", dir, "--against", manifest]);
    assert.equal(same.status, 0, same.stderr);
    assert.match(same.stdout, /nothing moved/i);

    writeFileSync(join(dir, "a.txt"), "two, and more\n");
    writeFileSync(join(dir, "new.txt"), "four\n");
    rmSync(join(dir, "sub", "b.txt"));
    const moved = kaal(["witness", dir, "--against", manifest]);
    assert.equal(moved.status, 1, moved.stdout);
    const lines = moved.stdout.trim().split("\n");
    assert.equal(lines.length, 3, moved.stdout);
    for (const [path, word] of [
      ["a.txt", "changed"],
      ["new.txt", "added"],
      ["sub/b.txt", "removed"],
    ]) {
      const line = lines.find((l) => l.includes(path) && l.includes(word));
      assert.ok(line, `no line naming ${path} as ${word}: ${moved.stdout}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(dirname(manifest), { recursive: true, force: true });
  }
});

test("3. the witness writes nothing into the tree it reads, in either form", () => {
  const dir = tree();
  const manifest = join(
    mkdtempSync(join(tmpdir(), "kaal-witness-m-")),
    "before.txt",
  );
  try {
    const before = readTree(dir);
    const made = kaal(["witness", dir]);
    // The claim is about a run that happened: a command that never ran
    // writes nothing either, and would pass this test for the wrong reason.
    assert.equal(made.status, 0, made.stderr);
    assert.equal(made.stdout.trim().split("\n").length, 3, made.stdout);
    writeFileSync(manifest, made.stdout);
    assert.deepEqual(readTree(dir), before, "the manifest form wrote");
    kaal(["witness", dir, "--against", manifest]);
    assert.deepEqual(readTree(dir), before, "the agreeing form wrote");
    writeFileSync(manifest, `${sha("nothing")}  gone.txt\n`);
    const failed = kaal(["witness", dir, "--against", manifest]);
    assert.equal(failed.status, 1);
    assert.deepEqual(readTree(dir), before, "the failing form wrote");
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(dirname(manifest), { recursive: true, force: true });
  }
});

test("4. a target that is not a directory, and a manifest that is not one", () => {
  const dir = tree();
  try {
    const notDir = kaal(["witness", join(dir, "a.txt")]);
    const missing = kaal([
      "witness",
      dir,
      "--against",
      join(dir, "no-such-manifest.txt"),
    ]);
    writeFileSync(join(dir, "junk.txt"), "not a manifest at all\n");
    const junk = kaal(["witness", dir, "--against", join(dir, "junk.txt")]);
    for (const [name, r, named] of [
      ["not a directory", notDir, join(dir, "a.txt")],
      ["missing manifest", missing, join(dir, "no-such-manifest.txt")],
      ["unparsable manifest", junk, join(dir, "junk.txt")],
    ]) {
      assert.equal(r.status, 1, `${name}: ${r.stdout}`);
      assert.equal(r.stdout, "", `${name} wrote to stdout`);
      const lines = r.stderr.trim().split("\n");
      assert.equal(lines.length, 1, `${name}: ${r.stderr}`);
      // Names which: a usage line carries no path, and would otherwise
      // pass this test for the wrong reason.
      assert.ok(
        lines[0].includes(named),
        `${name} did not name it: ${lines[0]}`,
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
