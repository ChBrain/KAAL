// Acceptance tests for requirement a-reader-can-find-the-authority. One per
// criterion. Surface only: README.md and the local Markdown links a cold
// reader can follow from it. These cases prove navigation, not comprehension.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const TREE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ROOT = resolve(process.env.KAAL_READER_ROOT || TREE);
const ENTRY = process.env.KAAL_READER_ENTRY || "README.md";

const fold = (value) => value.replace(/\s+/g, " ").trim();
const local = (target) =>
  !/^(?:[a-z]+:|#)/i.test(target) && !target.startsWith("//");
const targetPath = (source, raw) => {
  const withoutAnchor = raw.split("#", 1)[0].split("?", 1)[0];
  return normalize(join(dirname(source), withoutAnchor));
};
const inside = (path) => {
  const fromRoot = relative(ROOT, path);
  return fromRoot !== ".." && !fromRoot.startsWith(`..${sep}`);
};

function chunks(text) {
  return text
    .split(/\n\s*\n/)
    .flatMap((paragraph) => {
      if (/^\s*\|/m.test(paragraph)) return paragraph.split("\n");
      return paragraph.split(/\n(?=\s*[-*+] )/);
    })
    .map(fold)
    .filter(Boolean);
}

function linksIn(text, source) {
  const found = [];
  for (const block of chunks(text)) {
    for (const match of block.matchAll(
      /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    )) {
      const raw = match[2];
      found.push({
        block,
        label: fold(match[1]),
        raw,
        source,
        local: local(raw),
        target: local(raw) ? targetPath(source, raw) : null,
      });
    }
  }
  return found;
}

function readRoute() {
  const entry = resolve(ROOT, ENTRY);
  assert.ok(existsSync(entry), `reader entrance does not exist: ${ENTRY}`);
  const queue = [entry];
  const seen = new Set();
  const documents = [];
  const links = [];
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    assert.ok(inside(file), `route left the repository: ${file}`);
    assert.ok(
      existsSync(file),
      `route target does not exist: ${relative(ROOT, file)}`,
    );
    if (!statSync(file).isFile() || !/\.md$/i.test(file)) continue;
    const text = readFileSync(file, "utf8");
    documents.push({ file, text });
    for (const link of linksIn(text, file)) {
      links.push(link);
      if (!link.local || !inside(link.target) || !existsSync(link.target))
        continue;
      const target = statSync(link.target).isDirectory()
        ? join(link.target, "README.md")
        : link.target;
      if (existsSync(target) && /\.md$/i.test(target)) queue.push(target);
    }
  }
  return { documents, links };
}

const route = readRoute();
const rel = (path) => relative(ROOT, path).split(sep).join("/");
const routeBlocks = route.links.map((link) => ({
  ...link,
  path: rel(link.target),
}));
const question = (pattern) =>
  routeBlocks.filter((link) => pattern.test(link.block));
const paths = (items) =>
  new Set(items.filter((x) => x.local).map((x) => x.path));
const has = (items, pattern) =>
  [...paths(items)].some((path) => pattern.test(path));

test("1. the door routes practical orientation and today's usable package", () => {
  const identity = question(/what is kaal\??|identity/i);
  const problem = question(/what problem does it solve\??|problem it solves/i);
  const audience = question(/who is it for\??|audience/i);
  const install = question(
    /what can be installed and used today\??|installable today/i,
  );
  for (const [name, items] of [
    ["what KAAL is", identity],
    ["the problem", problem],
    ["the audience", audience],
  ]) {
    assert.ok(items.length, `README's route does not name ${name}`);
    assert.ok(
      has(items, /^(?:DESIGN\.md|kaal\/league\.md)$/),
      `${name} does not route to its local authority`,
    );
  }
  assert.ok(
    install.length,
    "README's route does not name what is usable today",
  );
  assert.ok(
    has(install, /^package\.json$/),
    "installable package has no route",
  );
  assert.ok(
    has(install, /^SURFACE\.md$/),
    "usable command surface has no route",
  );
});

test("2. current, committed next, and projection have distinct routes", () => {
  const state = question(
    /current capability.*committed next.*(?:projection|longer.term)/i,
  );
  assert.ok(
    state.length,
    "the three states are not named together as distinct states",
  );
  assert.ok(
    has(state, /^SURFACE\.md$/),
    "current capability does not route to SURFACE.md",
  );
  assert.ok(
    has(state, /^plan\/[^/]+\.md$/),
    "committed next work does not route to a plan",
  );
  assert.ok(
    has(state, /^DESIGN\.md$/),
    "projection does not route to DESIGN.md",
  );
  assert.equal(
    new Set(
      [...paths(state)].filter((path) =>
        /^(?:SURFACE\.md|DESIGN\.md|plan\/)/.test(path),
      ),
    ).size,
    3,
    "two states share one authority",
  );
});

test("3. the change journey routes to its authority and artefact homes", () => {
  const journey = question(/how .*ask.*released change|ask.*release.*journey/i);
  assert.ok(
    journey.length,
    "the route does not name the ask-to-release journey",
  );
  assert.ok(
    has(journey, /^AGENTS\.md$/),
    "the journey does not route to AGENTS.md",
  );
  for (const [name, pattern] of [
    ["requirements", /^requirements(?:\/|$)/],
    ["drawings", /^architecture(?:\/|$)/],
    ["plans", /^plan(?:\/|$)/],
    ["tests", /^tests(?:\/|$)/],
    ["code", /^bin(?:\/|$)/],
    ["run evidence", /^tests\/runs(?:\/|$)/],
    ["releases", /^deploy(?:\/|$)/],
  ])
    assert.ok(has(journey, pattern), `the journey has no route to ${name}`);
});

const FAMILIES = [
  ["README.md", /README\.md/i, "governance", "explanation"],
  ["DESIGN.md", /DESIGN\.md/i, "undeclared", "explanation"],
  ["AGENTS.md", /AGENTS\.md/i, "governance", "explanation"],
  ["SURFACE.md", /SURFACE\.md/i, "developer", "decision"],
  ["package manifest", /package\.json/i, "governance", "decision"],
  ["requirements", /requirements\/<task>\/requirement\.md/i, "analyst", "want"],
  ["drawings", /architecture\/<task>\/drawing\.md/i, "architect", "decision"],
  ["plans", /plan\/<release>\.md/i, "manager", "decision"],
  ["seat backlogs", /<seat-tree>\/backlog\.md/i, "owning seat", "evidence"],
  ["test strategy", /tests\/strategy\.md/i, "tester", "explanation"],
  ["test plans", /tests\/plans\/<wall>\.md/i, "tester", "decision"],
  ["test suites", /tests\/suites\/<suite>\.md/i, "tester", "decision"],
  ["run records", /tests\/runs\/<task>\.md/i, "tester", "evidence"],
  ["bugs", /tests\/bugs\/<bug>\.md/i, "tester", "evidence"],
  [
    "release records",
    /deploy\/releases\/<version>\.md/i,
    "operator",
    "evidence",
  ],
  ["waivers", /waivers\/<wall>\.md/i, "governance", "decision"],
  ["retros", /retros\/<use>\.md/i, "shared", "evidence"],
  ["engine config", /kaal\.config\.json/i, "governance", "decision"],
  [
    "derived reports",
    /kaal backlog|derived reports?/i,
    "developer",
    "derived view",
  ],
];

const OWNER =
  /\b(?:governance|undeclared|developer|analyst|architect|manager|owning seat|tester|operator|shared)\b/i;
const KIND = /\b(?:want|decision|evidence|derived view|explanation)s?\b/i;
const register = () =>
  routeBlocks.filter(
    (link) =>
      /authorit/i.test(link.block) &&
      OWNER.test(link.block) &&
      KIND.test(link.block),
  );

test("4. the authority register names home, owner, and information kind", () => {
  const authority = register();
  assert.ok(authority.length, "no reader-reachable authority register");
  for (const [name, subject, owner, kind] of FAMILIES) {
    const entries = authority.filter((link) => subject.test(link.block));
    assert.ok(entries.length, `authority register has no ${name} entry`);
    assert.ok(
      entries.some((entry) =>
        new RegExp(`\\b${owner.replace(" ", "\\s+")}\\b`, "i").test(
          entry.block,
        ),
      ),
      `${name} does not name owner ${owner}`,
    );
    assert.ok(
      entries.some((entry) =>
        new RegExp(`\\b${kind.replace(" ", "\\s+")}s?\\b`, "i").test(
          entry.block,
        ),
      ),
      `${name} is not classified as ${kind}`,
    );
  }
  const backlog = authority.filter((link) =>
    /<seat-tree>\/backlog\.md/i.test(link.block),
  );
  const report = authority.filter((link) => /kaal backlog/i.test(link.block));
  assert.ok(
    backlog.some((x) => /record/i.test(x.block)),
    "seat backlogs are not called records",
  );
  assert.ok(
    report.some((x) => /derived view/i.test(x.block)),
    "kaal backlog is not called a derived view",
  );
  assert.ok(
    report.some((x) => /does not generate|never generates/i.test(x.block)),
    "kaal backlog is not explicitly distinguished from a generator",
  );
});

test("5. authority routes are local, resolve, and name one home per subject", () => {
  const authority = register();
  assert.ok(
    authority.length >= FAMILIES.length,
    `only ${authority.length} authority links are reachable`,
  );
  for (const link of authority) {
    assert.ok(link.local, `authority is external: ${link.raw}`);
    assert.ok(
      inside(link.target),
      `authority leaves the repository: ${link.raw}`,
    );
    assert.ok(
      existsSync(link.target),
      `authority does not resolve: ${link.raw}`,
    );
    assert.ok(
      !/commit history|git log/i.test(link.block),
      `authority depends on history: ${link.block}`,
    );
  }
  for (const [name, subject] of FAMILIES) {
    const family = FAMILIES.find((entry) => entry[0] === name);
    const owner = new RegExp(`\\b${family[2].replace(" ", "\\s+")}\\b`, "i");
    const kind = new RegExp(`\\b${family[3].replace(" ", "\\s+")}s?\\b`, "i");
    const homes = new Set(
      authority
        .filter(
          (link) =>
            subject.test(link.block) &&
            owner.test(link.block) &&
            kind.test(link.block),
        )
        .map((link) => link.path),
    );
    assert.equal(
      homes.size,
      1,
      `${name} names ${homes.size} authoritative homes: ${[...homes].join(", ")}`,
    );
  }
});
