import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runGates, wallEnv } from "../bin/lib/gates.mjs";

const F = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "architecture",
  "gates-v1",
  "fixtures",
);

test("runs every wall in order, reads a count, fails an unrunnable one, and keeps going after a failure", () => {
  const r = runGates(join(F, "mixed"));
  assert.equal(r.ok, false);
  assert.deepEqual(
    r.results.map((x) => x.name),
    ["passes", "fails", "counts", "missing"],
  );
  assert.deepEqual(
    r.results.map((x) => x.ok),
    [true, false, true, false],
  );
  assert.equal(r.results[2].count, 3);
  assert.equal(r.results[3].fix, "npm install");
});

test("a clean config is ok and the summary counts the walls", () => {
  const r = runGates(join(F, "clean"));
  assert.equal(r.ok, true);
  assert.match(r.summary, /2 wall/);
});

test("a root with no config throws, and a config with no gates is a failure, not a pass", () => {
  assert.throws(() => runGates("/nowhere/at/all"));
  const r = runGates(join(F, "clean"), { gates: [] });
  assert.equal(r.ok, false);
  assert.match(r.summary, /no walls/);
});

test("a failing node --test wall stays red even when the runner itself runs under node --test", () => {
  // This test runs under node --test, so NODE_TEST_CONTEXT is set here; the
  // wall below must not inherit it, or it would report green on nothing.
  assert.ok(
    process.env.NODE_TEST_CONTEXT,
    "this test is not running under node --test",
  );
  assert.equal(wallEnv().NODE_TEST_CONTEXT, undefined);
  assert.equal(wallEnv().KAAL_GATES, "1");
  const r = runGates(join(F, "clean"), {
    gates: [
      {
        name: "nested",
        command:
          "node --test " +
          join(
            F,
            "..",
            "..",
            "..",
            "requirements",
            "push-v1",
            "acceptance.test.mjs",
          ),
        fix: "none",
      },
    ],
  });
  assert.equal(r.ok, false, "a red nested test suite was reported green");
});
