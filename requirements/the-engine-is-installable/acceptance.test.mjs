// Acceptance tests for requirement the-engine-is-installable. One per
// criterion. Surface only: the manifest, what npm packs, and the command a
// consumer ends up with. Nothing here imports the tool.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// npm is a shell script on one platform and a batch file on the other, and
// spawn without a shell will not find the second by its bare name.
const NPM = process.platform === "win32" ? "npm.cmd" : "npm";
const manifest = () =>
  JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

// Pack the tool into a scratch directory and install it into an empty project
// there, offline. Returns the consumer's path; the caller removes the scratch.
function installed(scratch) {
  const packed = spawnSync(
    NPM,
    ["pack", "--ignore-scripts", "--pack-destination", scratch],
    {
      cwd: ROOT,
      encoding: "utf8",
    },
  );
  assert.equal(packed.status, 0, `npm pack: ${packed.stderr}`);
  const tarballs = readdirSync(scratch).filter((f) => f.endsWith(".tgz"));
  assert.equal(tarballs.length, 1, `packed ${tarballs.length} tarballs`);
  const consumer = join(scratch, "consumer");
  mkdirSync(consumer);
  const empty = {
    name: "a-tree-that-installs-kaal",
    version: "1.0.0",
    private: true,
  };
  writeFileSync(join(consumer, "package.json"), `${JSON.stringify(empty)}\n`);
  const install = spawnSync(
    NPM,
    [
      "install",
      "--offline",
      "--no-audit",
      "--no-fund",
      join(scratch, tarballs[0]),
    ],
    { cwd: consumer, encoding: "utf8" },
  );
  assert.equal(install.status, 0, `npm install: ${install.stderr}`);
  return consumer;
}

test("1. the manifest declares a version, and it is in its patch place", () => {
  const version = manifest().version;
  assert.ok(version, "package.json declares no version");
  const [major, minor] = String(version).split(".");
  assert.equal(major, "0", `major place is ${major} in ${version}`);
  assert.equal(minor, "0", `minor place is ${minor} in ${version}`);
});

test("2. what the tool ships is the tool", () => {
  const packed = spawnSync(
    NPM,
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    {
      cwd: ROOT,
      encoding: "utf8",
    },
  );
  assert.equal(packed.status, 0, `npm pack: ${packed.stdout}${packed.stderr}`);
  const files = JSON.parse(packed.stdout)[0].files.map((f) => f.path);
  assert.ok(files.length > 1, `the tarball carries ${files.length} files`);
  assert.ok(files.includes("package.json"), "the tarball carries no manifest");
  // npm puts these three in every tarball whatever the manifest says, and an
  // MIT tool shipping without its licence would be the worse outcome.
  const always = ["package.json", "LICENSE", "README.md"];
  const stray = files.filter(
    (p) => !always.includes(p) && !p.startsWith("bin/"),
  );
  assert.deepEqual(
    stray,
    [],
    `the tarball carries the league's working: ${stray}`,
  );
  // Named on their own as well, because the criterion names them and a
  // future `files` entry could let one back in without failing the line above.
  for (const d of [
    "requirements/",
    "architecture/",
    "retros/",
    "evals/",
    "fixtures/",
    "skills/",
  ])
    assert.deepEqual(
      files.filter((p) => p.startsWith(d)),
      [],
      `the tarball carries ${d}`,
    );
});

test("3. the installed tool answers on the command line", () => {
  const scratch = mkdtempSync(join(tmpdir(), "kaal-installs-"));
  try {
    const consumer = installed(scratch);
    const shim = join(consumer, "node_modules", ".bin", "kaal");
    assert.ok(
      existsSync(shim) || existsSync(`${shim}.cmd`),
      "no executable named kaal",
    );
    const win = process.platform === "win32";
    const run = spawnSync(win ? `"${shim}"` : shim, [], {
      encoding: "utf8",
      shell: win,
    });
    assert.equal(
      run.status,
      1,
      `kaal exited ${run.status}: ${run.stdout}${run.stderr}`,
    );
    assert.match(run.stderr, /^usage: kaal /, `kaal said: ${run.stderr}`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test("4. the install brings nothing with it", () => {
  assert.deepEqual(
    Object.keys(manifest().dependencies ?? {}),
    [],
    "the manifest declares runtime dependencies",
  );
  const scratch = mkdtempSync(join(tmpdir(), "kaal-alone-"));
  try {
    const consumer = installed(scratch);
    const packages = readdirSync(join(consumer, "node_modules")).filter(
      (n) => !n.startsWith("."),
    );
    assert.deepEqual(
      packages,
      ["kaal"],
      `the install added ${packages.join(", ")}`,
    );
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});
