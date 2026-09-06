// Contract tests for the drawing witness-a-tree. One per seam. Blind to the
// modules: the tool as a command, on trees these tests build, and the wall
// on a fixture root.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
const temp = (tag) => mkdtempSync(join(tmpdir(), `kaal-witness-${tag}-`));

/** Files created in reverse order, so filesystem order and sorted order differ. */
const jumbled = () => {
  const dir = temp("jumbled");
  mkdirSync(join(dir, "zed"));
  mkdirSync(join(dir, "alpha"));
  writeFileSync(join(dir, "zed", "z.txt"), "last\n");
  writeFileSync(join(dir, "m.txt"), "middle\n");
  writeFileSync(join(dir, "alpha", "a.txt"), "first\n");
  return dir;
};

test("1. the manifest is sorted by path, not by the filesystem, and the same twice", () => {
  const dir = jumbled();
  try {
    const one = kaal(["witness", dir]);
    assert.equal(one.status, 0, one.stderr);
    const paths = one.stdout
      .trim()
      .split("\n")
      .map((l) => l.split("  ")[1]);
    assert.deepEqual(paths, ["alpha/a.txt", "m.txt", "zed/z.txt"]);
    for (const line of one.stdout.trim().split("\n"))
      assert.match(line, /^[0-9a-f]{64} {2}\S/);
    const two = kaal(["witness", dir]);
    assert.equal(two.stdout, one.stdout, "a second run differed");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("2. a manifest agrees with the same tree at another path", () => {
  const dir = jumbled();
  const elsewhere = join(temp("copy"), "moved");
  const manifest = join(temp("m"), "before.txt");
  try {
    writeFileSync(manifest, kaal(["witness", dir]).stdout);
    cpSync(dir, elsewhere, { recursive: true });
    const same = kaal(["witness", elsewhere, "--against", manifest]);
    assert.equal(same.status, 0, same.stdout + same.stderr);
    assert.match(same.stdout, /nothing moved/i);
    writeFileSync(join(elsewhere, "alpha", "a.txt"), "first, edited\n");
    const moved = kaal(["witness", elsewhere, "--against", manifest]);
    assert.equal(moved.status, 1, moved.stdout);
    const lines = moved.stdout.trim().split("\n");
    assert.equal(lines.length, 1, moved.stdout);
    assert.ok(
      lines[0].includes("alpha/a.txt") && lines[0].includes("changed"),
      lines[0],
    );
  } finally {
    rmSync(dirname(elsewhere), { recursive: true, force: true });
    rmSync(dirname(manifest), { recursive: true, force: true });
    rmSync(dir, { recursive: true, force: true });
  }
});

test("3. a manifest that half parses is a fault, never a verdict on the half", () => {
  const dir = jumbled();
  const manifest = join(temp("m"), "half.txt");
  try {
    const good = kaal(["witness", dir]).stdout.trim().split("\n")[0];
    writeFileSync(manifest, `${good}\nthis is not a manifest line\n`);
    const r = kaal(["witness", dir, "--against", manifest]);
    assert.equal(r.status, 1, r.stdout);
    assert.equal(r.stdout, "", "a half parsable manifest produced a verdict");
    const lines = r.stderr.trim().split("\n");
    assert.equal(lines.length, 1, r.stderr);
    assert.ok(lines[0].includes(manifest), lines[0]);
  } finally {
    rmSync(dirname(manifest), { recursive: true, force: true });
    rmSync(dir, { recursive: true, force: true });
  }
});

test("4. the wall refuses a witness that writes, and names only the module that does", () => {
  const leaky = kaal(["boundary"], join(HERE, "fixtures", "leaky-witness"));
  assert.equal(leaky.status, 1, leaky.stdout);
  assert.match(leaky.stderr, /manifest\.mjs writes/);
  assert.doesNotMatch(leaky.stderr, /compare\.mjs/);
  const league = kaal(["boundary"]);
  assert.equal(league.status, 0, league.stderr);
});
