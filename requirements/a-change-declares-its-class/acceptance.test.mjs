// Acceptance tests for requirement a-change-declares-its-class. One per
// criterion. Surface only: the command, on git repositories these tests
// build, because a command that reads history cannot be proven on a
// directory of files.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kaal = (args, cwd = ROOT) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    cwd,
    encoding: "utf8",
  });
const git = (dir, ...args) =>
  spawnSync(
    "git",
    [
      "-c",
      "user.email=t@t",
      "-c",
      "user.name=t",
      "-c",
      "commit.gpgsign=false",
      ...args,
    ],
    { cwd: dir, encoding: "utf8" },
  );
const temp = (tag) => mkdtempSync(join(tmpdir(), `kaal-class-${tag}-`));

/** A repository with a version, a surface, a tool and a skill, on main. */
const repo = (version = "0.0.1") => {
  const dir = temp("repo");
  git(dir, "init", "-b", "main");
  mkdirSync(join(dir, "bin"), { recursive: true });
  mkdirSync(join(dir, "skills", "one"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    `{ "name": "x", "version": "${version}" }\n`,
  );
  writeFileSync(join(dir, "SURFACE.md"), "# The surface\n");
  writeFileSync(join(dir, "bin", "x.mjs"), "// a tool\n");
  writeFileSync(join(dir, "skills", "one", "SKILL.md"), "# one\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-m", "base");
  return dir;
};
/** Move on a branch, so the base ref stays where it was. */
const change = (dir, files) => {
  git(dir, "checkout", "-q", "-b", "work");
  for (const [path, body] of Object.entries(files))
    writeFileSync(join(dir, path), body);
  git(dir, "add", "-A");
  git(dir, "commit", "-m", "work");
  return dir;
};

test("1. a tree with no history, or no package.json, is not this question's", () => {
  const plain = temp("plain");
  writeFileSync(join(plain, "package.json"), '{ "version": "0.0.1" }\n');
  const noGit = kaal(["class", plain]);
  const noPackage = temp("nopkg");
  spawnSync("git", ["init", "-b", "main"], { cwd: noPackage });
  const noPkg = kaal(["class", noPackage]);
  try {
    for (const [name, r] of [
      ["no git", noGit],
      ["no package", noPkg],
    ]) {
      assert.equal(r.status, 2, `${name}: ${r.stdout}${r.stderr}`);
      assert.equal(r.stdout, "", `${name} wrote to stdout`);
      const lines = r.stderr.trim().split("\n");
      assert.equal(lines.length, 1, `${name}: ${r.stderr}`);
      assert.match(lines[0], /^class: not applicable here: \S/);
    }
  } finally {
    rmSync(plain, { recursive: true, force: true });
    rmSync(noPackage, { recursive: true, force: true });
  }
});

test("2. it names the artefacts that moved, and no others", () => {
  const dir = change(repo(), {
    "SURFACE.md": "# The surface\n\n## class\n",
    "bin/x.mjs": "// a tool, changed\n",
  });
  try {
    const r = kaal(["class", dir, "--against", "main"]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /^.*surface.*$/m);
    assert.match(r.stdout, /^.*tool.*$/m);
    assert.doesNotMatch(
      r.stdout,
      /skills/,
      "it named an artefact that did not move",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("3. a raise past the patch place is refused, and a patch is not", () => {
  const patched = change(repo("0.0.1"), {
    "package.json": '{ "name": "x", "version": "0.0.2" }\n',
  });
  const raised = change(repo("0.0.1"), {
    "package.json": '{ "name": "x", "version": "0.1.0" }\n',
  });
  try {
    const ok = kaal(["class", patched, "--against", "main"]);
    assert.equal(ok.status, 0, ok.stderr);
    const no = kaal(["class", raised, "--against", "main"]);
    assert.equal(no.status, 1, no.stdout);
    const lines = no.stderr.trim().split("\n");
    assert.equal(lines.length, 1, no.stderr);
    assert.match(lines[0], /0\.0\.1/);
    assert.match(lines[0], /0\.1\.0/);
    assert.match(lines[0], /human/i);
  } finally {
    for (const d of [patched, raised])
      rmSync(d, { recursive: true, force: true });
  }
});

test("4. the wall is on the board and the command is on the page", () => {
  const config = JSON.parse(
    spawnSync("cat", [join(ROOT, "kaal.config.json")], { encoding: "utf8" })
      .stdout,
  );
  assert.ok(
    config.gates.some((g) => /kaal\.mjs class\b/.test(g.command)),
    "no class wall in the gates list",
  );
  const page = spawnSync("cat", [join(ROOT, "SURFACE.md")], {
    encoding: "utf8",
  }).stdout;
  assert.match(page, /^## class$/m, "the page has no section for class");
});
