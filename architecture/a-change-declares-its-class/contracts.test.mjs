// Contract tests for the drawing a-change-declares-its-class. One per seam.
// Blind to the module: the tool as a command, on git repositories these
// tests build, because a command that reads history cannot be proven on a
// directory of files.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
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
const temp = (tag) => mkdtempSync(join(tmpdir(), `kaal-class-c-${tag}-`));

const repo = (version = "0.0.1") => {
  const dir = temp("repo");
  git(dir, "init", "-b", "main");
  mkdirSync(join(dir, "bin"), { recursive: true });
  mkdirSync(join(dir, "skills", "one"), { recursive: true });
  mkdirSync(join(dir, "requirements", "t"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    `{ "name": "x", "version": "${version}" }\n`,
  );
  writeFileSync(join(dir, "SURFACE.md"), "# The surface\n");
  writeFileSync(join(dir, "bin", "x.mjs"), "// a tool\n");
  writeFileSync(join(dir, "skills", "one", "SKILL.md"), "# one\n");
  writeFileSync(join(dir, "requirements", "t", "requirement.md"), "# t\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-m", "base");
  return dir;
};
const change = (dir, files) => {
  git(dir, "checkout", "-q", "-b", "work");
  for (const [path, body] of Object.entries(files))
    writeFileSync(join(dir, path), body);
  git(dir, "add", "-A");
  git(dir, "commit", "-m", "work");
  return dir;
};
const clean = (...dirs) =>
  dirs.forEach((d) => rmSync(d, { recursive: true, force: true }));

test("1. the three artefacts are named when they move, and a league change names none", () => {
  const skillsOnly = change(repo(), {
    "skills/one/SKILL.md": "# one, changed\n",
  });
  const leagueOnly = change(repo(), {
    "requirements/t/requirement.md": "# t, changed\n",
  });
  try {
    const s = kaal(["class", skillsOnly, "--against", "main"]);
    assert.equal(s.status, 0, s.stderr);
    assert.match(s.stdout, /skills/);
    assert.doesNotMatch(s.stdout, /surface/);
    assert.doesNotMatch(s.stdout, /tool/);
    // The common case, and the easy one to get wrong.
    const l = kaal(["class", leagueOnly, "--against", "main"]);
    assert.equal(l.status, 0, l.stderr);
    assert.doesNotMatch(l.stdout, /surface|tool|skills/);
  } finally {
    clean(skillsOnly, leagueOnly);
  }
});

test("2. equal and patch pass, minor and major are refused by name", () => {
  const same = change(repo("0.0.1"), { "bin/x.mjs": "// changed\n" });
  const patch = change(repo("0.0.1"), {
    "package.json": '{ "name": "x", "version": "0.0.9" }\n',
  });
  const minor = change(repo("0.0.1"), {
    "package.json": '{ "name": "x", "version": "0.1.0" }\n',
  });
  const major = change(repo("0.0.1"), {
    "package.json": '{ "name": "x", "version": "1.0.0" }\n',
  });
  try {
    for (const [name, dir] of [
      ["equal", same],
      ["patch", patch],
    ]) {
      const r = kaal(["class", dir, "--against", "main"]);
      assert.equal(r.status, 0, `${name}: ${r.stderr}`);
    }
    for (const [name, dir, to] of [
      ["minor", minor, "0.1.0"],
      ["major", major, "1.0.0"],
    ]) {
      const r = kaal(["class", dir, "--against", "main"]);
      assert.equal(r.status, 1, `${name}: ${r.stdout}`);
      const lines = r.stderr.trim().split("\n");
      assert.equal(lines.length, 1, `${name}: ${r.stderr}`);
      assert.match(lines[0], /0\.0\.1/, name);
      assert.match(lines[0], new RegExp(to.replace(/\./g, "\\.")), name);
      assert.match(lines[0], /human/i, name);
    }
  } finally {
    clean(same, patch, minor, major);
  }
});

test("3. a tree with no history, or no package, is not this question's", () => {
  const noGit = temp("nogit");
  writeFileSync(join(noGit, "package.json"), '{ "version": "0.0.1" }\n');
  const noPkg = temp("nopkg");
  git(noPkg, "init", "-b", "main");
  writeFileSync(join(noPkg, "a.txt"), "a\n");
  git(noPkg, "add", "-A");
  git(noPkg, "commit", "-m", "base");
  try {
    for (const [name, dir] of [
      ["no git", noGit],
      ["no package", noPkg],
    ]) {
      const r = kaal(["class", dir]);
      assert.equal(r.status, 2, `${name}: ${r.stdout}${r.stderr}`);
      assert.equal(r.stdout, "", `${name} wrote to stdout`);
      const lines = r.stderr.trim().split("\n");
      assert.equal(lines.length, 1, `${name}: ${r.stderr}`);
      assert.match(lines[0], /^class: not applicable here: \S/, name);
    }
    // And the league itself answers, which is the other half of the table's
    // promise: applicability is per command and never per tree.
    const here = kaal(["class", ROOT, "--against", "HEAD"]);
    assert.notEqual(here.status, 2, here.stderr);
  } finally {
    clean(noGit, noPkg);
  }
});
