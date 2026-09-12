import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { mkdtempSync, symlinkSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { runGates, wallEnv, caseEnv, readWaiver } from "./gates.mjs";

const F = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
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
  // A reporter in NODE_OPTIONS does not lose to one a wall names on the
  // command line: node collects both and refuses the pair. So it goes, for
  // the same reason the marker above goes, and whatever else was there stays.
  assert.equal(
    wallEnv({ NODE_OPTIONS: "--test-reporter=spec" }).NODE_OPTIONS,
    undefined,
  );
  assert.equal(
    wallEnv({
      NODE_OPTIONS:
        "--max-old-space-size=99 --test-reporter=spec --test-reporter-destination=stdout",
    }).NODE_OPTIONS,
    "--max-old-space-size=99",
  );
  assert.equal(
    wallEnv({ NODE_OPTIONS: "--max-old-space-size=99" }).NODE_OPTIONS,
    "--max-old-space-size=99",
  );
  // A suite that is red on purpose and forever. This used to run
  // `requirements/push-v1/acceptance.test.mjs`, which was red only because
  // nobody had delivered that task, so the day somebody did this unit went
  // green and proved nothing about nesting at all.
  const RED = join(
    dirname(fileURLToPath(import.meta.url)),
    "fixtures",
    "a-suite-that-fails.test.mjs",
  );
  const r = runGates(join(F, "clean"), {
    gates: [{ name: "nested", command: `node --test ${RED}`, fix: "none" }],
  });
  assert.equal(r.ok, false, "a red nested test suite was reported green");
});

test("readWaiver: fields, or the reason it counts for nothing", () => {
  const RQ = join(F, "..", "..", "..", "requirements", "waiver-v1", "fixtures");
  assert.equal(readWaiver(join(RQ, "waived"), "broken").waiver.who, "Kai");
  assert.match(readWaiver(join(RQ, "expired"), "broken").reason, /expired/);
  assert.match(
    readWaiver(join(RQ, "incomplete"), "broken").reason,
    /missing why/,
  );
  assert.equal(readWaiver(join(RQ, "waived"), "no-such-wall").waiver, null);
  assert.equal(readWaiver(join(RQ, "waived"), "no-such-wall").reason, null);
});

test("runGates: a valid waiver makes a red wall waived and the run ok; the summary counts it; an unused waiver is reported", () => {
  const RQ = join(F, "..", "..", "..", "requirements", "waiver-v1", "fixtures");
  const w = runGates(join(RQ, "waived"));
  assert.equal(w.ok, true);
  assert.equal(w.results.find((x) => x.name === "broken").waived.who, "Kai");
  assert.match(w.summary, /0 failing, 1 waived/);
  assert.equal(runGates(join(RQ, "expired")).ok, false);
  const u = runGates(join(F, "..", "..", "waiver-v1", "fixtures", "unused"));
  assert.equal(u.ok, true);
  assert.ok(u.lines.some((l) => /^unused waiver fine/.test(l)));
});

test("a wall runs through the platform's own shell: no sh on the PATH, still ok", () => {
  // On Windows the file must be node.exe, and a symlink may need a
  // privilege, so a copy is the fallback.
  const bin = mkdtempSync(join(tmpdir(), "kaal-nosh-"));
  const name = process.platform === "win32" ? "node.exe" : "node";
  const path = process.env.PATH;
  try {
    try {
      symlinkSync(process.execPath, join(bin, name), "file");
    } catch {
      copyFileSync(process.execPath, join(bin, name));
    }
    process.env.PATH = bin;
    const r = runGates(join(F, "clean"));
    assert.equal(r.ok, true, r.lines.join("\n"));
    assert.equal(r.results[1].count, 2);
  } finally {
    process.env.PATH = path;
    rmSync(bin, { recursive: true, force: true });
  }
});

test("a failing wall's own lines follow its FAIL line, indented; a green wall's do not", () => {
  const r = runGates(join(F, "mixed"));
  const i = r.lines.findIndex((l) => l.startsWith("FAIL fails"));
  assert.ok(i >= 0, "no FAIL line for the failing wall");
  assert.ok(
    r.lines.every(
      (l, j) => !(l.startsWith("ok  ") && r.lines[j + 1]?.startsWith("  ")),
    ),
    "a green wall printed its lines",
  );
  const shown = runGates(join(F, "clean"), {
    gates: [
      {
        name: "loud",
        command:
          "node -e \"console.log('what the wall saw'); process.exit(1)\"",
        fix: "read it",
      },
    ],
  });
  assert.deepEqual(shown.lines, [
    "FAIL loud  fix: read it",
    "  what the wall saw",
  ]);
});

test("a wall keeps the target this tree is judged by, and a case does not", () => {
  // The two are not the same question. A wall is about this tree and is told
  // its target so it never guesses one, so `class` and `seats` would lose
  // theirs if it went. A case builds a tree of its own and asks the engine
  // about that one, and where it spawns a board, this variable decides
  // whether that board's redness is binding: an inherited one silently
  // changes the exit code the case is asserting about. Eight cases across six
  // files were red in CI and green on a desk for exactly that.
  const told = { KAAL_BASE: "origin/release" };
  assert.equal(wallEnv(told).KAAL_BASE, "origin/release");
  assert.equal(caseEnv(told).KAAL_BASE, undefined);
  // And a case still gets everything a wall clears, because it is a wall's
  // environment and one thing further: the same marker, the same reporter
  // rule, and the runner's own context gone.
  assert.equal(caseEnv(told).KAAL_GATES, "1");
  assert.equal(caseEnv().NODE_TEST_CONTEXT, undefined);
  assert.equal(
    caseEnv({ NODE_OPTIONS: "--test-reporter=spec" }).NODE_OPTIONS,
    undefined,
  );
  // The branch is not cleared. The seats wall reads it, no case that spawns a
  // board reads it back, and a sweep of every case file in the tree found it
  // turns nothing red. Clearing what is not leaking would be a rule nobody
  // can point at a failure for.
  assert.equal(caseEnv({ KAAL_BRANCH: "build/x" }).KAAL_BRANCH, "build/x");
});
