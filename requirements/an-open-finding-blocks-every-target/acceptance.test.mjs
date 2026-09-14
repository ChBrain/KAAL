// Acceptance tests for requirement an-open-finding-blocks-every-target. One
// per criterion. Surface only: `kaal gates` and the security gate declared by
// architect-owned semantic trees. Their contents deliberately stay out of
// this file, because the evidence record, its location, its waiver key and
// its change binding belong to the drawing.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURES = join(
  ROOT,
  "architecture",
  "an-open-finding-blocks-every-target",
  "fixtures",
);
const OWN_FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
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

/** Run the wall alone with no credential-shaped environment. */
const runWall = (root) => {
  const gate = security(root);
  return spawnSync(gate.command, {
    encoding: "utf8",
    cwd: root,
    shell: true,
    env: {
      PATH: process.env.PATH ?? "",
      SYSTEMROOT: process.env.SYSTEMROOT ?? process.env.SystemRoot ?? "",
      COMSPEC: process.env.COMSPEC ?? process.env.ComSpec ?? "",
      PATHEXT: process.env.PATHEXT ?? "",
    },
  });
};

const currentFixture = (name) => join(FIXTURES, "current-evidence", name);

const requireCurrentFixtures = (names) => {
  const missing = names.filter((name) => !existsSync(currentFixture(name)));
  assert.deepEqual(
    missing,
    [],
    `no amended drawing for semantic tree(s): ${missing.join(", ")}`,
  );
  return names.map((name) => currentFixture(name));
};

const scratchClean = () => {
  // Keep the semantic tree at the same depth as the drawing's fixtures. Its
  // gate command is intentionally the drawing's choice and may be relative.
  const root = mkdtempSync(join(FIXTURES, ".current-security-"));
  cpSync(fixture("clean"), root, { recursive: true });
  return root;
};

const changedCandidate = (kind) => {
  const root = scratchClean();
  const source = join(root, "src", "guard.mjs");
  if (kind === "modified")
    copyFileSync(
      join(OWN_FIXTURES, "candidate", "modified", "guard.mjs"),
      source,
    );
  if (kind === "deleted") rmSync(source);
  if (kind === "renamed") {
    const renamed = join(root, "src", "guard-renamed.mjs");
    renameSync(source, renamed);
  }
  if (kind === "added") {
    mkdirSync(join(root, "new"), { recursive: true });
    copyFileSync(
      join(OWN_FIXTURES, "candidate", "added", "unseen.mjs"),
      join(root, "new", "unseen.mjs"),
    );
  }
  return root;
};

const acceptanceCriteriaSha = () => {
  const requirement = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "requirement.md"),
    "utf8",
  );
  const criteria = requirement.match(
    /^## Acceptance criteria\n([\s\S]*?)(?=^## |(?![\s\S]))/m,
  )?.[1];
  assert.ok(criteria, "the requirement has no acceptance criteria");
  return createHash("sha256").update(criteria).digest("hex");
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

test("3. the wall is tokenless and deterministic", () => {
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

test("6. clean evidence goes stale when candidate content changes", () => {
  for (const kind of ["modified", "deleted", "renamed"]) {
    const root = changedCandidate(kind);
    try {
      const r = runWall(root);
      const answer = said(r).trim();
      assert.equal(
        r.status,
        1,
        `${kind} candidate content did not make the wall red: ${answer}`,
      );
      assert.match(
        answer,
        /stale|candidate|changed/i,
        `${kind} candidate content was rejected for the wrong reason: ${answer}`,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});

test("7. added candidate content makes clean evidence stale", () => {
  const root = changedCandidate("added");
  try {
    const r = runWall(root);
    assert.equal(
      r.status,
      1,
      `added content kept old clean evidence green: ${said(r)}`,
    );
    assert.match(said(r), /stale|candidate|changed/i, said(r));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("8. only a completed clean analysis of the exact candidate is green", () => {
  const red = [
    "no-analysis",
    "wrong-candidate",
    "incomplete-analysis",
    "errored-analysis",
    "retrieval-unavailable",
    "retrieval-unauthorized",
    "incomplete-collection",
    "stale",
    "open",
  ];
  requireCurrentFixtures([...red, "current-clean"]);
  const answers = red.map((name) => {
    const r = runWall(currentFixture(name));
    assert.equal(r.status, 1, `${name} passed: ${said(r)}`);
    assert.notEqual(said(r).trim(), "", `${name} answered nothing`);
    return said(r).trim();
  });
  assert.equal(
    new Set(answers).size,
    answers.length,
    `red states are not distinguishable: ${answers.join(" | ")}`,
  );
  const clean = runWall(currentFixture("current-clean"));
  assert.equal(
    clean.status,
    0,
    `current clean analysis is red: ${said(clean)}`,
  );
});

test("9. partial finding collection never impersonates the complete set", () => {
  const names = [
    "incomplete-collection",
    "primary-location-only",
    "complete-multiple-open",
  ];
  requireCurrentFixtures(names);
  for (const name of names.slice(0, 2)) {
    const r = runWall(currentFixture(name));
    assert.equal(r.status, 1, `${name} passed: ${said(r)}`);
    assert.match(
      said(r),
      /incomplete|partial|truncat|location|collection/i,
      `${name} did not explain its incompleteness: ${said(r)}`,
    );
  }
  const complete = runWall(currentFixture("complete-multiple-open"));
  assert.equal(complete.status, 1, `open findings passed: ${said(complete)}`);
  for (const finding of ["fixture-first-open", "fixture-second-open"])
    assert.match(
      said(complete),
      new RegExp(finding),
      `the complete result omitted ${finding}: ${said(complete)}`,
    );
});

test("10. the board cannot judge before current gathering completes", () => {
  requireCurrentFixtures(["gathering-in-progress", "current-clean"]);
  const early = kaal(currentFixture("gathering-in-progress"), "release");
  assert.equal(early.status, 1, `the board raced gathering: ${said(early)}`);
  assert.match(said(early), /security/i, said(early));
  const complete = kaal(currentFixture("current-clean"), "release");
  assert.equal(
    complete.status,
    0,
    `the board refused current completed evidence: ${said(complete)}`,
  );
});

test("11. a release pull request finding blocks that candidate before merge", () => {
  requireCurrentFixtures(["release-pr-open"]);
  const r = kaal(currentFixture("release-pr-open"), "release");
  assert.equal(r.status, 1, `the release candidate could merge: ${said(r)}`);
  assert.match(said(r), /security/i, said(r));
  assert.match(said(r), /fixture-release-pr-open/i, said(r));
});

test("12. head, merge ref and merge result are not silently conflated", () => {
  const names = [
    "head-evidence-merge-candidate",
    "merge-evidence-head-candidate",
    "premerge-evidence-postmerge-candidate",
  ];
  requireCurrentFixtures(names);
  for (const name of names) {
    const r = runWall(currentFixture(name));
    assert.equal(r.status, 1, `${name} passed: ${said(r)}`);
    assert.match(said(r), /candidate|mismatch|wrong|stale/i, said(r));
  }
});

test("13. a manually authored legacy empty snapshot is not clean evidence", () => {
  const root = mkdtempSync(join(OWN_FIXTURES, ".manual-empty-"));
  try {
    cpSync(join(OWN_FIXTURES, "manual-empty"), root, { recursive: true });
    mkdirSync(join(root, "kaal", "security"), { recursive: true });
    writeFileSync(
      join(root, "kaal", "security", "findings.json"),
      JSON.stringify({ schema: 1, scanner: "github-codeql", findings: [] }),
    );
    const r = runWall(root);
    assert.equal(
      r.status,
      1,
      `a legacy empty file impersonated a clean scan: ${said(r)}`,
    );
    assert.match(
      said(r),
      /analysis|candidate|complete|provenance|legacy/i,
      said(r),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("14. activation waits for current architecture and recorded proof", () => {
  const config = JSON.parse(
    readFileSync(join(ROOT, "kaal.config.json"), "utf8"),
  );
  const active = config.gates?.some((gate) => gate.name === "security");
  if (!active) return;

  const task = "an-open-finding-blocks-every-target";
  const pin = acceptanceCriteriaSha();
  const drawing = readFileSync(
    join(ROOT, "architecture", task, "drawing.md"),
    "utf8",
  );
  assert.match(
    drawing,
    new RegExp(`requirement: ${task}@${pin}`),
    "the active gate's drawing is review-needed",
  );

  const suite = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "acceptance.test.mjs"),
  );
  const suiteSha = createHash("sha256").update(suite).digest("hex");
  const recordPath = join(ROOT, "tests", "runs", `${task}.md`);
  assert.ok(existsSync(recordPath), "the active gate has no run on record");
  const record = readFileSync(recordPath, "utf8");
  assert.match(record, new RegExp(`^- Suite sha: ${suiteSha}$`, "m"));
  assert.match(record, /^- Passing: 14$/m);
  assert.match(record, /^- Failing: 0$/m);
});
