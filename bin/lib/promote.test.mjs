// Units for the promotion's readers. The contracts hold the seams; these hold
// the grammar edges a seam does not mention, which is where a flag read by
// hand goes wrong: a flag with no value, a ref where a branch is meant, a
// lane pattern with a star in the middle.
import { test } from "node:test";
import assert from "node:assert/strict";
import { asked, refusedHead, refusedVerdicts } from "./promote.mjs";

test("asked reads a ref where the environment keeps one and a branch where a person does", () => {
  // A gate keeps the base as `origin/<name>` and a person says `<name>`.
  assert.equal(asked([], { KAAL_BASE: "origin/main" }).into, "main");
  assert.equal(asked([], { KAAL_BASE: "main" }).into, "main");
  assert.equal(asked(["--into", "origin/main"], {}).usage, undefined);
});

test("asked treats a flag with no value as no flag, and says so", () => {
  // `--into` last on the line is a caller who meant to say something.
  const r = asked(["--into"], {});
  assert.ok(
    r.why,
    `a dangling flag was read as a target: ${JSON.stringify(r)}`,
  );
});

test("asked answers the head as the target where nothing names one", () => {
  // A promotion asked about `main` with no head is being asked about the
  // promotion itself, which is the only head main takes.
  assert.deepEqual(asked(["--into", "main"], {}), {
    into: "main",
    from: "main",
  });
});

test("asked is blank where the environment holds only whitespace", () => {
  assert.ok(asked([], { KAAL_BASE: "  ", KAAL_BRANCH: " " }).why);
});

test("refusedHead reads a lane pattern with its star where it sits", () => {
  // `build/*` holds `build/x` and not `build/x/y`: a star is one segment.
  assert.equal(refusedHead("release", "build/x", ["build/*"]), null);
  assert.ok(refusedHead("release", "build/x/y", ["build/*"]));
  assert.ok(refusedHead("release", "xbuild/x", ["build/*"]));
  // And a tree declaring no lane holds nothing, rather than everything.
  assert.ok(refusedHead("release", "build/x", []));
  assert.ok(refusedHead("release", "build/x", undefined));
});

test("refusedVerdicts answers nothing for a target it does not know", () => {
  // The caller refuses an unknown target before this is reached; answering
  // everything here would make a usage error read as a tree in ruins.
  const all = [{ task: "a", word: "regressed" }];
  assert.deepEqual(refusedVerdicts(all, "production"), []);
  assert.deepEqual(refusedVerdicts(undefined, "main"), []);
});
