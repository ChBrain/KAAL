// Acceptance tests for requirement a-seat-names-what-may-block-it. One per
// criterion. Surface only: `kaal flow <root>`, and the two declarations a
// reader of this league meets, `kaal.config.json` and `AGENTS.md`.
//
// Criteria 2 to 5 build their own trees, because they are about what the
// command says when a declaration is wrong and this league's own must not
// be. Criteria 1, 6 and 7 read this league's own files, because the eight
// edges are the ask itself: a declaration that is not supposed to move is
// the one place the league's own tree is fixed ground, and it is where
// `a-diff-carries-one-seat` reads its own page too.
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
/** A command that does not exist answers usage, and that is not a finding. */
const notUsage = (out) =>
  assert.doesNotMatch(out, /^usage: kaal/m, `no such command: ${out}`);

const config = () =>
  JSON.parse(readFileSync(join(ROOT, "kaal.config.json"), "utf8"));
const page = () => readFileSync(join(ROOT, "AGENTS.md"), "utf8");

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

const trees = [];
/**
 * A scratch tree carrying a declaration. The page is written from the same
 * flow the config gets, so a fixture obeys criterion 6 while it is testing
 * something else and the only finding is the one under test.
 */
const tree = (seats, flow, { withFlow = true, page = true } = {}) => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-flow-"));
  trees.push(dir);
  const cfg = {
    seats: seats.map((name) => ({ name, owns: [`${name}/**`] })),
    lanes: [],
    shared: [],
    gates: [],
  };
  if (withFlow) cfg.flow = flow;
  writeFileSync(join(dir, "kaal.config.json"), JSON.stringify(cfg, null, 2));
  if (page)
    writeFileSync(
      join(dir, "AGENTS.md"),
      [
        "# AGENTS.md",
        "",
        "## What a seat may be blocked by",
        "",
        "| seat | blocked by |",
        "| ---- | ---------- |",
        ...flow.map(
          (e) =>
            `| ${e.seat} | ${(e.blockedBy ?? []).length ? (e.blockedBy ?? []).join(", ") : "nothing"} |`,
        ),
        "",
      ].join("\n"),
    );
  return dir;
};
const entry = (seat, blockedBy = []) => ({ seat, blockedBy });
const WHOLE = Object.entries(ASKED).map(([s, b]) => entry(s, b));
const SEATS = Object.keys(ASKED);

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
  const want = Object.fromEntries(
    Object.entries(ASKED).map(([s, b]) => [s, [...b].sort()]),
  );
  assert.deepEqual(seen, want, "flow is not the eight edges the ask names");
  assert.equal(
    flow.reduce((n, e) => n + e.blockedBy.length, 0),
    EDGES,
    "flow does not carry exactly eight edges",
  );
});

test("2. a declaration that does not answer for every seat, or answers for a name that is no seat, is a finding", () => {
  const missing = kaal(
    "flow",
    tree(
      SEATS,
      WHOLE.filter((e) => e.seat !== "operator"),
    ),
  );
  notUsage(said(missing));
  assert.equal(missing.status, 1, said(missing));
  assert.match(
    missing.stderr,
    /^operator: no flow entry; a seat blocked by nothing carries an empty blockedBy$/m,
    said(missing),
  );

  const twice = kaal("flow", tree(SEATS, [...WHOLE, entry("tester", [])]));
  notUsage(said(twice));
  assert.equal(twice.status, 1, said(twice));
  assert.match(
    twice.stderr,
    /^tester: two flow entries; a seat answers once$/m,
    said(twice),
  );

  const stranger = kaal(
    "flow",
    tree(
      SEATS,
      WHOLE.map((e) =>
        e.seat === "tester" ? entry("tester", [...e.blockedBy, "coder"]) : e,
      ),
    ),
  );
  notUsage(said(stranger));
  assert.equal(stranger.status, 1, said(stranger));
  assert.match(stranger.stderr, /^coder: no such seat$/m, said(stranger));
});

test("3. a whole declaration prints one line per seat and exits 0; no flow at all is not this tree's question", () => {
  const whole = kaal("flow", tree(SEATS, WHOLE));
  notUsage(said(whole));
  assert.equal(whole.status, 0, said(whole));
  assert.equal(whole.stderr.trim(), "", said(whole));
  const lines = whole.stdout.split("\n").filter((l) => l.trim());
  assert.deepEqual(
    lines,
    SEATS.map((s) =>
      ASKED[s].length
        ? `${s}: blocked by ${ASKED[s].join(", ")}`
        : `${s}: blocked by nothing`,
    ),
    said(whole),
  );

  const none = kaal("flow", tree(SEATS, WHOLE, { withFlow: false }));
  notUsage(said(none));
  assert.equal(none.status, 2, said(none));
  assert.equal(none.stdout, "", said(none));
  assert.equal(
    none.stderr.trim(),
    "flow: not applicable here: kaal.config.json declares no flow",
    said(none),
  );
});

test("4. a cycle among the declared edges is not a finding", () => {
  const seats = ["tester", "developer"];
  const flow = [entry("tester", ["developer"]), entry("developer", ["tester"])];
  const r = kaal("flow", tree(seats, flow));
  notUsage(said(r));
  // The witness: it ran and it answered about both seats, so the absence of
  // a cycle finding is the command's answer and not the command's silence.
  assert.match(r.stdout, /^tester: blocked by developer$/m, said(r));
  assert.match(r.stdout, /^developer: blocked by tester$/m, said(r));
  assert.equal(r.status, 0, said(r));
  assert.doesNotMatch(said(r), /cycle/i, said(r));
});

test("5. a flow entry carrying any key beyond seat and blockedBy is a finding", () => {
  const flow = WHOLE.map((e) =>
    e.seat === "architect" ? { ...e, orders: ["developer"] } : e,
  );
  const r = kaal("flow", tree(SEATS, flow));
  notUsage(said(r));
  assert.equal(r.status, 1, said(r));
  assert.match(
    r.stderr,
    /^architect: flow entry carries orders; an edge carries dependency and never an instruction$/m,
    said(r),
  );
});

test("6. AGENTS.md carries the same flow as a table, one row per seat", () => {
  const flow = config().flow;
  assert.ok(
    Array.isArray(flow) && flow.length,
    "kaal.config.json declares no flow to compare the page against",
  );
  const rows = new Map();
  for (const line of page().split("\n")) {
    const m = line.match(/^\|([^|]+)\|([^|]+)\|\s*$/);
    if (!m) continue;
    const seat = m[1].trim();
    const blockers = m[2].trim();
    if (/^-+$/.test(seat) || seat === "seat") continue;
    rows.set(seat, blockers);
  }
  assert.ok(rows.size, "AGENTS.md carries no table of what may block a seat");
  for (const e of flow) {
    const said = rows.get(e.seat);
    assert.ok(said !== undefined, `${e.seat}: no row in AGENTS.md`);
    assert.equal(
      said,
      e.blockedBy.length ? e.blockedBy.join(", ") : "nothing",
      `${e.seat}: AGENTS.md says blocked by ${said}; kaal.config.json says ${e.blockedBy.join(", ") || "nothing"}`,
    );
  }
});

test("7. the board runs it, and the fix line does not offer a wider declaration", () => {
  const gates = config().gates;
  assert.ok(
    Array.isArray(gates) && gates.length,
    "the config declares no gates",
  );
  const gate = gates.find((g) => g.name === "flow");
  assert.ok(gate, "no gate named flow on the board");
  assert.equal(gate.command, "node bin/kaal.mjs flow");
  assert.match(gate.fix ?? "", /correct/i, gate.fix);
  assert.match(gate.fix ?? "", /declaration/i, gate.fix);
  assert.match(gate.fix ?? "", /page/i, gate.fix);
  assert.match(gate.fix ?? "", /never/i, gate.fix);
  assert.match(gate.fix ?? "", /edge/i, gate.fix);
});
