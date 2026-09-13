// Units for the manager's traversal. The judgement is the manager's and the
// traversal is not, so what is tested here is the part that must be the same
// every time: which seats are roots, and which are in a cycle.
import { test } from "node:test";
import assert from "node:assert/strict";
import { edgesOf, roots, cycles } from "./order.mjs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));

const page = (entries) =>
  `---\nblocks:\n${entries.map((e) => `  ${e}\n`).join("")}---\n\n# Backlog\n`;

test("edgesOf reads the key as the seat that owes and the task", () => {
  const got = edgesOf(page(["architect/alpha: no drawing"]), "developer");
  assert.equal(got.length, 1, JSON.stringify(got));
  assert.deepEqual(got[0], {
    owes: "architect",
    task: "alpha",
    kind: "no drawing",
    waiting: "developer",
  });
});

test("edgesOf holds two blocks on one task, which a key of the task alone cannot", () => {
  const got = edgesOf(
    page(["analyst/beta: no requirement", "architect/beta: no drawing"]),
    "developer",
  );
  assert.equal(got.length, 2, JSON.stringify(got));
  assert.deepEqual(
    got.map((e) => e.owes).sort(),
    ["analyst", "architect"],
    JSON.stringify(got),
  );
});

test("edgesOf reads nothing outside the blocks block", () => {
  const stray =
    "---\ntraces:\n  parent: alpha@abc\n---\n\n  architect/x: no drawing\n";
  assert.deepEqual(edgesOf(stray, "developer"), []);
});

test("roots are the seats nothing waits behind", () => {
  // developer waits on architect, architect waits on analyst, and nobody
  // waits on the analyst: the chain has one place an order can start.
  const edges = [
    { owes: "architect", task: "a", kind: "no drawing", waiting: "developer" },
    {
      owes: "analyst",
      task: "b",
      kind: "no requirement",
      waiting: "architect",
    },
  ];
  assert.deepEqual(roots(edges), ["analyst"]);
});

test("a seat that owes and also waits is not a root", () => {
  const edges = [
    { owes: "architect", task: "a", kind: "no drawing", waiting: "developer" },
  ];
  // The architect owes and nobody waits behind it, so it is the root; the
  // developer owes nothing and is nobody's root.
  assert.deepEqual(roots(edges), ["architect"]);
});

test("cycles name every seat in the ring and no ring twice", () => {
  const edges = [
    { owes: "architect", task: "a", kind: "no drawing", waiting: "analyst" },
    {
      owes: "analyst",
      task: "b",
      kind: "no requirement",
      waiting: "architect",
    },
  ];
  const found = cycles(edges);
  assert.equal(found.length, 1, JSON.stringify(found));
  assert.deepEqual([...found[0]].sort(), ["analyst", "architect"]);
  // And a cycle leaves no root behind, which is the whole reason to name it:
  // every seat in it both owes and waits.
  assert.deepEqual(roots(edges), []);
});

test("a chain with no ring has no cycle", () => {
  const edges = [
    { owes: "architect", task: "a", kind: "no drawing", waiting: "developer" },
    {
      owes: "analyst",
      task: "b",
      kind: "no requirement",
      waiting: "architect",
    },
  ];
  assert.deepEqual(cycles(edges), []);
});

test("the script refuses a tree with no board and says which tree", () => {
  // The one thing it cannot derive is which seats there are. A directory
  // holding no board is not an empty league, it is the wrong directory, and
  // answering an empty order there would read as nobody being blocked.
  const empty = mkdtempSync(join(tmpdir(), "kaal-order-"));
  try {
    const r = spawnSync(process.execPath, [join(HERE, "order.mjs"), empty], {
      encoding: "utf8",
    });
    assert.equal(r.status, 1, `${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /no kaal\.config\.json/);
    assert.ok(r.stderr.includes(empty), `the tree is not named: ${r.stderr}`);
    assert.equal(r.stdout, "", `an order was printed anyway: ${r.stdout}`);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});
