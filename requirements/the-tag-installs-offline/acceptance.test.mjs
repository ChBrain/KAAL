// Acceptance tests for requirement the-tag-installs-offline. One per
// criterion. Surface only: a git URL, npm, the command a consumer ends up
// with, and a clone's own git configuration. Nothing here imports the tool.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WIN = process.platform === "win32";
// npm goes through a shell on every platform (the-engine-is-installable
// says why), so anything that is not a bare word or a flag is quoted.
const quote = (a) => (/^[-a-z]+$/.test(a) ? a : `"${a}"`);
const npm = (args, cwd) =>
  spawnSync(WIN ? "npm.cmd" : "npm", args.map(quote), {
    cwd,
    encoding: "utf8",
    shell: true,
  });
const git = (args, cwd) => spawnSync("git", args, { cwd, encoding: "utf8" });
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;

// Nothing here may reach a registry: an empty cache and a registry on a port
// nobody listens on. Whatever an install needs beyond the clone itself fails
// here, which is what makes "offline" a measurement and not a flag.
const offline = (scratch) => [
  "--no-audit",
  "--no-fund",
  "--fetch-retries=0",
  `--cache=${join(scratch, "cache")}`,
  "--registry=http://127.0.0.1:9",
];

// A tag is a commit. A bare clone of this tree at HEAD is the same commit
// without the network, so it stands in for the tag a consumer would name.
function bare(scratch) {
  const repo = join(scratch, "kaal.git");
  const r = git(["clone", "--bare", "--quiet", ROOT, repo], scratch);
  assert.equal(r.status, 0, `git clone --bare: ${said(r)}`);
  return `git+${pathToFileURL(repo).href}`;
}

function emptyProject(scratch) {
  const consumer = join(scratch, "consumer");
  mkdirSync(consumer);
  const empty = {
    name: "a-tree-that-installs-kaal-from-a-tag",
    version: "1.0.0",
    private: true,
  };
  writeFileSync(join(consumer, "package.json"), `${JSON.stringify(empty)}\n`);
  return consumer;
}

function installedFromGit(scratch) {
  const url = bare(scratch);
  const consumer = emptyProject(scratch);
  const r = npm(["install", ...offline(scratch), url], consumer);
  assert.equal(r.status, 0, `npm install from a git URL: ${said(r)}`);
  return consumer;
}

test("1. installed from a git URL with no registry in reach, the tool answers on the command line", () => {
  const scratch = mkdtempSync(join(tmpdir(), "kaal-tag-"));
  try {
    const consumer = installedFromGit(scratch);
    const shim = join(consumer, "node_modules", ".bin", "kaal");
    const exe = WIN ? `${shim}.cmd` : shim;
    assert.ok(existsSync(exe), `no executable at ${exe}`);
    const run = spawnSync(`"${exe}"`, [], { encoding: "utf8", shell: true });
    assert.equal(run.status, 1, `kaal exited ${run.status}: ${said(run)}`);
    assert.match(run.stderr, /^usage: kaal /, `kaal said: ${run.stderr}`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test("2. the git install brings one package, and it is the tool and nothing of the league's working", () => {
  const scratch = mkdtempSync(join(tmpdir(), "kaal-tag-alone-"));
  try {
    const consumer = installedFromGit(scratch);
    const packages = readdirSync(join(consumer, "node_modules")).filter(
      (n) => !n.startsWith("."),
    );
    assert.deepEqual(packages, ["kaal"], `the install added ${packages}`);
    const inside = readdirSync(join(consumer, "node_modules", "kaal"));
    assert.ok(
      inside.includes("bin"),
      `no bin/ in the installed tool: ${inside}`,
    );
    for (const d of [
      "requirements",
      "architecture",
      "retros",
      "evals",
      "skills",
      "tests",
    ])
      assert.ok(!inside.includes(d), `the installed tool carries ${d}/`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test("3. AGENTS.md names one step that wires a clone's hook, and after it a fresh clone has core.hooksPath .githooks", () => {
  // The board in AGENTS.md is the contributor's contract: one line per step,
  // the command before a comment that says what it does. The step that wires
  // the hook is read from there, not assumed, so this test does not fix it.
  const agents = readFileSync(join(ROOT, "AGENTS.md"), "utf8");
  const board = agents.match(/```\n([\s\S]*?)```/)?.[1] ?? "";
  const lines = board
    .split("\n")
    .filter((l) => /wires the pre-push hook/.test(l));
  assert.equal(lines.length, 1, `steps that wire the hook: ${lines.length}`);
  const step = lines[0].split("#")[0].trim();
  assert.ok(step, "the step before the comment is empty");
  const scratch = mkdtempSync(join(tmpdir(), "kaal-clone-"));
  try {
    const clone = join(scratch, "clone");
    const c = git(["clone", "--quiet", ROOT, clone], scratch);
    assert.equal(c.status, 0, `git clone: ${said(c)}`);
    // The same dead registry and empty cache as the installs above, as
    // environment so they hold whatever the step turns out to be; the
    // formatter is left out so the step is not red for the registry's sake.
    const r = spawnSync(step, {
      cwd: clone,
      encoding: "utf8",
      shell: true,
      env: {
        ...process.env,
        npm_config_registry: "http://127.0.0.1:9",
        npm_config_cache: join(scratch, "cache"),
        npm_config_fetch_retries: "0",
        npm_config_audit: "false",
        npm_config_fund: "false",
        npm_config_omit: "dev",
      },
    });
    assert.equal(r.status, 0, `${step} in a clone: ${said(r)}`);
    const hooks = git(["config", "core.hooksPath"], clone);
    assert.equal(hooks.stdout.trim(), ".githooks", `hooksPath: ${said(hooks)}`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});
