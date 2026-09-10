// Units for the lane guard's matcher, beside the code they test, which is
// where the seat table says a unit case belongs. The four other parts of this
// module are seams and the contracts drive them; the matcher is the one part
// with no seam of its own, and a wrong answer here decides whether a diff is
// refused, so it is the one part that needs a unit at all.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { matches, namesTask, proofs } from "./seats.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("one star stops at a separator and two stars do not", () => {
  assert.equal(matches("tests/plans/units.md", "tests/plans/*.md"), true);
  // The reason `shared` says `tests/plans/*.md` and not `tests/plans/**`: a
  // page directly under the plans is shared and a tree below it is not.
  assert.equal(matches("tests/plans/deep/units.md", "tests/plans/*.md"), false);
  assert.equal(matches("tests/plans/deep/units.md", "tests/plans/**"), true);
  assert.equal(
    matches("requirements/x/requirement.md", "requirements/**"),
    true,
  );
  // And a prefix is not a match for the tree under it: `requirements/**` is
  // about what is inside, and the directory itself is nobody's file.
  assert.equal(matches("requirements", "requirements/**"), false);
});

test("two stars and a separator match nothing as well as any number of segments", () => {
  assert.equal(matches("seats.test.mjs", "**/*.test.mjs"), true);
  assert.equal(matches("bin/lib/seats.test.mjs", "**/*.test.mjs"), true);
  // Without swallowing the separator this would read as `.*x` and find the
  // pattern inside a longer segment, which is the quiet way a guard lets a
  // path through: `notes.md` is not `**/s.md`.
  assert.equal(matches("notes.md", "**/s.md"), false);
});

test("a path is matched whole, and a pattern's dot is a dot", () => {
  assert.equal(matches("AGENTS.md", "AGENTS.md"), true);
  assert.equal(matches("AGENTSXmd", "AGENTS.md"), false);
  assert.equal(matches("docs/AGENTS.md", "AGENTS.md"), false);
  assert.equal(matches("AGENTS.md.bak", "AGENTS.md"), false);
});

test("every pattern this tree declares matches something it owns", () => {
  // Computed from the config rather than written down: a list in a test is
  // true on the day it is written and false on the day the tree moves.
  const cfg = JSON.parse(readFileSync(join(ROOT, "kaal.config.json"), "utf8"));
  const declared = [
    ...(cfg.seats ?? []).flatMap((s) => s.owns ?? []),
    ...(cfg.lanes ?? []).flatMap((l) => l.allows ?? []),
    ...(cfg.shared ?? []),
  ];
  assert.ok(declared.length >= 10, `only ${declared.length} paths declared`);
  for (const glob of declared) {
    // A pattern that matches nothing at all is a declaration nobody can use,
    // and the cheapest witness is the pattern's own literal prefix.
    const literal = glob.replace(/\*\*\/?/g, "x/").replace(/\*/g, "x");
    assert.equal(
      matches(literal, glob),
      true,
      `${glob} matches nothing, not even ${literal}`,
    );
  }
  // And every lane pattern matches a branch of its own shape.
  for (const lane of cfg.lanes ?? [])
    assert.equal(
      matches(lane.pattern.replace(/\*/g, "topic"), lane.pattern),
      true,
      `the lane ${lane.pattern} matches no branch`,
    );
});

test("a branch names a task when the topic is it, or it and a dash", () => {
  assert.equal(
    namesTask("requirement/a-tree-has-one-root", "a-tree-has-one-root"),
    true,
  );
  // Two diffs on one task need two branch names, so a topic carries what the
  // person added to tell them apart.
  assert.equal(
    namesTask("requirement/a-tree-has-one-root-amend", "a-tree-has-one-root"),
    true,
  );
  assert.equal(
    namesTask("build/a-tree-has-one-root-build", "a-tree-has-one-root"),
    true,
  );
  // The boundary is a dash and never a bare prefix: a shorter task must not
  // reach a longer one that begins with its name.
  assert.equal(namesTask("requirement/a-tree", "a-tree-has-one-root"), false);
  assert.equal(namesTask("requirement/a-treehouse", "a-tree"), false);
  assert.equal(namesTask("requirement/beta", "alpha"), false);
  // No branch names nothing, which is the detached case, and it excuses
  // nothing rather than everything.
  assert.equal(namesTask(null, "alpha"), false);
  assert.equal(namesTask("main", "alpha"), false);
});

test("a seat writing its own kind of proof on its own task is the job, and every other reading is a finding", () => {
  const analyst = { branch: "requirement/alpha", lane: { seat: "analyst" } };
  const architect = {
    branch: "architecture/alpha",
    lane: { seat: "architect" },
  };
  const developer = { branch: "build/alpha", lane: { seat: "developer" } };
  const own = "requirements/alpha/acceptance.test.mjs";
  const fixture = "requirements/alpha/fixtures/one/note.md";
  const contract = "architecture/alpha/contracts.test.mjs";
  // The analyst writes acceptance tests and a requirement's fixtures. This is
  // the case that blocked every new requirement in this league.
  assert.deepEqual(proofs(ROOT, [own, fixture], analyst).findings, []);
  assert.deepEqual(proofs(ROOT, [contract], architect).findings, []);
  // Another seat, same file: still the harm the ask named.
  assert.equal(proofs(ROOT, [own], developer).findings.length, 1);
  assert.equal(proofs(ROOT, [contract], analyst).findings.length, 1);
  assert.equal(proofs(ROOT, [own], architect).findings.length, 1);
  // The right seat on the wrong task, which is the other half, and it says
  // which task a supersede would have to name.
  const elsewhere = proofs(ROOT, [own], {
    branch: "requirement/beta",
    lane: { seat: "analyst" },
  }).findings;
  assert.equal(elsewhere.length, 1);
  assert.match(elsewhere[0], /supersedes alpha/);
  // And a caller that says nothing about the lane excuses nothing, which is
  // what the contract tests drive and what this wall did before it could ask.
  assert.equal(proofs(ROOT, [own]).findings.length, 1);
});
