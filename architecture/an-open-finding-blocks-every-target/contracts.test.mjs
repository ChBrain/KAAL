// Contract tests for drawing an-open-finding-blocks-every-target. One per
// seam, numbered to match. Missing implementation is turned into an explicit
// assertion so every intended red proves a seam rather than a broken test.
// Every hash and every count here is computed from the same tree it asserts
// about: a number written in would be true today and a lie the first time a
// fixture moved a byte.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
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
const current = (name) => join(FIXTURES, "current-evidence", name);
const evidenceOf = (root) =>
  JSON.parse(readFileSync(join(root, "kaal", "security", "findings.json")));
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");

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

/** A scratch copy of a fixture, at the depth its own gate command expects. */
const scratch = (from, edit) => {
  const root = mkdtempSync(join(FIXTURES, ".contract-"));
  cpSync(from, root, { recursive: true });
  edit?.(root);
  return root;
};
const discard = (root) => rmSync(root, { recursive: true, force: true });

test("1. evidence reads as absent, legacy, invalid or gathered with its provenance", async () => {
  const readEvidence = await need("security.mjs", "readEvidence");
  assert.deepEqual(readEvidence(fixture("absent")), {
    state: "absent",
    findings: [],
  });

  const gathered = readEvidence(current("current-clean"));
  const declared = evidenceOf(current("current-clean"));
  assert.equal(gathered.state, "gathered", JSON.stringify(gathered));
  assert.equal(gathered.scanner, declared.scanner);
  assert.deepEqual(gathered.retrieval, declared.retrieval);
  assert.deepEqual(gathered.analysis, declared.analysis);
  assert.deepEqual(gathered.collection, declared.collection);
  assert.deepEqual(gathered.candidate, declared.candidate);
  assert.deepEqual(gathered.findings, []);

  // The shape shipped before this amendment cannot carry provenance at all,
  // so it is refused by its own schema number and never read as clean.
  const legacy = scratch(current("current-clean"), (root) => {
    mkdirSync(join(root, "kaal", "security"), { recursive: true });
    writeFileSync(
      join(root, "kaal", "security", "findings.json"),
      JSON.stringify({ schema: 1, scanner: "fixture-scanner", findings: [] }),
    );
  });
  try {
    const read = readEvidence(legacy);
    assert.equal(read.state, "legacy", JSON.stringify(read));
    assert.match(read.problems.join("\n"), /legacy|schema/i);
  } finally {
    discard(legacy);
  }

  const invalid = scratch(current("current-clean"), (root) =>
    writeFileSync(join(root, "kaal", "security", "findings.json"), "{"),
  );
  try {
    assert.equal(readEvidence(invalid).state, "invalid");
  } finally {
    discard(invalid);
  }
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
  assert.deepEqual(Object.keys(finding.bindings), ["src/guard.mjs"]);
  assert.equal(
    contentSha(root, "src/guard.mjs"),
    sha(readFileSync(join(root, "src", "guard.mjs"))),
  );
  assert.deepEqual(codeState(root, finding.bindings), {
    current: true,
    changed: [],
  });
  const moved = { ...finding.bindings, "src/guard.mjs": sha("something else") };
  assert.deepEqual(codeState(root, moved), {
    current: false,
    changed: ["src/guard.mjs"],
  });
});

test("3. the candidate manifest is every file the analysis could have seen", async () => {
  const candidateManifest = await need("security.mjs", "candidateManifest");
  const root = current("current-clean");
  const manifest = candidateManifest(root);
  const text = Object.keys(manifest.files)
    .sort()
    .map((path) => `${path} ${manifest.files[path]}\n`)
    .join("");
  assert.equal(manifest.digest, sha(text), "the digest is not the manifest's");
  assert.equal(
    manifest.files["src/guard.mjs"],
    sha(readFileSync(join(root, "src", "guard.mjs"))),
  );
  assert.ok(
    Object.hasOwn(manifest.files, "kaal.config.json"),
    `the declaration is candidate content: ${Object.keys(manifest.files)}`,
  );
  // The three the manifest never carries. Evidence about a candidate and an
  // acceptance of a finding in it are not the candidate, or writing either
  // would make the other stale and nothing could ever be current.
  for (const skipped of Object.keys(manifest.files))
    assert.doesNotMatch(skipped, /^(\.git|kaal\/security|waivers)\//, skipped);
  assert.ok(
    Object.keys(candidateManifest(fixture("waived")).files).every(
      (path) => !path.startsWith("waivers/"),
    ),
    "an accepted risk was counted as candidate content",
  );
});

test("4. a declared candidate is current, stale or another candidate entirely", async () => {
  const readEvidence = await need("security.mjs", "readEvidence");
  const candidateState = await need("security.mjs", "candidateState");
  const at = (root) => candidateState(root, readEvidence(root));

  assert.deepEqual(
    { ...at(current("current-clean")), judged: null, declared: null },
    {
      state: "current",
      judged: null,
      declared: null,
      added: [],
      changed: [],
      missing: [],
    },
  );

  const modified = scratch(current("current-clean"), (root) =>
    writeFileSync(
      join(root, "src", "guard.mjs"),
      "export const guarded = 0;\n",
    ),
  );
  const added = scratch(current("current-clean"), (root) =>
    writeFileSync(
      join(root, "src", "unseen.mjs"),
      "export const unseen = 1;\n",
    ),
  );
  const removed = scratch(current("current-clean"), (root) =>
    rmSync(join(root, "src", "guard.mjs")),
  );
  try {
    assert.deepEqual(
      [at(modified).state, at(modified).changed],
      ["stale", ["src/guard.mjs"]],
    );
    assert.deepEqual(
      [at(added).state, at(added).added],
      ["stale", ["src/unseen.mjs"]],
    );
    assert.deepEqual(
      [at(removed).state, at(removed).missing],
      ["stale", ["src/guard.mjs"]],
    );
  } finally {
    for (const root of [modified, added, removed]) discard(root);
  }

  // The same digest disagreement, and a different answer: evidence that says
  // which candidate it analysed is wrong about the candidate rather than late.
  for (const name of [
    "wrong-candidate",
    "head-evidence-merge-candidate",
    "merge-evidence-head-candidate",
    "premerge-evidence-postmerge-candidate",
  ]) {
    const state = at(current(name));
    assert.equal(state.state, "wrong-candidate", `${name}: ${state.state}`);
    assert.equal(state.declared, evidenceOf(current(name)).candidate.digest);
    assert.notEqual(state.judged, state.declared, name);
  }
  assert.equal(at(current("stale")).state, "stale", "a checkout kind is late");
});

test("5. retrieval, analysis and collection each answer in their own word", async () => {
  const readEvidence = await need("security.mjs", "readEvidence");
  const provenanceState = await need("security.mjs", "provenanceState");
  const at = (name) => provenanceState(readEvidence(current(name)));
  const expected = {
    "current-clean": "complete",
    "no-analysis": "no-analysis",
    "incomplete-analysis": "incomplete-analysis",
    "errored-analysis": "errored-analysis",
    "retrieval-unavailable": "retrieval-unavailable",
    "retrieval-unauthorized": "retrieval-unauthorized",
    "gathering-in-progress": "gathering",
    "incomplete-collection": "incomplete-collection",
    "primary-location-only": "incomplete-collection",
  };
  for (const [name, state] of Object.entries(expected))
    assert.equal(at(name).state, state, `${name}: ${JSON.stringify(at(name))}`);
  for (const name of Object.keys(expected))
    if (expected[name] !== "complete")
      assert.match(at(name).why ?? "", /\S/, `${name} gave no reason`);
  // Completeness is a count the evidence declares against the findings it
  // carries, so a truncated page cannot pass by carrying fewer.
  const truncated = evidenceOf(current("incomplete-collection"));
  assert.notEqual(truncated.collection.expected, truncated.findings.length);
});

test("6. the wall composes one red word per state and repeats itself exactly", async () => {
  const security = await need("security.mjs", "security");
  assert.deepEqual(security(fixture("clean")), { ok: true, findings: [] });
  assert.deepEqual(
    security(current("current-clean")),
    security(current("current-clean")),
  );
  assert.deepEqual(security(current("current-clean")), {
    ok: true,
    findings: [],
  });

  const answers = new Map();
  for (const name of [
    "no-analysis",
    "wrong-candidate",
    "incomplete-analysis",
    "errored-analysis",
    "retrieval-unavailable",
    "retrieval-unauthorized",
    "incomplete-collection",
    "stale",
    "open",
  ]) {
    const red = security(current(name));
    assert.equal(red.ok, false, `${name}: ${JSON.stringify(red)}`);
    assert.match(red.findings.join("\n"), /\S/, `${name} said nothing`);
    answers.set(name, red.findings.join("\n"));
  }
  assert.equal(
    new Set(answers.values()).size,
    answers.size,
    `two states share an answer: ${[...answers.values()].join(" | ")}`,
  );
  assert.equal(security(fixture("absent")).ok, false);

  // A complete result names every finding it carries, and the count it names
  // is the count the evidence holds rather than one written here.
  const multiple = evidenceOf(current("complete-multiple-open"));
  const said = security(current("complete-multiple-open")).findings.join("\n");
  for (const finding of multiple.findings)
    assert.match(said, new RegExp(finding.id), said);
});

test("7. the security policy waives only matching current findings", async () => {
  const { runGates } = await import("../../bin/lib/gates.mjs");
  // The wall's red is fixed here so this contract isolates the gate's waiver
  // policy. Seam 6 separately holds the executable wall.
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
  // The acceptance still repeats the bytes it excused; this candidate carries
  // other bytes, and the finding the scanner reported here is bound to those.
  const changed = board(fixture("changed"));
  assert.equal(changed.ok, false, changed.lines.join("\n"));
  // The board names the acceptance that did not apply, so a reader is not
  // left with a red wall and no idea which human act failed to cover it.
  assert.match(changed.lines.join("\n"), /waiver/i, changed.lines.join("\n"));
  // Evidence that is not a completed, complete, current analysis is not a
  // red a person may accept: there is no finding to name yet.
  const ungathered = board(current("gathering-in-progress"));
  assert.equal(ungathered.ok, false, ungathered.lines.join("\n"));
});

test("8. a gate declaration adds release to the binding targets", async () => {
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
