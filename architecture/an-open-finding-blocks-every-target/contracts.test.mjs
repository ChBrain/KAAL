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
const EVIDENCE = ["kaal", "security", "findings.json"];
const TRUST = ["kaal", "security", "trust.json"];
const evidenceOf = (root) => JSON.parse(readFileSync(join(root, ...EVIDENCE)));
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
const rewrite = (root, edit) => {
  const document = evidenceOf(root);
  writeFileSync(
    join(root, ...EVIDENCE),
    JSON.stringify(edit(document) ?? document, null, 2) + "\n",
  );
};

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
  assert.equal(gathered.repository, declared.repository);
  assert.equal(gathered.workflow, declared.workflow);
  assert.deepEqual(gathered.retrieval, declared.retrieval);
  assert.deepEqual(gathered.analysis, declared.analysis);
  assert.deepEqual(gathered.collection, declared.collection);
  assert.deepEqual(gathered.candidate, declared.candidate);
  assert.deepEqual(gathered.attestation, declared.attestation);
  assert.deepEqual(gathered.findings, []);
  // The document as written, carried through unreshaped, because seam 7
  // authenticates what the producer signed and not this reader's view of it.
  assert.deepEqual(gathered.document, declared);

  // The shape shipped before this amendment cannot carry provenance at all,
  // so it is refused by its own schema number and never read as clean.
  const legacy = scratch(current("current-clean"), (root) => {
    mkdirSync(join(root, "kaal", "security"), { recursive: true });
    writeFileSync(
      join(root, ...EVIDENCE),
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
    writeFileSync(join(root, ...EVIDENCE), "{"),
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
  // The root of trust is candidate content, so rotating it makes every
  // attestation gathered under the old one stale rather than silently kept.
  assert.equal(
    manifest.files["kaal/security/trust.json"],
    sha(readFileSync(join(root, ...TRUST))),
    "the trust anchor is outside the candidate it roots",
  );
  // The two the manifest never carries. Evidence about a candidate and an
  // acceptance of a finding in it are not the candidate, or writing either
  // would make the other stale and nothing could ever be current.
  for (const skipped of Object.keys(manifest.files))
    assert.doesNotMatch(
      skipped,
      /^(\.git\/|waivers\/|kaal\/security\/findings\.json$)/,
      skipped,
    );
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
  // carries. It is a consistency check and never an authenticity one: seam 7
  // is what stops the declaring party from choosing both numbers.
  const truncated = evidenceOf(current("incomplete-collection"));
  assert.notEqual(truncated.collection.expected, truncated.findings.length);
});

test("6. the repository pins the keys it will believe, and nothing else", async () => {
  const readTrust = await need("security.mjs", "readTrust");
  const pinned = readTrust(current("current-clean"));
  assert.equal(pinned.state, "pinned", JSON.stringify(pinned));
  const anchor = JSON.parse(
    readFileSync(join(current("current-clean"), ...TRUST)),
  );
  assert.deepEqual(pinned.keys, anchor.keys);
  for (const key of pinned.keys)
    for (const field of [
      "keyId",
      "alg",
      "publicKey",
      "subject",
      "workflow",
      "scanner",
    ])
      assert.match(String(key[field]), /\S/, `a pinned key has no ${field}`);

  // A tree that pins nothing can authenticate nothing, and says so in its own
  // word rather than by any answer about the evidence.
  assert.equal(readTrust(current("no-trust-anchor")).state, "absent");

  const broken = scratch(current("current-clean"), (root) =>
    writeFileSync(
      join(root, ...TRUST),
      JSON.stringify({ schema: 1, keys: [] }),
    ),
  );
  try {
    const read = readTrust(broken);
    assert.equal(read.state, "invalid", JSON.stringify(read));
    assert.match(read.problems.join("\n"), /\S/);
  } finally {
    discard(broken);
  }
});

test("7. only a pinned key's signature makes evidence more than its writer's claim", async () => {
  const readEvidence = await need("security.mjs", "readEvidence");
  const attestationState = await need("security.mjs", "attestationState");
  const at = (root) => attestationState(root, readEvidence(root));

  assert.deepEqual(at(current("current-clean")), {
    state: "attested",
    why: null,
  });

  // The four the supervisor's review asked this seam to refuse. Not one of
  // them is malformed, inconsistent, stale or about another candidate: each
  // is exactly what a person can write with no private key.
  const refused = {
    "authored-clean": "unattested",
    "forged-attestation": "untrusted-attestor",
    "tampered-after-attestation": "broken-attestation",
    "truncated-after-attestation": "broken-attestation",
    "wrong-attestor": "wrong-attestor",
    "no-trust-anchor": "no-trust-anchor",
  };
  const said = new Set();
  for (const [name, state] of Object.entries(refused)) {
    const answer = at(current(name));
    assert.equal(answer.state, state, `${name}: ${JSON.stringify(answer)}`);
    assert.match(answer.why ?? "", /\S/, `${name} gave no reason`);
    said.add(answer.why);
  }
  // One reason per state and never one per tree. The two edited documents
  // answer alike on purpose: the seal says this is not what was signed, and
  // which field somebody moved afterwards is not a thing a signature knows.
  assert.equal(
    said.size,
    new Set(Object.values(refused)).size,
    [...said].join(" | "),
  );

  // The two edited trees are internally consistent, which is the whole point:
  // every declared fact still agrees with every other, and only the signature
  // knows the document changed.
  const tampered = evidenceOf(current("tampered-after-attestation"));
  assert.equal(tampered.collection.expected, tampered.findings.length);
  const cut = evidenceOf(current("truncated-after-attestation"));
  assert.equal(cut.collection.expected, cut.findings.length);
  assert.equal(cut.collection.locations, "all");
  assert.equal(cut.collection.state, "complete");

  // The signature covers a canonical reading of the document and never its
  // bytes, so a formatter may rewrite the file and the attestation survives.
  const reformatted = scratch(current("current-clean"), (root) =>
    rewrite(root, (document) => document),
  );
  const reordered = scratch(current("current-clean"), (root) =>
    rewrite(root, (document) =>
      Object.fromEntries(Object.entries(document).reverse()),
    ),
  );
  const edited = scratch(current("current-clean"), (root) =>
    rewrite(root, (document) => ({ ...document, scanner: "another-scanner" })),
  );
  try {
    assert.equal(at(reformatted).state, "attested", "whitespace broke a seal");
    assert.equal(at(reordered).state, "attested", "key order broke a seal");
    assert.notEqual(at(edited).state, "attested", "an edit kept its seal");
  } finally {
    for (const root of [reformatted, reordered, edited]) discard(root);
  }
});

test("8. the wall composes one red word per state and repeats itself exactly", async () => {
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
    "authored-clean",
    "forged-attestation",
    "tampered-after-attestation",
    "wrong-attestor",
    "no-trust-anchor",
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

  // Authenticity is answered before anything the evidence declares about
  // itself. An unattested document's provenance is not a weaker fact, it is
  // not a fact, so the wall must not report it as one.
  const unattested = security(current("authored-clean")).findings.join("\n");
  assert.doesNotMatch(unattested, /analysis|collection|candidate/i, unattested);

  // A complete result names every finding it carries, and the count it names
  // is the count the evidence holds rather than one written here.
  const multiple = evidenceOf(current("complete-multiple-open"));
  const said = security(current("complete-multiple-open")).findings.join("\n");
  for (const finding of multiple.findings)
    assert.match(said, new RegExp(finding.id), said);
});

test("9. the security policy waives only matching current findings", async () => {
  const { runGates } = await import("../../bin/lib/gates.mjs");
  // The wall's red is fixed here so this contract isolates the gate's waiver
  // policy. Seam 8 separately holds the executable wall.
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
  // There is no finding to accept while nobody can say what was analysed, so
  // an acceptance is never read over evidence that is not authentic.
  for (const name of ["gathering-in-progress", "authored-clean"]) {
    const ungathered = board(current(name));
    assert.equal(ungathered.ok, false, ungathered.lines.join("\n"));
  }
});

test("10. a gate declaration adds release to the binding targets", async () => {
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
