// Acceptance tests for requirement a-block-follows-a-declared-edge. One per
// criterion. Surface only: `kaal backlog <root>`, which already reads the
// declaration and all six pages, and the two declarations a reader of this
// league meets, `kaal.config.json` and `AGENTS.md`.
//
// Criteria 2 to 6 build their own trees, because they are about what the
// command says when a declaration or a page is wrong and this league's must
// not be. Criteria 1, 7 and 8 read this league's own files: the eight edges
// are the ask itself, so the declaration is the one place the league's own
// tree is fixed ground, and it is where `a-diff-carries-one-seat` reads its
// own page too.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  writeFileSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kaal = (...args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "kaal.mjs"), ...args], {
    encoding: "utf8",
  });
const said = (r) =>
  `${r.error ? `${r.error.message}: ` : ""}${r.stdout ?? ""}${r.stderr ?? ""}`;

const config = () =>
  JSON.parse(readFileSync(join(ROOT, "kaal.config.json"), "utf8"));
const agents = () => readFileSync(join(ROOT, "AGENTS.md"), "utf8");

/** The eight edges the ask names, keyed by the seat that may be blocked. */
const ASKED = {
  manager: [],
  analyst: [],
  architect: ["analyst"],
  tester: ["analyst", "architect", "developer", "operator"],
  developer: ["tester"],
  operator: ["tester", "developer"],
};
const EDGES = 8;
/** The trees the seats own, so a fixture's pages land where `pages()` looks. */
const OWNS = {
  manager: "plan/**",
  analyst: "requirements/**",
  architect: "architecture/**",
  tester: "tests/**",
  developer: "bin/**",
  operator: "deploy/**",
};
/**
 * The kinds a fixture declares are this tree's own, read rather than listed.
 * A fixture obeys the rules it is not testing, and criterion 9 is one of
 * them: a fixture that declared a vocabulary too small for the eight edges
 * would be refused for criterion 9's reason while testing something else.
 * Reading them here also keeps this file from naming a kind, which is the
 * builder's choice and not this task's.
 */
const KINDS = () => config().blocks ?? [];
const entry = (seat, blockedBy = []) => ({ seat, blockedBy });
const WHOLE = Object.entries(ASKED).map(([s, b]) => entry(s, b));
const SEATS = Object.keys(ASKED);
/** Every declared edge as `[source, target]`: eight of them. */
const DECLARED = Object.entries(ASKED).flatMap(([to, from]) =>
  from.map((f) => [f, to]),
);
/**
 * Every ordered pair the flow does not declare, self pairs included. Six
 * seats make thirty six pairs and eight are declared, so this is twenty
 * eight: the wrong way round, the unrelated, and the six self edges. A wall
 * that hard coded one sampled rejection fails here rather than passing.
 */
const UNDECLARED = SEATS.flatMap((a) =>
  SEATS.filter((b) => !(ASKED[b] ?? []).includes(a)).map((b) => [a, b]),
);
const pageOf = (seat) => `${OWNS[seat].split("/")[0]}/backlog.md`;

/**
 * A table in the shape criterion 7 asks of `AGENTS.md`, generated from the
 * same flow the config gets, so a fixture obeys the criterion it is not
 * testing and the only finding is the one under test.
 */
const table = (flow) =>
  [
    "## What a seat needs from a seat",
    "",
    "The declared edges may feed back; the blocks standing at one moment may",
    "not.",
    "",
    "| seat | work exists when | blocked when | blocked by |",
    "| ---- | ---------------- | ------------ | ---------- |",
    ...flow.map(
      (e) =>
        `| ${e.seat} | something | something | ${(e.blockedBy ?? []).length ? (e.blockedBy ?? []).join(", ") : "nothing"} |`,
    ),
    "",
  ].join("\n");

const PAGE = (seat, blocks) =>
  [
    "---",
    "blocks:",
    ...Object.entries(blocks).map(([k, v]) => `  ${k}: ${v}`),
    "---",
    "",
    `# Backlog: ${seat}`,
    "",
    "What this seat cannot do, and who owes what it is waiting on.",
    "",
  ].join("\n");

const trees = [];
/**
 * A scratch tree: a declaration, a page per seat, and a doctrine table that
 * agrees with the flow.
 */
const tree = ({
  seats = Object.keys(ASKED),
  flow = WHOLE,
  blocks = {},
  withFlow = true,
  kinds = KINDS(),
  board = false,
} = {}) => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-edge-"));
  trees.push(dir);
  const cfg = {
    seats: seats.map((name) => ({ name, owns: [OWNS[name]] })),
    lanes: [],
    shared: [],
    // The board's own wall, pointed at this engine by absolute path, because
    // a scratch tree has no `bin/` of its own. `runGates` runs it with the
    // tree as its working directory, so the wall reads this tree.
    gates: board
      ? [
          {
            name: "backlog",
            command: `"${process.execPath}" "${join(ROOT, "bin", "kaal.mjs")}" backlog`,
            fix: "drop the block or correct the declaration; never add an edge to let a block through",
          },
        ]
      : [],
    blocks: kinds,
  };
  if (withFlow) cfg.flow = flow;
  const put = (rel, text) => {
    const p = join(dir, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  };
  put("kaal.config.json", JSON.stringify(cfg, null, 2));
  put("AGENTS.md", `# AGENTS.md\n\n${table(flow)}`);
  for (const name of seats)
    put(
      `${OWNS[name].split("/")[0]}/backlog.md`,
      PAGE(name, blocks[name] ?? {}),
    );
  return dir;
};

process.on("exit", () => {
  for (const d of trees) rmSync(d, { recursive: true, force: true });
});

test("1. kaal.config.json declares flow, keyed by the blocked seat, with the eight edges the ask names", () => {
  const flow = config().flow;
  assert.ok(
    Array.isArray(flow) && flow.length,
    "kaal.config.json declares no flow",
  );
  const seen = {};
  for (const e of flow) {
    assert.equal(
      typeof e.seat,
      "string",
      `a flow entry carries no seat: ${JSON.stringify(e)}`,
    );
    assert.ok(
      Array.isArray(e.blockedBy),
      `${e.seat}: blockedBy is not a list, so an empty answer cannot be told from a missing one`,
    );
    assert.equal(seen[e.seat], undefined, `${e.seat}: two flow entries`);
    seen[e.seat] = [...e.blockedBy].sort();
  }
  assert.deepEqual(
    seen,
    Object.fromEntries(
      Object.entries(ASKED).map(([s, b]) => [s, [...b].sort()]),
    ),
    "flow is not the eight edges the ask names",
  );
  assert.equal(
    flow.reduce((n, e) => n + e.blockedBy.length, 0),
    EDGES,
    "flow does not carry exactly eight edges",
  );
});

test("2. a declaration that does not answer for every seat, or answers for a name that is no seat, is a finding", () => {
  const missing = kaal(
    "backlog",
    tree({ flow: WHOLE.filter((e) => e.seat !== "operator") }),
  );
  assert.equal(missing.status, 1, said(missing));
  assert.match(
    missing.stderr,
    /^operator: no flow entry; a seat blocked by nothing carries an empty blockedBy$/m,
    said(missing),
  );

  // Deny by default: no flow at all is six seats with no answer, never a
  // check that quietly stands down. A stand-in written with `if (flow)`
  // around the whole thing passes every other case here and fails this one.
  const none = kaal("backlog", tree({ withFlow: false }));
  assert.equal(none.status, 1, said(none));
  for (const seat of Object.keys(ASKED))
    assert.match(
      none.stderr,
      new RegExp(
        `^${seat}: no flow entry; a seat blocked by nothing carries an empty blockedBy$`,
        "m",
      ),
      said(none),
    );

  const twice = kaal(
    "backlog",
    tree({ flow: [...WHOLE, entry("tester", [])] }),
  );
  assert.equal(twice.status, 1, said(twice));
  assert.match(
    twice.stderr,
    /^tester: two flow entries; a seat answers once$/m,
    said(twice),
  );

  const stranger = kaal(
    "backlog",
    tree({
      flow: WHOLE.map((e) =>
        e.seat === "tester" ? entry("tester", [...e.blockedBy, "coder"]) : e,
      ),
    }),
  );
  assert.equal(stranger.status, 1, said(stranger));
  assert.match(stranger.stderr, /^coder: no such seat$/m, said(stranger));
});

test("3. every undeclared pair is a finding, direction and self edge included", () => {
  assert.equal(
    UNDECLARED.length,
    28,
    "six seats make thirty six ordered pairs and eight are declared",
  );
  assert.equal(
    UNDECLARED.filter(([a, b]) => a === b).length,
    6,
    "a seat naming itself is an undeclared pair too",
  );
  for (const [from, to] of UNDECLARED) {
    const r = kaal(
      "backlog",
      tree({ blocks: { [to]: { [`${from}/some-task`]: "no drawing" } } }),
    );
    assert.equal(r.status, 1, `${from} to ${to} was not refused: ${said(r)}`);
    assert.match(
      r.stderr,
      new RegExp(
        `^${pageOf(to).replace("/", "\\/")}: ${from}\\/some-task: the ${to} is not blocked by the ${from}; no such edge is declared$`,
        "m",
      ),
      `${from} to ${to}: ${said(r)}`,
    );
  }
});

test("4. every one of the eight declared edges stands, and one run tells the two apart", () => {
  assert.equal(DECLARED.length, EDGES, "the ask names eight edges");
  for (const [from, to] of DECLARED) {
    const r = kaal(
      "backlog",
      tree({ blocks: { [to]: { [`${from}/drawn-task`]: "no drawing" } } }),
    );
    assert.equal(r.status, 0, `${from} to ${to} was refused: ${said(r)}`);
    assert.match(
      r.stdout,
      new RegExp(`^blocked on the ${from}:$`, "m"),
      `${from} to ${to}: ${said(r)}`,
    );
    assert.match(
      r.stdout,
      new RegExp(
        `^ {2}drawn-task: no drawing, from ${pageOf(to).replace("/", "\\/")}$`,
        "m",
      ),
      `${from} to ${to}: ${said(r)}`,
    );
    assert.doesNotMatch(r.stderr, /drawn-task/, `${from} to ${to}: ${said(r)}`);
  }

  // Both in one run. The witness: the undeclared one is refused, so the flow
  // was read on this very tree, and the declared one going unremarked is the
  // command's answer rather than its silence.
  const both = kaal(
    "backlog",
    tree({
      blocks: {
        tester: { "architect/drawn-task": "no drawing" },
        analyst: { "architect/other-task": "no drawing" },
      },
    }),
  );
  assert.equal(both.status, 1, said(both));
  assert.match(
    both.stderr,
    /^requirements\/backlog\.md: architect\/other-task: the analyst is not blocked by the architect; no such edge is declared$/m,
    said(both),
  );
  assert.match(both.stdout, /^blocked on the architect:$/m, said(both));
  assert.doesNotMatch(both.stderr, /drawn-task/, said(both));
});

test("5. a cycle among the declared edges is not a finding", () => {
  // tester and developer block each other, which two of the ask's own eight
  // edges already do, plus one block on an edge nobody declared.
  const root = tree({
    seats: ["tester", "developer", "analyst", "operator"],
    flow: [
      entry("tester", ["developer"]),
      entry("developer", ["tester"]),
      entry("analyst", []),
      entry("operator", []),
    ],
    blocks: { analyst: { "operator/other-task": "no record" } },
  });
  const r = kaal("backlog", root);
  // The witness again: the one finding proves the declaration was read, so
  // the cycle inside it was seen and not objected to.
  assert.match(
    r.stderr,
    /^requirements\/backlog\.md: operator\/other-task: the analyst is not blocked by the operator; no such edge is declared$/m,
    said(r),
  );
  assert.equal(r.status, 1, said(r));
  assert.doesNotMatch(said(r), /cycle/i, said(r));
});

test("6. a flow entry carrying any key beyond seat and blockedBy is a finding", () => {
  const r = kaal(
    "backlog",
    tree({
      flow: WHOLE.map((e) =>
        e.seat === "architect" ? { ...e, orders: ["developer"] } : e,
      ),
    }),
  );
  assert.equal(r.status, 1, said(r));
  assert.match(
    r.stderr,
    /^architect: flow entry carries orders; an edge carries dependency and never an instruction$/m,
    said(r),
  );
});

test("7. AGENTS.md carries a blocked by column saying the same as the config", () => {
  const flow = config().flow;
  assert.ok(
    Array.isArray(flow) && flow.length,
    "kaal.config.json declares no flow to compare the page against",
  );
  const rows = [];
  for (const line of agents().split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) continue;
    rows.push(
      trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim()),
    );
  }
  assert.ok(rows.length, "AGENTS.md carries no table at all");
  const header = rows.find((r) => r.some((c) => /^blocked by$/i.test(c)));
  assert.ok(header, "no table in AGENTS.md carries a `blocked by` column");
  const at = header.findIndex((c) => /^blocked by$/i.test(c));
  const said = new Map(
    rows
      .filter((r) => r.length === header.length && r[at] && !/^-+$/.test(r[0]))
      .map((r) => [r[0], r[at]]),
  );
  for (const e of flow) {
    const page = said.get(e.seat);
    assert.ok(page !== undefined, `${e.seat}: no row in AGENTS.md`);
    assert.equal(
      page,
      e.blockedBy.length ? e.blockedBy.join(", ") : "nothing",
      `${e.seat}: AGENTS.md says blocked by ${page}; kaal.config.json says ${e.blockedBy.join(", ") || "nothing"}`,
    );
  }
  assert.match(
    agents().replace(/\s+/g, " "),
    /feed back/i,
    "AGENTS.md does not say the declared edges may feed back while the standing blocks may not",
  );
});

test("8. the board itself answers both ways, and the fix line offers no wider declaration", () => {
  const gates = config().gates;
  assert.ok(
    Array.isArray(gates) && gates.length,
    "the config declares no gates",
  );
  const gate = gates.find((g) => g.name === "backlog");
  assert.ok(gate, "no gate named backlog on the board");
  assert.equal(gate.command, "node bin/kaal.mjs backlog");
  assert.match(gate.fix ?? "", /declaration/i, gate.fix);
  assert.match(gate.fix ?? "", /block/i, gate.fix);
  assert.match(gate.fix ?? "", /never/i, gate.fix);
  assert.match(gate.fix ?? "", /edge/i, gate.fix);

  // And the board is run, because a gate named in a config is a declaration
  // and not enforcement. A legal live block keeps the wall green; an edge
  // nobody declared turns it red and stops the run.
  const legal = kaal(
    "gates",
    tree({
      board: true,
      blocks: { tester: { "architect/drawn-task": "no drawing" } },
    }),
  );
  assert.match(legal.stdout, /^ok {3}backlog$/m, said(legal));
  assert.equal(legal.status, 0, said(legal));

  const illegal = kaal(
    "gates",
    tree({
      board: true,
      blocks: { analyst: { "architect/other-task": "no drawing" } },
    }),
  );
  assert.match(illegal.stdout, /^FAIL backlog {2}fix: /m, said(illegal));
  assert.equal(illegal.status, 1, said(illegal));
});

test("9. an edge no kind can be owed for is a finding, and this tree has none", () => {
  // The mapping the criterion asks the command to print, so a reader and a
  // test can both see which seat owes which kind without either of them
  // naming a kind this task has no business choosing.
  const whole = kaal("backlog", tree());
  const owed = new Map();
  for (const line of whole.stdout.split("\n")) {
    const m = line.match(/^kind (.+): owed by the (\S+)$/);
    if (m) owed.set(m[1], m[2]);
  }
  assert.ok(
    owed.size,
    `no line names the seat that owes a kind: ${said(whole)}`,
  );

  // A declared edge whose source owes no kind cannot be written down, so the
  // declaration is refused rather than quietly enforcing nothing. The tree
  // below declares `operator to tester` and gives the operator no kind.
  const short = kaal(
    "backlog",
    tree({
      seats: ["analyst", "tester", "operator"],
      flow: [
        entry("analyst", []),
        entry("tester", ["operator"]),
        entry("operator", []),
      ],
      kinds: ["no requirement"],
    }),
  );
  assert.equal(short.status, 1, said(short));
  assert.match(
    short.stderr,
    /^operator to tester: no kind is owed by the operator; the edge cannot be written as a block$/m,
    said(short),
  );

  // And it does not fire where the vocabulary does reach: every source of
  // this tree's edges owes a kind.
  const covered = kaal(
    "backlog",
    tree({
      seats: ["analyst", "architect", "tester"],
      flow: [
        entry("analyst", []),
        entry("architect", ["analyst"]),
        entry("tester", ["analyst", "architect"]),
      ],
    }),
  );
  assert.equal(covered.status, 0, said(covered));
  assert.doesNotMatch(
    said(covered),
    /cannot be written as a block/,
    said(covered),
  );

  // The capability this league owes: its own eight edges are all writable.
  const own = kaal("backlog", ROOT);
  assert.doesNotMatch(
    own.stderr,
    /cannot be written as a block/,
    `this tree declares an edge no kind can express: ${said(own)}`,
  );
});
