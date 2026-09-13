// Contract tests for drawing an-open-finding-blocks-every-target. One per
// seam, numbered to match. Missing implementation is turned into an explicit
// assertion so every intended red proves a seam rather than a broken test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURES = join(
  ROOT,
  "architecture",
  "an-open-finding-blocks-every-target",
  "fixtures",
);
const fixture = (name) => join(FIXTURES, name);

const need = async (file, name) => {
  let mod;
  try {
    mod = await import(`../../bin/lib/${file}`);
  } catch (error) {
    assert.fail(`seam has no loadable ${file}: ${error.message}`);
  }
  assert.equal(
    typeof mod[name],
    "function",
    `seam has no ${name} function in ${file}`,
  );
  return mod[name];
};

test("1. absent evidence and a gathered clean snapshot stay distinct", async () => {
  const readEvidence = await need("security.mjs", "readEvidence");
  assert.deepEqual(readEvidence(fixture("absent")), {
    state: "absent",
    findings: [],
  });
  const clean = readEvidence(fixture("clean"));
  assert.equal(clean.state, "gathered", JSON.stringify(clean));
  assert.equal(clean.scanner, "fixture-scanner");
  assert.deepEqual(clean.findings, []);
});

test("2. a finding binds its identity to the complete named code", async () => {
  const readEvidence = await need("security.mjs", "readEvidence");
  const contentSha = await need("security.mjs", "contentSha");
  const codeState = await need("security.mjs", "codeState");
  const root = fixture("open");
  const evidence = readEvidence(root);
  assert.equal(evidence.state, "gathered", JSON.stringify(evidence));
  assert.equal(evidence.findings.length, 1, JSON.stringify(evidence));
  const finding = evidence.findings[0];
  assert.equal(finding.finding, "fixture-scanner/unsafe-guard");
  assert.deepEqual(finding.bindings, {
    "src/guard.mjs":
      "c6b3e0ed964e1a5590db6e19bfe7a1811e0f0a285455868c5250c49551890001",
  });
  assert.equal(
    contentSha(root, "src/guard.mjs"),
    finding.bindings["src/guard.mjs"],
  );
  assert.deepEqual(codeState(root, finding.bindings), {
    current: true,
    changed: [],
  });
});

test("3. the wall reads only evidence and remains red when risk is accepted", async () => {
  const security = await need("security.mjs", "security");
  const first = security(fixture("clean"));
  const second = security(fixture("clean"));
  assert.deepEqual(first, second);
  assert.deepEqual(first, { ok: true, findings: [] });
  for (const name of ["open", "waived"]) {
    const red = security(fixture(name));
    assert.equal(red.ok, false, `${name}: ${JSON.stringify(red)}`);
    assert.match(red.findings.join("\n"), /fixture-scanner\/unsafe-guard/);
  }
});

test("4. the security policy waives only matching current findings", async () => {
  const { runGates } = await import("../../bin/lib/gates.mjs");
  // The wall's red is fixed here so this contract isolates the gate's waiver
  // policy. Seam 3 separately holds the executable wall.
  const board = (root) => {
    const config = JSON.parse(
      readFileSync(join(root, "kaal.config.json"), "utf8"),
    );
    config.gates[0].command = 'node -e "process.exit(1)"';
    return runGates(root, config);
  };
  const waived = board(fixture("waived"));
  assert.equal(waived.ok, true, waived.lines.join("\n"));
  assert.match(waived.lines.join("\n"), /waived security/i);
  assert.doesNotMatch(waived.lines.join("\n"), /until|expired/i);
  const changed = board(fixture("changed"));
  assert.equal(changed.ok, false, changed.lines.join("\n"));
  assert.match(changed.lines.join("\n"), /changed|does not match/i);
});

test("5. a gate declaration adds release to the binding targets", async () => {
  const binding = await need("targets.mjs", "binding");
  const config = JSON.parse(
    readFileSync(join(fixture("open"), "kaal.config.json"), "utf8"),
  );
  const securityGate = config.gates.find((gate) => gate.name === "security");
  assert.equal(
    binding("main", securityGate),
    true,
    "security gate does not bind main",
  );
  assert.equal(
    binding("release", securityGate),
    true,
    "security gate declaration does not add release to its bindings",
  );
  assert.equal(
    binding("release", { name: "ordinary" }),
    false,
    "an undeclared ordinary gate changed release behavior",
  );
});
