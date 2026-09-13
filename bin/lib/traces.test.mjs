// Units for the trace grammar's own reader. `splitTrace` is the one function
// every kind goes through, so the edges of its string handling are worth
// holding here rather than in each wall that calls it.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkTraces, readTrace, splitTrace, writePins } from "./traces.mjs";

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

test("readTrace folds a kind written as a block into the value shape", () => {
  const sha = "a".repeat(64);
  const t = readTrace(
    `---\ntraces:\n  parent: strategy\ncases:\n  x/one.test.mjs: ${sha}\n  x/two.test.mjs: nothing\n---\n`,
  );
  assert.equal(t.parent, "strategy", "the line form stopped being read");
  assert.deepEqual(
    splitTrace(t.cases).map((e) => e.name),
    ["x/one.test.mjs", "x/two.test.mjs"],
  );
  assert.equal(
    splitTrace(t.cases)[0].pin,
    sha,
    "a block entry's sha is not its pin",
  );
  assert.equal(splitTrace(t.cases)[1].pin, null, "`nothing` became a pin");
});

test("readTrace reads an empty block as naming nothing", () => {
  assert.deepEqual(
    splitTrace(readTrace("---\ntraces:\n  parent: none\ncases:\n---\n").cases),
    [],
  );
});

test("readTrace takes the block where a page carries both writings", () => {
  // A block is what the page shows a reader, so it is what the tree means.
  const t = readTrace(
    "---\ntraces:\n  parent: none\n  cases: x/line.test.mjs\ncases:\n  x/block.test.mjs: nothing\n---\n",
  );
  assert.deepEqual(
    splitTrace(t.cases).map((e) => e.name),
    ["x/block.test.mjs"],
  );
});

test("a key that is no kind is left alone, block or not", () => {
  const t = readTrace(
    "---\ntraces:\n  parent: none\nreviews:\n  requirement/alpha: current\n---\n",
  );
  assert.equal(t.reviews, undefined, "a reviews block was read as a trace");
});

test("writePins names a bare block entry it cannot read", () => {
  const root = mkdtempSync(join(tmpdir(), "kaal-traces-bare-entry-"));
  const strategy = join(root, "tests", "strategy.md");
  try {
    mkdirSync(join(root, "tests", "suites"), { recursive: true });
    writeFileSync(
      strategy,
      "---\ntraces:\n  parent: none\nsuites:\n  alpha\n---\n# Strategy\n",
    );
    writeFileSync(
      join(root, "tests", "suites", "alpha.md"),
      "---\ntraces:\n  parent: strategy\ncases:\n---\n# Alpha\n",
    );

    writePins(root);

    assert.match(readFileSync(strategy, "utf8"), /^  alpha$/m);
    assert.deepEqual(
      checkTraces(root).filter((finding) => finding.artefact === "strategy"),
      [
        {
          artefact: "strategy",
          kind: "suites",
          message: "alpha cannot be read without a colon",
        },
      ],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("writePins names a bare block entry nested under traces", () => {
  const root = mkdtempSync(join(tmpdir(), "kaal-traces-nested-entry-"));
  const strategy = join(root, "tests", "strategy.md");
  try {
    mkdirSync(join(root, "tests", "suites"), { recursive: true });
    writeFileSync(
      strategy,
      "---\ntraces:\n  parent: none\n  suites:\n    alpha\n---\n# Strategy\n",
    );
    writeFileSync(
      join(root, "tests", "suites", "alpha.md"),
      "---\ntraces:\n  parent: strategy\ncases:\n---\n# Alpha\n",
    );

    writePins(root);

    assert.match(readFileSync(strategy, "utf8"), /^    alpha$/m);
    assert.deepEqual(
      checkTraces(root).filter((finding) => finding.artefact === "strategy"),
      [
        {
          artefact: "strategy",
          kind: "suites",
          message: "alpha cannot be read without a colon",
        },
      ],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("writePins names a bare case entry it cannot read", () => {
  const root = mkdtempSync(join(tmpdir(), "kaal-traces-bare-case-"));
  const suite = join(root, "tests", "suites", "alpha.md");
  const casePath = "requirements/alpha/acceptance.test.mjs";
  try {
    mkdirSync(join(root, "tests", "suites"), { recursive: true });
    mkdirSync(join(root, "requirements", "alpha"), { recursive: true });
    writeFileSync(
      join(root, "tests", "strategy.md"),
      "---\ntraces:\n  parent: none\n---\n# Strategy\n",
    );
    writeFileSync(
      suite,
      `---\ntraces:\n  parent: strategy\ncases:\n  ${casePath}\n---\n# Alpha\n`,
    );
    writeFileSync(join(root, casePath), 'import { test } from "node:test";\n');

    writePins(root);

    assert.match(
      readFileSync(suite, "utf8"),
      new RegExp(`^  ${casePath}$`, "m"),
    );
    assert.deepEqual(
      checkTraces(root).filter(
        (finding) => finding.artefact === "suites/alpha",
      ),
      [
        {
          artefact: "suites/alpha",
          kind: "cases",
          message: `${casePath} cannot be read without a colon`,
        },
      ],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
