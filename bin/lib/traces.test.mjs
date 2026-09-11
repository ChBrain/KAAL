// Units for the trace grammar's own reader. `splitTrace` is the one function
// every kind goes through, so the edges of its string handling are worth
// holding here rather than in each wall that calls it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { splitTrace } from "./traces.mjs";

const names = (v) => splitTrace(v).map((e) => e.name);

test("splitTrace cuts the name from the pin before it strips the quotes", () => {
  // The other order leaves the closing backtick on the name, because once a
  // pin follows it the quote is no longer at the end of the string. A name
  // read that way resolves to nothing for ever, and the finding says rename.
  const sha = "a".repeat(64);
  assert.deepEqual(names(`\`x/one.test.mjs\`@${sha}`), ["x/one.test.mjs"]);
  assert.equal(splitTrace(`\`x/one.test.mjs\`@${sha}`)[0].pin, sha);
  assert.deepEqual(names(`'alpha'@${sha}`), ["alpha"]);
  assert.deepEqual(names(`"alpha"@${sha}`), ["alpha"]);
});

test("splitTrace reads a bare name, a pinned name and a list alike", () => {
  const sha = "b".repeat(64);
  assert.deepEqual(names("alpha"), ["alpha"]);
  assert.deepEqual(names(`alpha@${sha}`), ["alpha"]);
  assert.deepEqual(names(`alpha, beta@${sha}, \`gamma\``), [
    "alpha",
    "beta",
    "gamma",
  ]);
});

test("splitTrace names nothing for nothing, none, empty and absent", () => {
  for (const v of ["nothing", "NONE", "`none`", "", "   ", undefined, null])
    assert.deepEqual(names(v), [], `${JSON.stringify(v)} named something`);
});

test("splitTrace drops a trailing stop, which prose puts on a sentence", () => {
  assert.deepEqual(names("alpha."), ["alpha"]);
});
