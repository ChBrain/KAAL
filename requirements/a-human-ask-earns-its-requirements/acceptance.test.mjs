// Acceptance tests for requirement a-human-ask-earns-its-requirements. One
// per criterion. The observable is repository evidence and its resolvable
// references, not a chosen intake path, format, command, or wall.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const OWN = relative(ROOT, HERE).replaceAll("\\", "/");

const load = (name) =>
  JSON.parse(readFileSync(join(HERE, "fixtures", `${name}.json`), "utf8"));

/**
 * Every readable repository document except this task's own words and test
 * stimuli. Evidence may live anywhere architecture later chooses. A binary
 * file is not inspectable evidence, so files carrying a zero byte are left
 * out without assigning a format to the files that remain.
 */
function repositoryDocuments(root = ROOT) {
  const documents = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if ([".git", "node_modules"].includes(entry.name)) continue;
      const path = join(directory, entry.name);
      const rel = relative(root, path).replaceAll("\\", "/");
      if (rel === OWN || rel.startsWith(`${OWN}/`)) continue;
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile()) {
        const bytes = readFileSync(path);
        if (!bytes.includes(0))
          documents.push({ path: rel, text: bytes.toString() });
      }
    }
  };
  walk(root);
  assert.ok(documents.length, "there are no repository documents to inspect");
  return documents;
}

const contains = (documents, words) =>
  documents.filter(({ text }) => text.includes(words));
const requirementDocuments = (documents) =>
  documents.filter(({ path }) =>
    /^requirements\/[^/]+\/requirement\.md$/.test(path),
  );
const planDocuments = (documents) =>
  documents.filter(
    ({ path }) => path === "plan/backlog.md" || /^plan\/.*\.md$/.test(path),
  );
const oneDisposition = (text) => {
  const vocabulary = [
    "discarded",
    "already satisfied",
    "duplicated",
    "awaiting a human answer",
    "accepted",
  ];
  return vocabulary.filter((word) => text.toLowerCase().includes(word));
};

function analyzed(case_, documents) {
  const records = contains(documents, case_.originalAsk);
  assert.ok(
    records.length,
    `no repository evidence preserves the human ask: ${case_.originalAsk}`,
  );
  const complete = records.filter(
    ({ text }) =>
      /(?:human|original)[ _-]*ask/i.test(text) &&
      /analys(?:is|t)|interpretation/i.test(text) &&
      text.includes(case_.interpretation) &&
      case_.authorities.every((authority) => text.includes(authority)),
  );
  assert.ok(
    complete.length,
    `the original ask, analyst interpretation, and authorities read are not distinguishable in one traceable body: ${records.map((r) => r.path).join(", ")}`,
  );
  const exact = complete.filter(({ text }) => {
    const found = oneDisposition(text);
    return found.length === 1 && found[0] === case_.disposition;
  });
  assert.ok(
    exact.length,
    `the ask does not carry exactly one ${case_.disposition} disposition`,
  );
  return exact[0];
}

function noProducedRequirement(case_, documents) {
  const produced = requirementDocuments(documents).filter(({ text }) =>
    text.includes(case_.originalAsk),
  );
  assert.deepEqual(
    produced.map(({ path }) => path),
    [],
    `a zero-requirement disposition produced ${produced.map((r) => r.path).join(", ")}`,
  );
}

function accepted(case_, documents) {
  const record = analyzed(case_, documents);
  assert.ok(
    case_.requirements.length,
    "the accepted fixture expects no requirements",
  );
  for (const result of case_.requirements) {
    assert.ok(
      record.text.includes(result.path),
      `${record.path} does not link produced requirement ${result.path}`,
    );
    const requirement = documents.find(({ path }) => path === result.path);
    assert.ok(
      requirement,
      `produced requirement does not resolve: ${result.path}`,
    );
    assert.ok(
      requirement.text.includes(record.path),
      `${result.path} does not link back to ${record.path}`,
    );
    assert.ok(
      requirement.text.includes(result.carries),
      `${result.path} does not identify the part of the ask it carries`,
    );
    const proof = result.path.replace(
      /requirement\.md$/,
      "acceptance.test.mjs",
    );
    assert.ok(
      documents.some(({ path }) => path === proof),
      `${result.path} has no independent acceptance proof`,
    );
  }
  const linked = new Set(
    requirementDocuments(documents)
      .filter(({ text }) => text.includes(record.path))
      .map(({ path }) => path),
  );
  assert.deepEqual(
    [...linked].sort(),
    case_.requirements.map(({ path }) => path).sort(),
    "the ask-to-requirement trace is incomplete in one direction",
  );
}

/** A complete in-memory answer proves each assertion can be green. */
function standIn(case_) {
  const recordPath = `evidence/${case_.disposition.replaceAll(" ", "-")}.txt`;
  const lines = [
    `Original human ask: ${case_.originalAsk}`,
    `Analyst interpretation: ${case_.interpretation}`,
    `Read: ${case_.authorities.join(", ")}`,
    `Disposition: ${case_.disposition}`,
  ];
  if (case_.reason) lines.push(`Reason: ${case_.reason}`);
  if (case_.question) lines.push(`Question: ${case_.question}`);
  for (const result of case_.requirements)
    lines.push(`Requirement: ${result.path}`);
  const documents = [{ path: recordPath, text: lines.join("\n") }];
  for (const authority of case_.authorities)
    if (!documents.some(({ path }) => path === authority))
      documents.push({ path: authority, text: "# Existing authority\n" });
  for (const result of case_.requirements) {
    documents.push({
      path: result.path,
      text:
        `# Requirement\n\nAsk: ${recordPath}\n\n` +
        `Carries: ${result.carries}\n\nNo proposed solution is architecture.\n`,
    });
    documents.push({
      path: result.path.replace(/requirement\.md$/, "acceptance.test.mjs"),
      text: "// independent proof\n",
    });
  }
  if (case_.block)
    documents.push({
      path: "requirements/backlog.md",
      text: `---\nblocks:\n  ${case_.block}: no requirement\n---\n`,
    });
  if (case_.adoption)
    documents[0].text +=
      "\nAdoption boundary: requirements/a-human-ask-earns-its-requirements/requirement.md" +
      "\nHistorical requirements remain valid before that repository boundary.";
  return documents;
}

test("1. a discarded ask remains as evidence and produces zero requirements", () => {
  const case_ = load("discarded");
  for (const documents of [standIn(case_), repositoryDocuments()]) {
    const record = analyzed(case_, documents);
    assert.ok(
      record.text.includes(case_.reason),
      "the discarded disposition has no reason",
    );
    noProducedRequirement(case_, documents);
  }
});

test("2. an already-covered ask links authority and produces no duplicate", () => {
  const case_ = load("covered");
  for (const documents of [standIn(case_), repositoryDocuments()]) {
    const record = analyzed(case_, documents);
    assert.ok(
      record.text.includes(case_.reason),
      "the covered disposition has no reason",
    );
    for (const authority of case_.authorities)
      assert.ok(
        documents.some(({ path }) => path === authority),
        `the linked existing authority does not resolve: ${authority}`,
      );
    noProducedRequirement(case_, documents);
  }
});

test("3. an accepted single need has complete two-way trace", () => {
  const case_ = load("accepted-one");
  accepted(case_, standIn(case_));
  accepted(case_, repositoryDocuments());
});

test("4. separable accepted needs have complete two-way trace", () => {
  const case_ = load("accepted-many");
  assert.ok(case_.requirements.length > 1, "the fixture is not the many case");
  assert.equal(
    new Set(case_.requirements.map(({ carries }) => carries)).size,
    case_.requirements.length,
    "two fixture requirements carry the same part of the ask",
  );
  accepted(case_, standIn(case_));
  accepted(case_, repositoryDocuments());
});

test("5. an awaiting ask exposes the question and uses a separate analyst block", () => {
  const case_ = load("awaiting");
  for (const documents of [standIn(case_), repositoryDocuments()]) {
    const record = analyzed(case_, documents);
    assert.ok(
      record.text.includes(case_.question),
      "the human question is not exposed",
    );
    noProducedRequirement(case_, documents);
    const backlogs = documents.filter(
      ({ path }) => path === "requirements/backlog.md",
    );
    assert.equal(backlogs.length, 1, "the analyst has no single backlog page");
    assert.ok(
      backlogs[0].text.includes(case_.block),
      "the analyst block does not reference the waiting ask",
    );
    assert.ok(
      !backlogs[0].text.includes(case_.originalAsk),
      "the analyst backlog became the ask record",
    );
  }
});

test("6. raw asks do not enter plans and adoption rests on repository state", () => {
  const case_ = load("bypass");
  for (const documents of [standIn(case_), repositoryDocuments()]) {
    const record = analyzed(case_, documents);
    assert.ok(
      record.text.includes(case_.reason),
      "the planning refusal has no reason",
    );
    noProducedRequirement(case_, documents);
    for (const plan of planDocuments(documents))
      assert.ok(
        !plan.text.includes(case_.originalAsk),
        `raw ask entered ${plan.path}`,
      );
    assert.match(
      record.text,
      /adoption boundary/i,
      "no adoption boundary is declared",
    );
    assert.match(
      record.text,
      /(?:requirements\/[^\s]+|[0-9a-f]{40}|commit|marker|manifest)/i,
      "the adoption boundary is not tied to repository state",
    );
    assert.match(
      record.text,
      /historical requirements remain valid/i,
      "historical requirements are made falsely invalid",
    );
  }
});
