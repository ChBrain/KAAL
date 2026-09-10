// Acceptance tests for requirement a-pin-says-who-cleared-it. One per
// criterion. Surface only: `kaal traces`, `kaal traces --write`, the report
// that judges a task, and the board's config.
//
// Every case builds its own tree. The league's own 422 pins are all `current`,
// so a test that read them would be reading one state forever and would go
// green the day somebody re-pinned by hand.
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
const notUsage = (out) =>
  assert.doesNotMatch(out, /^usage: kaal/m, `no such command: ${out}`);
const put = (root, files) => {
  for (const [rel, text] of Object.entries(files)) {
    const p = join(root, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  }
};

const requirement = (name, criteria = "\n1. It holds.\n") =>
  `---\ntraces:\n  supersedes: nothing\n---\n\n# Requirement: ${name}\n\n` +
  `## Acceptance criteria\n${criteria}\n## Handoff\n\n- Task: ${name}\n- People: none\n`;
const drawing = (name, pin) =>
  `---\ntraces:\n  requirement: ${pin}\n---\n\n# Drawing: ${name}\n\n## Structure\n\nOne part.\n`;

/**
 * A tree is a tree before it is a fixture: the trunk above the three is what
 * the shape check reads, and a scratch tree without one is red for a rule
 * this task is not about. Every case gets one and none of them names it.
 */
const TRUNK = "---\ntraces:\n  parent: none\n---\n\n# Scratch\n\nA tree.\n";

const scratch = (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-pin-"));
  try {
    put(root, { "kaal/league.md": TRUNK, ...files });
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
const drawingAt = (root, task) =>
  join(root, "architecture", task, "drawing.md");
const readAt = (root, task) => readFileSync(drawingAt(root, task), "utf8");

/** A `reviews:` block put beside `traces:` in the same frontmatter. */
const withReviews = (text, line) =>
  text.replace(
    /^---\n([\s\S]*?)\n---\n/,
    (_, inner) => `---\n${inner}\nreviews:\n  ${line}\n---\n`,
  );

/**
 * A tree whose drawing pins a criteria region that has since moved, with
 * `review` recorded beside the pin where one is given, keyed by the pin it
 * is about. Beside it and never on it: a trace's value is a comma separated
 * list and a reason wants commas, and two pins in the league's own tree are
 * lists of four. `review-needed` is never written at all, because it is what
 * a sha comparison says and a written one is a claim nobody checked, so a
 * tree that owes a reading is a tree with no block in it.
 *
 * Neither sha is written by hand. The fixture pins the text as it will
 * stand, reads that sha back off the pin the tool wrote, then pins the text
 * as it stood and moves it forward again, so `SHA` in a review is the sha
 * the region has now and the tool computed both. A sha computed in a test is
 * a second opinion about what a region is, and the tool's is the one every
 * wall reads.
 */
const moved =
  (review = "") =>
  (fn) =>
    scratch(
      {
        "requirements/alpha/requirement.md": requirement("alpha"),
        "architecture/alpha/drawing.md": drawing("alpha", "alpha"),
      },
      (root) => {
        const ahead = requirement("alpha", "\n1. It moved.\n");
        put(root, { "requirements/alpha/requirement.md": ahead });
        kaal("traces", root, "--write");
        const now = readAt(root, "alpha").match(/alpha@([0-9a-f]{64})/)?.[1];
        put(root, {
          "requirements/alpha/requirement.md": requirement("alpha"),
        });
        const w = kaal("traces", root, "--write");
        const pinned = readAt(root, "alpha");
        assert.match(
          pinned,
          /alpha@[0-9a-f]{64}/,
          `the fixture never got a pin: ${said(w)}`,
        );
        assert.ok(now, "the fixture never learned the sha the text will have");
        put(root, { "requirements/alpha/requirement.md": ahead });
        if (review)
          writeFileSync(
            drawingAt(root, "alpha"),
            withReviews(
              pinned,
              `requirement/alpha: ${review.replace("SHA", now)}`,
            ),
          );
        return fn(root);
      },
    );

test("1. a pin carries a review state, and one written without a state reads current", () => {
  scratch(
    {
      "requirements/alpha/requirement.md": requirement("alpha"),
      "architecture/alpha/drawing.md": drawing("alpha", "alpha"),
    },
    (root) => {
      kaal("traces", root, "--write");
      const r = kaal("traces", root);
      notUsage(said(r));
      assert.equal(r.status, 0, `a matching pin found: ${said(r)}`);
      assert.match(
        said(r),
        /\bcurrent\b/,
        `a pin with no state does not read current: ${said(r)}`,
      );
    },
  );
  // The four words are the four: a state the league does not know is a
  // finding naming it, so a typo is never silently a fifth state.
  moved("reviewd@SHA by Kai: a word the table does not hold")((root) => {
    const r = kaal("traces", root);
    assert.equal(r.status, 1, `an unknown state passed: ${said(r)}`);
    assert.match(said(r), /reviewd/, `the state is not named: ${said(r)}`);
  });
});

test("2. a moved pin is review-needed and not a failure, and a name resolving to nothing still is", () => {
  moved()((root) => {
    const r = kaal("traces", root);
    const out = said(r);
    notUsage(out);
    // The whole point: a tree mid handoff answers rather than refusing.
    assert.equal(r.status, 0, `a review-needed pin still refuses: ${out}`);
    assert.match(out, /alpha/, `the name is not reported: ${out}`);
    assert.match(out, /requirement/, `the kind is not reported: ${out}`);
    assert.match(out, /review-needed/, `the state is not reported: ${out}`);
  });
  scratch(
    {
      "requirements/alpha/requirement.md": requirement("alpha"),
      "architecture/alpha/drawing.md": drawing("alpha", "ghost"),
    },
    (root) => {
      const r = kaal("traces", root);
      notUsage(said(r));
      assert.equal(r.status, 1, `an unresolvable name passed: ${said(r)}`);
    },
  );
  moved()((root) => {
    put(root, { "architecture/beta/drawing.md": drawing("beta", "ghost") });
    const r = kaal("traces", root);
    const out = said(r);
    assert.equal(r.status, 1, `a tree with both passed: ${out}`);
    assert.match(out, /review-needed/, `the review is not reported: ${out}`);
    assert.match(out, /ghost/, `the missing name is not reported: ${out}`);
  });
});

test("3. leaving review-needed names who and why, and one that does not is a finding", () => {
  for (const state of ["reviewed-no-impact", "updated"])
    moved(`${state}@SHA by Kai: the criterion that moved is not this seam's`)(
      (root) => {
        const r = kaal("traces", root);
        notUsage(said(r));
        assert.equal(
          r.status,
          0,
          `${state} with who and why found: ${said(r)}`,
        );
      },
    );
  for (const [what, tail, wants] of [
    ["neither", "reviewed-no-impact@SHA", /who|why/i],
    ["no reason", "reviewed-no-impact@SHA by Kai", /why|reason/i],
    [
      "no person",
      "reviewed-no-impact@SHA: it does not touch this seam",
      /who|person/i,
    ],
  ])
    moved(tail)((root) => {
      const r = kaal("traces", root);
      const out = said(r);
      notUsage(out);
      assert.equal(r.status, 1, `${what}: a bare clearance passed: ${out}`);
      assert.match(
        out,
        wants,
        `${what}: it does not say what is missing: ${out}`,
      );
    });
});

test("4. traces --write never clears a review, and says how many it left", () => {
  moved()((root) => {
    // A second task with a bare pin, so this run has real work to do and the
    // untouched review is a fact about restraint rather than about idleness.
    put(root, {
      "requirements/beta/requirement.md": requirement("beta"),
      "architecture/beta/drawing.md": drawing("beta", "beta"),
    });
    const before = readAt(root, "alpha");
    const r = kaal("traces", root, "--write");
    const out = said(r);
    notUsage(out);
    assert.match(
      readAt(root, "beta"),
      /beta@[0-9a-f]{64}/,
      `--write wrote no pin: ${readAt(root, "beta")}`,
    );
    assert.equal(
      readAt(root, "alpha"),
      before,
      "--write cleared a review that nobody had read",
    );
    assert.match(out, /\b1\b/, `it does not say how many it left: ${out}`);
  });
});

test("5. a task carrying an unreviewed pin is not delivered", () => {
  // The report that judges a task reads the pin the way it reads a stale run
  // record: the work is not done while somebody still owes a reading.
  moved()((root) => {
    const r = kaal("runs", root);
    const out = said(r);
    notUsage(out);
    assert.match(out, /alpha/, `the report does not name the task: ${out}`);
    assert.match(
      out,
      /review|pin/i,
      `an unreviewed pin is invisible where the task is judged: ${out}`,
    );
  });
});

test("6. the board says how many pins are in each state", () => {
  const gates = JSON.parse(
    readFileSync(join(ROOT, "kaal.config.json"), "utf8"),
  ).gates;
  const gate = gates.find((g) => /traces/.test(g.command ?? ""));
  assert.ok(gate, `no gate runs traces: ${gates.map((g) => g.name)}`);
  // On a tree this test built, never on the league's own: the league is all
  // one state today, and its counts move whenever anything else lands.
  const r = moved()((root) => kaal("traces", root));
  const out = said(r);
  notUsage(out);
  assert.equal(r.status, 0, `a tree with one review does not answer: ${out}`);
  for (const state of [
    "current",
    "review-needed",
    "reviewed-no-impact",
    "updated",
  ])
    assert.match(
      out,
      new RegExp(`\\b${state}\\b`),
      `the count for ${state} is not on the line: ${out}`,
    );
});
