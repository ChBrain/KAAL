// Acceptance tests for requirement an-open-finding-blocks-every-target. One
// per criterion. Surface only: `kaal gates` and the security gate declared by
// architect-owned semantic trees. Their contents deliberately stay out of
// this file, because the evidence record, its location, its waiver key and
// its change binding belong to the drawing.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURES = join(
  ROOT,
  "architecture",
  "an-open-finding-blocks-every-target",
  "fixtures",
);
const fixture = (name) => {
  const root = join(FIXTURES, name);
  assert.ok(
    existsSync(root),
    `${name}: no architect-owned semantic tree at ${root}`,
  );
  return root;
};
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;
const kaal = (root, target) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), "gates", root], {
    encoding: "utf8",
    cwd: root,
    env: {
      ...process.env,
      GITHUB_BASE_REF: "",
      GITHUB_HEAD_REF: "",
      KAAL_BASE: `origin/${target}`,
      KAAL_BRANCH: "requirement/security-case",
    },
  });

/** The fixture declares one gate named security; the drawing chooses its command. */
const security = (root) => {
  const path = join(root, "kaal.config.json");
  assert.ok(existsSync(path), `${root}: no kaal.config.json`);
  const config = JSON.parse(readFileSync(path, "utf8"));
  const gate = config.gates?.find((g) => g.name === "security");
  assert.ok(gate?.command, `${path}: no security gate with a command`);
  return gate;
};

/**
 * Run the wall alone with no credential-shaped environment and with common
 * Node network and clock entry points refused. A wall implemented outside
 * Node still has no token and must produce the same answer twice.
 */
const runWall = (root) => {
  const temp = mkdtempSync(join(tmpdir(), "kaal-security-offline-"));
  const guard = join(temp, "guard.cjs");
  writeFileSync(
    guard,
    `const deny = (what) => () => { throw new Error("acceptance: " + what + " used"); };
for (const name of ["node:net", "node:http", "node:https", "node:dns"]) {
  const mod = require(name);
  for (const key of ["connect", "createConnection", "request", "get", "lookup", "resolve"])
    if (typeof mod[key] === "function") mod[key] = deny("network");
}
global.fetch = deny("network");
const RealDate = Date;
global.Date = class extends RealDate {
  constructor(...args) {
    if (args.length === 0) throw new Error("acceptance: clock used");
    super(...args);
  }
  static now() { throw new Error("acceptance: clock used"); }
};
`,
  );
  try {
    const gate = security(root);
    return spawnSync(gate.command, {
      encoding: "utf8",
      cwd: root,
      shell: true,
      env: {
        PATH: process.env.PATH ?? "",
        NODE_OPTIONS: `--require=${guard}`,
        SYSTEMROOT: process.env.SYSTEMROOT ?? "",
      },
    });
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
};

test("1. an open security finding blocks release and main", () => {
  const root = fixture("open");
  const wall = runWall(root);
  assert.equal(wall.status, 1, `the security wall is not red: ${said(wall)}`);
  for (const target of ["release", "main"]) {
    const r = kaal(root, target);
    assert.equal(r.status, 1, `an open finding reached ${target}: ${said(r)}`);
    assert.match(
      said(r),
      /security/i,
      `${target} does not name the security wall: ${said(r)}`,
    );
  }
});

test("2. absent evidence is red and never looks clean", () => {
  const absent = runWall(fixture("absent"));
  const clean = runWall(fixture("clean"));
  assert.equal(absent.status, 1, `absent evidence passed: ${said(absent)}`);
  assert.notEqual(said(absent).trim(), "", "absent evidence answered nothing");
  assert.match(
    said(absent),
    /absent|missing|not gathered|no [^\n]*evidence/i,
    `the answer does not say the evidence is absent: ${said(absent)}`,
  );
  assert.equal(clean.status, 0, `clean evidence is red: ${said(clean)}`);
  assert.notEqual(
    said(absent),
    said(clean),
    "absent and clean produced the same answer",
  );
});

test("3. the wall is offline, clockless and deterministic", () => {
  const root = fixture("clean");
  const first = runWall(root);
  const second = runWall(root);
  assert.equal(
    first.status,
    0,
    `the guarded wall did not answer: ${said(first)}`,
  );
  assert.deepEqual(
    { status: first.status, stdout: first.stdout, stderr: first.stderr },
    { status: second.status, stdout: second.stdout, stderr: second.stderr },
    "two runs over the same files disagreed",
  );
});

test("4. only governance may carry an accepted risk", () => {
  const root = fixture("waived");
  const wall = runWall(root);
  assert.equal(
    wall.status,
    1,
    `the waived finding was reported clean: ${said(wall)}`,
  );
  const r = kaal(root, "main");
  assert.equal(r.status, 0, `the governance waiver did not apply: ${said(r)}`);
  assert.match(said(r), /waived[^\n]*security|security[^\n]*waived/i, said(r));
  const waivers = join(root, "waivers");
  assert.ok(existsSync(waivers), "the accepted risk is not under waivers/**");
  assert.ok(
    readdirSync(waivers, { recursive: true }).length > 0,
    "waivers/** holds no accepted risk",
  );
  const config = JSON.parse(readFileSync(join(root, "kaal.config.json")));
  const governance = config.lanes?.find((l) => l.pattern === "governance/*");
  assert.ok(
    governance?.allows?.includes("waivers/**"),
    "the governance lane does not carry waivers/**",
  );
  for (const lane of config.lanes?.filter((l) => l.seat) ?? [])
    assert.ok(
      !lane.allows?.includes("waivers/**"),
      `${lane.pattern}: a seated lane may carry waivers/**`,
    );
});

test("5. a waiver stops applying when the code it names changes", () => {
  const waived = kaal(fixture("waived"), "main");
  const changed = kaal(fixture("changed"), "main");
  assert.equal(
    waived.status,
    0,
    `the unchanged waiver is red: ${said(waived)}`,
  );
  assert.equal(
    changed.status,
    1,
    `the waiver outlived the code it excused: ${said(changed)}`,
  );
  assert.notEqual(
    said(waived),
    said(changed),
    "the code change did not change the wall's answer",
  );
});
