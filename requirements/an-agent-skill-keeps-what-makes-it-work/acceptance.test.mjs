// Acceptance tests for an-agent-skill-keeps-what-makes-it-work. One per
// criterion. Surface only: source skill directories, what npm packages, what
// the documented assemble command writes, the skill's own executable
// evidence, the check command's findings, and the CI standard job.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  globSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const WIN = process.platform === "win32";
const flat = (p) => String(p).split(sep).join("/");
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;
const quote = (a) => (/^[-a-z]+$/.test(a) ? a : `"${a}"`);
const npmAt = (cwd, args) =>
  spawnSync(WIN ? "npm.cmd" : "npm", args.map(quote), {
    cwd,
    encoding: "utf8",
    shell: true,
  });
const run = (file, args = [], cwd = ROOT) =>
  spawnSync(process.execPath, [file, ...args], { cwd, encoding: "utf8" });
const nodeTest = (file, cwd) =>
  spawnSync(process.execPath, ["--test", file], { cwd, encoding: "utf8" });
const kaal = (args, cwd = ROOT) =>
  run(join(ROOT, "bin", "kaal.mjs"), args, cwd);
const filesBelow = (root) =>
  globSync(["**/*", "**/.*"], { cwd: root })
    .filter((p) => statSync(join(root, p)).isFile())
    .map(flat)
    .sort();
const skillNames = (root) =>
  readdirSync(join(root, "skills"))
    .filter((n) => existsSync(join(root, "skills", n, "SKILL.md")))
    .sort();

let PACKED;
const pack = (root) => {
  const out = mkdtempSync(join(tmpdir(), "kaal-portable-pack-"));
  const p = npmAt(root, [
    "pack",
    "--pack-destination",
    out,
    "--ignore-scripts",
  ]);
  assert.equal(p.status, 0, `npm pack: ${said(p)}`);
  const archives = globSync("*.tgz", { cwd: out });
  assert.equal(archives.length, 1, `expected one tarball: ${archives}`);
  const unpacked = join(out, "unpacked");
  mkdirSync(unpacked, { recursive: true });
  const x = spawnSync("tar", ["-xzf", join(out, archives[0]), "-C", unpacked], {
    encoding: "utf8",
  });
  assert.equal(x.status, 0, `tar: ${said(x)}`);
  const pkg = join(unpacked, "package");
  assert.ok(existsSync(pkg), "the archive contains no package directory");
  return { out, pkg };
};

const assembled = () => {
  if (PACKED.assembled) return PACKED.assembled;
  const out = mkdtempSync(join(tmpdir(), "kaal-portable-assembled-"));
  const dest = join(out, "skills");
  const r = run(
    join(PACKED.pkg, "bin", "kaal.mjs"),
    ["assemble", dest],
    PACKED.pkg,
  );
  assert.equal(r.status, 0, `assemble: ${said(r)}`);
  PACKED.assembled = { out, dest };
  return PACKED.assembled;
};

before(() => {
  PACKED = pack(ROOT);
});

test("1. skills/<name>/ is the complete ownership and portability boundary", () => {
  const names = skillNames(ROOT);
  assert.ok(names.length, "the source contains no skills");
  for (const name of names) {
    const source = filesBelow(join(ROOT, "skills", name));
    const shipped = filesBelow(join(PACKED.pkg, "skills", name));
    assert.ok(source.length, `${name} has no owned files`);
    assert.deepEqual(shipped, source, `${name} did not travel as one tree`);
  }
});

test("2. one travelling skill keeps every owned path below one named root", () => {
  const { dest } = assembled();
  const names = skillNames(ROOT);
  assert.deepEqual(
    readdirSync(dest).sort(),
    names,
    "assembly flattened a skill or wrote beside its named root",
  );
  for (const name of names)
    assert.deepEqual(
      filesBelow(join(dest, name)),
      filesBelow(join(ROOT, "skills", name)),
      `${name} lost or flattened an owned path`,
    );
});

test("3. skill-owned scripts and their tests ship and remain runnable", () => {
  const pairs = [];
  for (const name of skillNames(ROOT)) {
    const scripts = join(ROOT, "skills", name, "scripts");
    if (!existsSync(scripts)) continue;
    for (const script of globSync("*.mjs", { cwd: scripts })) {
      if (script.endsWith(".test.mjs")) continue;
      const testFile = script.replace(/\.mjs$/, ".test.mjs");
      if (existsSync(join(scripts, testFile)))
        pairs.push({ name, script, testFile });
    }
  }
  assert.ok(pairs.length, "no skill-owned script and test pair exists");
  for (const pair of pairs) {
    const base = join(PACKED.pkg, "skills", pair.name, "scripts");
    assert.ok(
      existsSync(join(base, pair.script)),
      `${pair.name}/${pair.script} did not ship`,
    );
    assert.ok(
      existsSync(join(base, pair.testFile)),
      `${pair.name}/${pair.testFile} did not ship`,
    );
    const r = nodeTest(join(base, pair.testFile), base);
    assert.equal(r.status, 0, `${pair.name}'s shipped test fails: ${said(r)}`);
  }
});

test("4. the package and assembled copy preserve every owned byte", () => {
  const { dest } = assembled();
  for (const name of skillNames(ROOT)) {
    const sourceRoot = join(ROOT, "skills", name);
    const paths = filesBelow(sourceRoot);
    assert.ok(paths.length, `${name} has no files to compare`);
    for (const rel of paths) {
      const source = readFileSync(join(sourceRoot, rel));
      for (const [place, root] of [
        ["package", join(PACKED.pkg, "skills", name)],
        ["assembled copy", join(dest, name)],
      ]) {
        const there = join(root, rel);
        assert.ok(existsSync(there), `${place} lost skills/${name}/${rel}`);
        assert.deepEqual(
          readFileSync(there),
          source,
          `${place} changed skills/${name}/${rel}`,
        );
      }
    }
  }
});

test("5. ownership outranks repository-working directory names", () => {
  const fixture = join(HERE, "fixtures", "ownership", "tree");
  const scratch = mkdtempSync(join(tmpdir(), "kaal-ownership-fixture-"));
  try {
    cpSync(fixture, scratch, { recursive: true });
    const manifest = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    );
    manifest.name = "kaal-ownership-fixture";
    delete manifest.bin;
    delete manifest.scripts;
    delete manifest.devDependencies;
    writeFileSync(
      join(scratch, "package.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    );
    const fixturePack = pack(scratch);
    const inside = filesBelow(join(fixturePack.pkg, "skills", "portable"));
    const expected = filesBelow(join(fixture, "skills", "portable"));
    assert.deepEqual(
      inside,
      expected,
      "owned paths were excluded by their names",
    );
    const all = filesBelow(fixturePack.pkg);
    for (const outside of [
      "requirements",
      "architecture",
      "tests",
      "retros",
      "deploy",
      "evals",
    ])
      assert.equal(
        all.some((p) => p.startsWith(`${outside}/`)),
        false,
        `${outside}/ outside the skill travelled`,
      );
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

const retroCapability = () => {
  const ledger = JSON.parse(
    readFileSync(join(ROOT, "skills", "retro-4ls", "moves.json"), "utf8"),
  );
  const move = ledger.moves.find((m) =>
    m.name.includes("check whether the skill has ten unconsumed retros"),
  );
  assert.ok(move, "retro-4ls names no move that checks unconsumed retros");
  return move;
};

test("6. a required capability has runnable script evidence inside its skill", () => {
  const move = retroCapability();
  assert.equal(
    move.rung,
    "script",
    "the required retro count still exists only outside the skill",
  );
  assert.match(
    move.script ?? "",
    /^scripts\/.+\.mjs$/,
    "the move names no skill-owned script",
  );
  assert.match(
    move.test ?? "",
    /^scripts\/.+\.test\.mjs$/,
    "the move names no skill-owned test",
  );
  const skill = join(ROOT, "skills", "retro-4ls");
  assert.ok(existsSync(join(skill, move.script)), `missing ${move.script}`);
  assert.ok(existsSync(join(skill, move.test)), `missing ${move.test}`);
  const proof = nodeTest(join(skill, move.test), skill);
  assert.equal(
    proof.status,
    0,
    `the skill-owned evidence is red: ${said(proof)}`,
  );
});

test("7. the KAAL entrance and the skill capability have one behaviour", () => {
  const move = retroCapability();
  assert.match(
    move.script ?? "",
    /^scripts\/.+\.mjs$/,
    "the skill capability has no executable entrance",
  );
  const fixture = mkdtempSync(join(tmpdir(), "kaal-retros-capability-"));
  try {
    mkdirSync(join(fixture, "skills", "retro-4ls"), { recursive: true });
    mkdirSync(join(fixture, "skills", "analyse"), { recursive: true });
    mkdirSync(join(fixture, "retros"), { recursive: true });
    writeFileSync(
      join(fixture, "retros", "one.md"),
      "# Retro\n\nFeeds: analyse\nRead: retro-4ls\n",
    );
    const engine = kaal(["retros", fixture]);
    const skill = run(join(ROOT, "skills", "retro-4ls", move.script), [
      fixture,
    ]);
    assert.equal(
      skill.status,
      engine.status,
      `exit behaviour differs: ${said(skill)} / ${said(engine)}`,
    );
    assert.equal(
      skill.stdout,
      engine.stdout,
      `answers differ: ${said(skill)} / ${said(engine)}`,
    );
    assert.equal(
      skill.stderr,
      engine.stderr,
      `failure output differs: ${said(skill)} / ${said(engine)}`,
    );
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("8. the pinned global validator checks source, packaged and assembled skills", () => {
  const config = JSON.parse(
    readFileSync(join(ROOT, "kaal.config.json"), "utf8"),
  );
  const ref = config.standard?.validator?.ref;
  assert.match(
    ref ?? "",
    /^[0-9a-f]{40}$/,
    "the validator is not pinned to a commit",
  );
  const ci = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
  const job =
    ci.match(/^ {2}standard:\n([\s\S]*?)(?=^ {2}\S|(?![\s\S]))/m)?.[1] ?? "";
  assert.ok(
    job.includes(`agentskills@${ref}`),
    "the standard job does not install the pinned validator",
  );
  assert.match(
    job,
    /skills\/\*\/[\s\S]*skills-ref validate/,
    "source skills are not validated",
  );
  const validatorLines = job
    .split("\n")
    .filter((line) => line.includes("skills-ref validate"));
  assert.ok(
    validatorLines.some((line) => /pack|package/i.test(line)),
    "packaged skills are not validated",
  );
  assert.ok(
    validatorLines.some((line) => /assembl/i.test(line)),
    "assembled skills are not validated",
  );
});

test("9. findings distinguish the pinned global standard from KAAL local policy", () => {
  const r = kaal(["check", join(HERE, "fixtures", "policy")]);
  assert.equal(r.status, 1, `the two broken skills passed: ${said(r)}`);
  const out = said(r);
  assert.match(
    out,
    /^portable: vendor: .*local policy/im,
    `the local-only rule has no authority: ${out}`,
  );
  assert.doesNotMatch(
    out,
    /^portable: vendor: .*global standard/im,
    `a local rule was attributed globally: ${out}`,
  );
  assert.match(
    out,
    /^bad_name: name: .*global standard/im,
    `the global name rule has no authority: ${out}`,
  );
});

test("10. test packaging follows ownership, not the filename alone", () => {
  const shipped = filesBelow(PACKED.pkg);
  const inside = globSync("skills/*/**/*.test.mjs", { cwd: ROOT }).map(flat);
  const outside = globSync(
    [
      "requirements/**/*.test.mjs",
      "architecture/**/*.test.mjs",
      "bin/**/*.test.mjs",
      "tests/**/*.test.mjs",
    ],
    { cwd: ROOT },
  ).map(flat);
  assert.ok(inside.length, "there is no skill-owned test witness");
  assert.ok(outside.length, "there is no repository-test witness");
  for (const path of inside)
    assert.ok(
      shipped.includes(path),
      `skill-owned test did not travel: ${path}`,
    );
  for (const path of outside)
    assert.equal(
      shipped.includes(path),
      false,
      `repository test travelled: ${path}`,
    );
});
