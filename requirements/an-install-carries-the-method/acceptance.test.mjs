// Acceptance tests for requirement an-install-carries-the-method. One per
// criterion. Surface only: what `npm pack` produces, unpacked into a scratch
// directory, which is byte for byte what a consumer's package manager puts in
// `node_modules`; the commands run against that directory; and the page a
// consumer reads.
//
// Offline: `npm pack` reads the working tree and touches no registry, and
// nothing here installs from a network.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  globSync,
} from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;
const WIN = process.platform === "win32";
// npm is a shell script on one platform and a batch file on the other, and
// node has refused to spawn a batch file without a shell since it was found
// to be an injection, so npm always goes through one. A shell splits on
// spaces, so anything that is not a bare word or a flag is quoted; a
// temporary directory's path is the one argument here that can carry a space.
// The three suites that pack before this one each learned it separately; this
// one spawned a bare `npm` and every criterion under it failed on Windows for
// a spawn that never started.
const quote = (a) => (/^[-a-z]+$/.test(a) ? a : `"${a}"`);
const npm = (args) =>
  spawnSync(WIN ? "npm.cmd" : "npm", args.map(quote), {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
  });
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
  });
/** A path as the tarball writes it, so two platforms read one string. */
const flat = (p) => String(p).split(sep).join("/");

// Packed once for every test: `npm pack` is the slowest thing here and its
// answer is the same for all six.
let PACKED = null;
const packed = () => {
  if (PACKED) return PACKED;
  const out = mkdtempSync(join(tmpdir(), "kaal-pack-"));
  const r = npm(["pack", "--pack-destination", out, "--ignore-scripts"]);
  assert.equal(r.status, 0, `npm pack: ${said(r)}`);
  const tgz = globSync("*.tgz", { cwd: out }).map((f) => join(out, f));
  assert.equal(tgz.length, 1, `expected one tarball, got ${tgz.length}`);
  const dir = join(out, "unpacked");
  mkdirSync(dir, { recursive: true });
  // tar is an executable on both platforms, so it needs no shell, and
  // without one neither path needs quoting.
  const x = spawnSync("tar", ["-xzf", tgz[0], "-C", dir], {
    encoding: "utf8",
  });
  assert.equal(x.status, 0, `tar: ${said(x)}`);
  // Every tarball unpacks to `package/`, which is what lands in node_modules.
  const pkg = join(dir, "package");
  assert.ok(existsSync(pkg), "the tarball holds no package/ directory");
  const files = globSync(["**/*", "**/.*"], { cwd: pkg, withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => flat(relative(pkg, join(d.parentPath ?? d.path, d.name))));
  assert.ok(files.length, "the package is empty");
  PACKED = { out, pkg, files };
  return PACKED;
};
before(() => packed());

test("1. what ships carries the method: every skill and every agent this tree holds", () => {
  const { files, pkg } = packed();
  // Counted from the tree rather than written down: a list here is true on
  // the day it is written and false on the day a skill is added.
  const skills = globSync("skills/*/SKILL.md", { cwd: ROOT }).map(flat);
  const agents = globSync("agents/*/AGENT.md", { cwd: ROOT }).map(flat);
  assert.ok(skills.length >= 5, `only ${skills.length} skills in the tree`);
  assert.ok(agents.length >= 1, `no agent in the tree`);
  for (const p of [...skills, ...agents])
    assert.ok(files.includes(p), `${p} is not in the package`);
  // And what each of them names beside it, not the page alone: a skill whose
  // references did not travel is a skill that does not work where it lands.
  for (const s of skills) {
    const beside = globSync("**/*", { cwd: join(ROOT, dirname(s)) })
      .map((f) => flat(join(dirname(s), f)))
      .filter((f) => existsSync(join(ROOT, f)) && !f.endsWith(".test.mjs"));
    const missing = beside.filter(
      (f) => !files.includes(f) && !existsSync(join(pkg, f)),
    );
    assert.deepEqual(missing, [], `${dirname(s)} shipped without: ${missing}`);
  }
});

test("2. what ships carries nothing of the league's own working, and no test", () => {
  const { files } = packed();
  for (const place of [
    "requirements",
    "architecture",
    "tests",
    "retros",
    "deploy",
    "evals",
  ]) {
    const leaked = files.filter((f) => f.startsWith(place + "/"));
    assert.deepEqual(leaked, [], `${place}/ shipped: ${leaked.slice(0, 3)}`);
  }
  const tests = files.filter((f) => f.endsWith(".test.mjs"));
  assert.deepEqual(tests, [], `a test shipped: ${tests}`);
});

test("3. every command that refuses an empty tree answers when pointed at what was installed", () => {
  const { pkg } = packed();
  // The five are read from what they do rather than trusted: each is asserted
  // to refuse a tree that holds none of the league first, so a command that
  // answered everywhere could never pass this by accident.
  const empty = mkdtempSync(join(tmpdir(), "kaal-empty-"));
  try {
    for (const [cmd, arg] of [
      ["check", null],
      ["ledger", null],
      ["agents", null],
      ["retros", null],
      ["runner", "analyse"],
    ]) {
      const away = spawnSync(
        process.execPath,
        [join(ROOT, "bin", "kaal.mjs"), cmd, ...(arg ? [arg] : [])],
        { cwd: empty, encoding: "utf8" },
      );
      assert.equal(
        away.status,
        2,
        `${cmd} did not refuse an empty tree: ${said(away)}`,
      );
      // `check` is given a skills directory and the rest a root, which is the
      // asymmetry the commands already have.
      const at = cmd === "check" ? join(pkg, "skills") : pkg;
      const here =
        cmd === "runner"
          ? spawnSync(
              process.execPath,
              [join(ROOT, "bin", "kaal.mjs"), "runner", "--check"],
              { cwd: pkg, encoding: "utf8" },
            )
          : kaal(cmd, at);
      // 0 or 1 and never 2. A finding is an answer: a consumer's copy
      // carries the method and not this league's eval records, so the
      // ledger reports unevidenced rungs and has answered by doing so.
      assert.notEqual(
        here.status,
        2,
        `${cmd} still refuses the package: ${said(here)}`,
      );
      assert.ok(
        here.status === 0 || here.status === 1,
        `${cmd} exited ${here.status} against the package: ${said(here)}`,
      );
    }
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

test("4. a consumer places the method in one documented step, and following it puts every skill where they said", () => {
  const { pkg } = packed();
  const page = readFileSync(join(ROOT, "README.md"), "utf8");
  // The page names the step by name, so a reader can run it rather than
  // reconstruct it. Which shape the step takes is the drawing's.
  const named = page.match(/`kaal ([a-z-]+)[^`]*`/g) ?? [];
  const step = named.find((m) => /assemble|install|place|adopt|carry/.test(m));
  assert.ok(
    step,
    `README.md names no step that places a skill: ${named.slice(0, 8)}`,
  );
  const verb = step.match(/`kaal ([a-z-]+)/)[1];
  const into = mkdtempSync(join(tmpdir(), "kaal-into-"));
  try {
    const dest = join(into, "loaded");
    const r = spawnSync(
      process.execPath,
      [join(ROOT, "bin", "kaal.mjs"), verb, dest],
      { cwd: pkg, encoding: "utf8" },
    );
    assert.equal(r.status, 0, `the step refused: ${said(r)}`);
    // Every skill the package ships, not one of them. A consumer who has to
    // ask a member at a time is assembling the league themselves, which is
    // the thing this package exists not to ask for.
    const shipped = globSync("skills/*/SKILL.md", { cwd: pkg }).map(
      (p) => flat(p).split("/")[1],
    );
    assert.ok(shipped.length > 1, `the package ships ${shipped.length} skills`);
    for (const skill of shipped) {
      const landed = join(dest, skill, "SKILL.md");
      assert.ok(existsSync(landed), `nothing at ${landed}: ${said(r)}`);
      assert.equal(
        readFileSync(landed, "utf8"),
        readFileSync(join(pkg, "skills", skill, "SKILL.md"), "utf8"),
        `what landed for ${skill} is not what shipped`,
      );
    }
  } finally {
    rmSync(into, { recursive: true, force: true });
  }
});

test("5. nothing writes into a consumer's tree until the step is taken", () => {
  const { pkg } = packed();
  const proj = mkdtempSync(join(tmpdir(), "kaal-proj-"));
  try {
    const before = globSync(["**/*", "**/.*"], { cwd: proj });
    // The witness: the commands ran and did their work, so an unchanged tree
    // is a fact about them and not about nothing having happened.
    let answered = 0;
    for (const cmd of ["check", "ledger", "agents", "retros", "coverage"]) {
      const r = spawnSync(
        process.execPath,
        [join(ROOT, "bin", "kaal.mjs"), cmd, pkg],
        { cwd: proj, encoding: "utf8" },
      );
      assert.notEqual(r.status, null, `${cmd} did not run at all`);
      // The witness is that it read something and said something, not that
      // it liked what it read: an unchanged tree has to be a fact about a
      // command that worked.
      if (r.status !== 2 && said(r).trim()) answered++;
    }
    assert.ok(answered >= 3, `only ${answered} of five commands answered`);
    const after = globSync(["**/*", "**/.*"], { cwd: proj });
    assert.deepEqual(
      after.sort(),
      before.sort(),
      `the tool wrote into a tree that did not ask: ${after}`,
    );
  } finally {
    rmSync(proj, { recursive: true, force: true });
  }
});

test("6. what ships obeys the skill rules where it lands", () => {
  const { pkg } = packed();
  const r = kaal("check", join(pkg, "skills"));
  assert.equal(r.status, 0, `the shipped skills break the rules: ${said(r)}`);
});
