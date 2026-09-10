// Contract tests for drawing a-pin-says-who-cleared-it. One per seam,
// numbered to match. Three of the six answer from values alone and take no
// tree at all; the other three read one, and every tree here is built and
// thrown away, because the league's own 422 pins are all `current` and a test
// that read them would be reading one state forever.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { writePins, regionSha } from "../../bin/lib/traces.mjs";

// Imported inside each seam: a namespace import at the top saves a missing
// export and not a module that fails to load, and one absent file would share
// its red across all six.
const need = async (name) => {
  const mod = await import("../../bin/lib/reviews.mjs");
  assert.ok(mod[name], `no ${name} export from reviews.mjs`);
  return mod[name];
};

/** The four, in the order the requirement declares them. */
const STATES = ["current", "review-needed", "reviewed-no-impact", "updated"];
const A = "a".repeat(64);
const B = "b".repeat(64);
const C = "c".repeat(64);

const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};

/**
 * A tree is a tree before it is a fixture, and the trunk above the trees is
 * what the shape check reads. Nothing here asks about shape; a scratch tree
 * without one is red for a rule this task is not about.
 */
const TRUNK = "---\ntraces:\n  parent: none\n---\n\n# Scratch\n\nA tree.\n";
const requirement = (name, criterion = "It holds.") =>
  `---\ntraces:\n  supersedes: nothing\n---\n\n# Requirement: ${name}\n\n` +
  `## Acceptance criteria\n\n1. ${criterion}\n\n## Handoff\n\n- Task: ${name}\n- People: none\n`;
const drawing = (name, pin = name) =>
  `---\ntraces:\n  requirement: ${pin}\n---\n\n# Drawing: ${name}\n\n## Structure\n\nOne part.\n`;
/** The block this task adds, put beside `traces:` in the same frontmatter. */
const withReviews = (text, line) =>
  text.replace(
    /^---\n([\s\S]*?)\n---\n/,
    (_, inner) => `---\n${inner}\nreviews:\n  ${line}\n---\n`,
  );

/**
 * A tree carrying one task per name, each in the state its spec asks for.
 * The tool places every pin and the text moves underneath it afterwards: a
 * sha written by hand here would be a second opinion about what a region is,
 * and the tool's is the one every wall reads. `after` is written once the
 * pins are down, for the cases that want a pin the tool would never write.
 */
function tree(spec, fn, after = {}) {
  const root = mkdtempSync(join(tmpdir(), "kaal-reviews-c-"));
  try {
    const files = { "kaal/league.md": TRUNK };
    for (const name of Object.keys(spec)) {
      files[`requirements/${name}/requirement.md`] = requirement(name);
      files[`architecture/${name}/drawing.md`] = drawing(name);
    }
    put(root, files);
    writePins(root);
    for (const [name, state] of Object.entries(spec)) {
      if (state === "current") continue;
      put(root, {
        [`requirements/${name}/requirement.md`]: requirement(name, "It moved."),
      });
      if (state === "review-needed") continue;
      // A review names the sha it cleared, and the sha it cleared is the one
      // the region has now: this is the review a person wrote after reading
      // the text that moved.
      const now = regionSha(root, "requirement", name);
      const at = join(root, "architecture", name, "drawing.md");
      writeFileSync(
        at,
        withReviews(
          readFileSync(at, "utf8"),
          `requirement/${name}: ${state}@${now} by kai: read it, and it says the same thing`,
        ),
      );
    }
    put(root, after);
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("1. what a person recorded: an entry per reviewed pin, and a finding for a word the league does not know or a clearance missing its who or its why", async () => {
  const readReviews = await need("readReviews");
  const one = readReviews(
    withReviews(
      drawing("alpha"),
      `requirement/alpha: reviewed-no-impact@${A} by kai: it moved a comma, and nothing here reads commas`,
    ),
  );
  assert.deepEqual(
    one.findings ?? [],
    [],
    `a sound block found something: ${JSON.stringify(one.findings)}`,
  );
  assert.equal(
    (one.reviews ?? []).length,
    1,
    `expected one entry: ${JSON.stringify(one.reviews)}`,
  );
  const e = one.reviews[0];
  assert.equal(e.kind, "requirement", `the kind did not come back: ${e.kind}`);
  assert.equal(e.name, "alpha", `the name did not come back: ${e.name}`);
  assert.equal(e.state, "reviewed-no-impact", `the state read: ${e.state}`);
  assert.equal(e.sha, A, `the cleared sha did not come back: ${e.sha}`);
  assert.equal(e.who, "kai", `the person did not come back: ${e.who}`);
  // Whole, commas and all. A reason lives in this block rather than on the
  // pin precisely so that it may carry them.
  assert.equal(
    e.why,
    "it moved a comma, and nothing here reads commas",
    `the reason came back cut: ${e.why}`,
  );

  // No block at all is the ordinary case: 422 pins in this league carry none
  // and not one of them may become a finding.
  const none = readReviews(drawing("alpha"));
  assert.deepEqual((none.reviews ?? []).length, 0, "a block appeared from air");
  assert.deepEqual(
    none.findings ?? [],
    [],
    `an artefact with no reviews block found something: ${JSON.stringify(none.findings)}`,
  );

  // A fifth word. The four are a table, and a word outside it is a finding
  // rather than a state, because the alternative is a state nobody defined
  // passing as one somebody did.
  const strange = readReviews(
    withReviews(
      drawing("alpha"),
      `requirement/alpha: looked-at@${A} by kai: hm`,
    ),
  );
  assert.equal(
    (strange.findings ?? []).length,
    1,
    `expected one finding: ${JSON.stringify(strange.findings)}`,
  );
  assert.ok(
    strange.findings[0].includes("looked-at"),
    `the word is not named: ${strange.findings[0]}`,
  );

  // Each half missing, separately, and each finding says which half. A
  // reader who has to guess which of the two is absent reads the file again.
  const noWho = readReviews(
    withReviews(drawing("alpha"), `requirement/alpha: updated@${A}: because`),
  );
  assert.equal(
    (noWho.findings ?? []).length,
    1,
    `expected one finding: ${JSON.stringify(noWho.findings)}`,
  );
  assert.match(
    noWho.findings[0],
    /who/,
    `it does not say who: ${noWho.findings[0]}`,
  );
  const noWhy = readReviews(
    withReviews(drawing("alpha"), `requirement/alpha: updated@${A} by kai`),
  );
  assert.equal(
    (noWhy.findings ?? []).length,
    1,
    `expected one finding: ${JSON.stringify(noWhy.findings)}`,
  );
  assert.match(
    noWhy.findings[0],
    /why|reason/,
    `it does not say why: ${noWhy.findings[0]}`,
  );
});

test("2. the state: exactly one of the four, from a pin, the sha its region has now and what was recorded", async () => {
  const stateOf = await need("stateOf");
  const pin = (sha) => ({ kind: "requirement", name: "alpha", pin: sha });
  const cleared = (state, sha, name = "alpha", kind = "requirement") => [
    { kind, name, state, sha, who: "kai", why: "read it" },
  ];
  const at = (p, sha, reviews = []) => {
    const s = stateOf(p, sha, reviews);
    assert.ok(STATES.includes(s), `${s} is not one of the four states`);
    return s;
  };
  // The pin matches the text, which is 422 of this tree's 422 pins.
  assert.equal(at(pin(A), A), "current");
  // A pin written without a state reads `current`, and so does a trace
  // carrying no sha at all: neither says anything moved.
  assert.equal(at(pin(null), A), "current");
  // The text moved and nobody has said anything about it.
  assert.equal(at(pin(B), A), "review-needed");
  assert.equal(
    at(pin(B), A, cleared("reviewed-no-impact", A)),
    "reviewed-no-impact",
  );
  assert.equal(at(pin(B), A, cleared("updated", A)), "updated");
  // A review names the sha it cleared, so a second move reopens it. This is
  // the requirement's third open question and the drawing's third decision.
  assert.equal(
    at(pin(B), A, cleared("reviewed-no-impact", C)),
    "review-needed",
  );
  // And a review clears the pin it names and no other: two kinds can point
  // at one file, so a key that lost its kind would clear both.
  assert.equal(at(pin(B), A, cleared("updated", A, "beta")), "review-needed");
  assert.equal(
    at(pin(B), A, cleared("updated", A, "alpha", "supersedes")),
    "review-needed",
  );
});

test("3. a finding or a line: nothing where a pin is current, a line naming the artefact, the kind, the name and the state where it is not, and nothing at all for a name that resolves to nothing", async () => {
  const report = await need("report");
  tree(
    { alpha: "current", beta: "review-needed", delta: "reviewed-no-impact" },
    (root) => {
      const lines = report(root);
      assert.ok(Array.isArray(lines), `report gave ${typeof lines}`);
      assert.equal(
        lines.length,
        2,
        `expected a line for beta and delta only: ${JSON.stringify(lines)}`,
      );
      for (const [name, state] of [
        ["beta", "review-needed"],
        ["delta", "reviewed-no-impact"],
      ]) {
        const line = lines.find((l) => String(l).includes(name));
        assert.ok(line, `${name} has no line: ${JSON.stringify(lines)}`);
        for (const part of [name, "requirement", state])
          assert.ok(
            String(line).includes(part),
            `the line does not name ${part}: ${line}`,
          );
      }
      // A current pin is silent. A report that named all 422 would be a page
      // nobody reads, and the states worth reading would be inside it.
      assert.ok(
        !lines.some((l) => String(l).includes("alpha")),
        `a current pin got a line: ${JSON.stringify(lines)}`,
      );
      // And a name that resolves to nothing is not a state. It stays a
      // finding of the trace wall, in the wall's own words, and this seam
      // never sees it: a pin compared against a file that is not there would
      // otherwise read as moved and be excused as a line.
      assert.ok(
        !lines.some((l) => String(l).includes("nowhere")),
        `a dangling name came back as a state: ${JSON.stringify(lines)}`,
      );
    },
    { "architecture/nowhere/drawing.md": drawing("nowhere", `missing@${A}`) },
  );
});

test("4. the counts: how many pins stand in each of the four states, in the order the four are declared", async () => {
  const counts = await need("counts");
  tree(
    {
      alpha: "current",
      beta: "review-needed",
      gamma: "reviewed-no-impact",
      delta: "updated",
    },
    (root) => {
      const c = counts(root);
      assert.ok(Array.isArray(c), `counts gave ${typeof c}`);
      assert.deepEqual(
        c.map((row) => row.state),
        STATES,
        `the four states came back as ${JSON.stringify(c.map((r) => r.state))}`,
      );
      // One pin in each state, so a count that read one state as another is
      // wrong in two places at once and cannot be right by accident.
      assert.deepEqual(
        c.map((row) => row.count),
        [1, 1, 1, 1],
        `four pins, one each, counted as ${JSON.stringify(c)}`,
      );
    },
  );
});

test("5. what write may touch: a pin with none, a pin a review clears, and never a pin nobody read", async () => {
  const mayWrite = await need("mayWrite");
  const pin = (sha) => ({ kind: "requirement", name: "alpha", pin: sha });
  const cleared = (sha) => [
    {
      kind: "requirement",
      name: "alpha",
      state: "updated",
      sha,
      who: "kai",
      why: "read it",
    },
  ];
  // Nothing to lose: a trace with no pin is a pin the tool has never
  // written, which is how all 422 of them started.
  assert.equal(mayWrite(pin(null), A, []), true);
  assert.equal(mayWrite(pin(A), A, []), true, "a matching pin was refused");
  // Bookkeeping after the act: somebody read the text that moved, so
  // carrying the sha forward is a tool's job and not a person's.
  assert.equal(
    mayWrite(pin(B), A, cleared(A)),
    true,
    "a pin whose review clears the text as it stands was refused",
  );
  // The defect this task exists to fix: today the tool advances this one and
  // the reading nobody did disappears with it.
  assert.equal(
    mayWrite(pin(B), A, []),
    false,
    "an unreviewed moved pin may still be written",
  );
  // And a review that cleared an older text does not clear this one, or a
  // review written once would clear every move after it forever.
  assert.equal(
    mayWrite(pin(B), A, cleared(C)),
    false,
    "a review of an older text cleared the pin again",
  );
});

test("6. what a task owes: the pins in its artefacts that nobody has read, and nothing for a task that owes none", async () => {
  const owes = await need("owes");
  tree(
    { alpha: "review-needed", beta: "current", gamma: "reviewed-no-impact" },
    (root) => {
      const owed = owes(root, "alpha");
      assert.ok(Array.isArray(owed), `owes gave ${typeof owed}`);
      assert.equal(
        owed.length,
        1,
        `expected the one unread pin: ${JSON.stringify(owed)}`,
      );
      // The report says why a task is not delivered, so what it reads has to
      // carry the reason and not only the count.
      assert.ok(
        String(owed[0]).includes("alpha"),
        `what alpha owes does not name it: ${owed[0]}`,
      );
      assert.deepEqual(
        owes(root, "beta"),
        [],
        "a task whose pins all match owes a reading",
      );
      // A pin somebody read and cleared is not owed. That is the whole
      // difference between a state and a failure.
      assert.deepEqual(
        owes(root, "gamma"),
        [],
        "a reviewed pin is still counted against its task",
      );
      assert.deepEqual(
        owes(root, "no-such-task"),
        [],
        "a task with no artefacts at all owes something",
      );
    },
  );
});
