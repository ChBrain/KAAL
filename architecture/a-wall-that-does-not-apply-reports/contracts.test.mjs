// Contract tests for drawing a-wall-that-does-not-apply-reports. One per
// seam, numbered to match. Each drives its seam's own function on a fixture
// tree whose walls are scripts that exit as the case needs, because the thing
// under test is a number and a board that read it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

// Imported inside each seam: a namespace import at the top saves a missing
// export, not a module that fails to load, and one absent file would share
// its red across all five.
const need = async (file, name) => {
  const mod = await import(`../../bin/lib/${file}`);
  assert.ok(mod[name], `no ${name} export from ${file}`);
  return mod[name];
};

const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};
/** A wall that says one line and exits with the code the case wants. */
const wall = (name, code, line) => ({
  name,
  command: `node -e "console.log('${line}'); process.exit(${code})"`,
  fix: `fix ${name}`,
});
const PASSES = wall("alpha", 0, "alpha: fine");
const DECLINES = wall("beta", 2, "beta: not applicable here: nothing to judge");
const DECLINES2 = wall("epsilon", 2, "epsilon: not applicable here: nothing");
const FAILS = wall("gamma", 1, "gamma: a finding");
const CANNOT_RUN = {
  name: "delta",
  command: "kaal-no-such-command-exists --please",
  fix: "fix delta",
};

const tree = (gates, files, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-apply-c-"));
  try {
    put(root, {
      "kaal.config.json": JSON.stringify({ gates }, null, 2),
      ...files,
    });
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
const by = (results, name) => results.find((x) => x.name === name);

test("1. which of three answers", async () => {
  const runGates = await need("gates.mjs", "runGates");
  tree([PASSES, DECLINES, FAILS, CANNOT_RUN], {}, (root) => {
    const { results } = runGates(root);
    assert.equal(results.length, 4, JSON.stringify(results.map((x) => x.name)));
    // Passing and failing keep the answer they have always had, or a reader
    // of this contract cannot tell a third state from a renamed second one.
    assert.equal(by(results, "alpha").ok, true);
    assert.equal(by(results, "gamma").ok, false);
    // The third, and it is neither of the two.
    const beta = by(results, "beta");
    assert.notEqual(beta.ok, true, "a wall that declined reads as passing");
    assert.ok(
      Object.values(beta).some((v) => v === true && beta.ok !== true),
      `nothing on the result says it declined: ${JSON.stringify(beta)}`,
    );
    // A command that cannot run is neither 0 nor 2, so it is a failure
    // without anyone deciding: gates-v1's claim, held here.
    const delta = by(results, "delta");
    assert.equal(delta.ok, false);
    assert.notEqual(
      delta.status,
      2,
      "a command that cannot run answered the declining code",
    );
  });
});

test("2. a waiver over a wall that declined is unspent", async () => {
  const runGates = await need("gates.mjs", "runGates");
  const waiver = (wallName) =>
    `---\nwall: ${wallName}\nwho: a person\nwhy: because\nuntil: 2099-01-01\n---\n\n# Waiver\n`;
  // The premise: a waiver over a wall that failed is spent, which is what a
  // waiver is for, so the case below is about the third state and not about
  // waivers being broken.
  tree([FAILS], { "waivers/gamma.md": waiver("gamma") }, (root) => {
    const { results } = runGates(root);
    assert.ok(by(results, "gamma").waived, "a waiver over a red was not spent");
  });
  // And over a wall that declined it is unused, the same answer it gives over
  // a wall that passed: there was no red to waive, and a licence spent on
  // nothing makes the count of waived walls wrong in the flattering direction.
  tree([DECLINES], { "waivers/beta.md": waiver("beta") }, (root) => {
    const { results, lines } = runGates(root);
    const beta = by(results, "beta");
    assert.ok(!beta.waived, `a waiver over a wall that declined was spent`);
    assert.ok(beta.unused, `the waiver is not reported unused`);
    assert.ok(
      lines.some((l) => /unused waiver/.test(l)),
      `the board does not say the waiver went unused: ${lines.join("\n")}`,
    );
  });
});

test("3. its own word, and what it said", async () => {
  const runGates = await need("gates.mjs", "runGates");
  tree([PASSES, DECLINES, FAILS], {}, (root) => {
    const { lines } = runGates(root);
    const line = lines.find((l) => l.includes("beta"));
    assert.ok(line, `the wall that declined has no line: ${lines.join("\n")}`);
    assert.doesNotMatch(line, /^ok\s/, `it reads as passing: ${line}`);
    assert.doesNotMatch(line, /^FAIL/, `it reads as failing: ${line}`);
    // What the wall said follows it, as a failing wall's output does: a word
    // with no reason is a state a reader has to guess at.
    assert.ok(
      lines.some((l) => l.includes("nothing to judge")),
      `what the wall said is not carried: ${lines.join("\n")}`,
    );
    // The other two are untouched, which is the premise of the two above.
    assert.ok(lines.some((l) => /^ok\s+alpha/.test(l)));
    assert.ok(lines.some((l) => /^FAIL\s+gamma/.test(l)));
  });
});

test("4. green, and how many declined", async () => {
  const runGates = await need("gates.mjs", "runGates");
  tree([PASSES, DECLINES, DECLINES2], {}, (root) => {
    const { ok, summary } = runGates(root);
    assert.equal(ok, true, `a board with nothing wrong was not ok: ${summary}`);
    assert.match(summary, /^green:/, summary);
    // The count is computed from the board and not written into the test: two
    // walls declined here and the sentence has to say two.
    const declined = 2;
    assert.ok(
      new RegExp(`\\b${declined}\\b`).test(summary),
      `the count of ${declined} is not in the summary: ${summary}`,
    );
    assert.match(summary, /failing/, summary);
    assert.match(summary, /waived/, summary);
  });
  // Absence needs a witness: one failing wall on the same board is red, so a
  // runner that called everything green could not pass this.
  tree([PASSES, DECLINES, FAILS], {}, (root) => {
    const { ok, summary } = runGates(root);
    assert.equal(ok, false, summary);
    assert.match(summary, /^red:/, summary);
  });
});

test("5. what the promotion calls red", async () => {
  const redWalls = await need("promote.mjs", "redWalls");
  tree([PASSES, DECLINES], {}, (root) => {
    const r = redWalls(root);
    assert.equal(r.count, 0, JSON.stringify(r.findings));
    assert.deepEqual(r.findings, []);
  });
  // And a wall that failed is still red, or the case above would pass on a
  // promotion that had stopped reading the board at all.
  tree([PASSES, DECLINES, FAILS], {}, (root) => {
    const r = redWalls(root);
    assert.equal(r.count, 1, JSON.stringify(r.findings));
    assert.equal(r.findings[0].artefact, "gamma");
  });
});
