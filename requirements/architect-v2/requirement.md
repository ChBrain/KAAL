# Requirement: architect-v2

_Written in analyse mode. The ask is a stack: the first ten retros on the
architect skill, read as section 6 of the analyse skill says. One Lacked
item recurs four times (retros 1, 2, 3, 7): the drawing's shape is checked
by reading, never by a wall._

## Goal

Whoever uses the architect skill wants a drawing's shape held by a wall the
way a skill's shape is: sections in order, as many labelled edges as seams,
as many contract tests as seams, every criterion in the strategy table, and
a home under the task that owns it; and wants the skill's text to fix the
formats first and to say where the human's approval is recorded. They will
know when `kaal drawings` refuses each broken shape, the board runs it, the
skill's text says the two things, a fixture reproduces the edge count, and
the ten retros are archived.

## Assumptions

- A drawing lives at `architecture/<task>/drawing.md` with
  `contracts.test.mjs` beside it, and its task is `requirements/<task>/`;
  a drawing with no such requirement is an orphan (retro 3 Learned).
- The sections are the template's, in its order: Structure, Seams, Fixed and
  free, Decisions, Test strategy, Handoff.
- Seams are the numbered items under Seams; edges are the labelled arrows in
  the mermaid block; contract tests are the `test("N.` calls in the file.
- Every criterion is a numbered item under the requirement's Acceptance
  criteria, and it is served when its number appears in the strategy
  table's first column (a row may list several).

## Constraints

- What the retros liked stays: one seam one test, the decision record's four
  lines, the stand-in rule (Liked, retros 1, 2, 8, 9).
- A wall reads text and never runs a drawing's tests to judge its shape;
  the contracts wall already runs them (rules; retro 6 Learned).
- No dependency beyond node; no dash; the skill under its budget (rules).

## Acceptance criteria

1. `kaal drawings [root]` exits 1 with one finding per broken rule, naming
   the drawing and the rule, on each fixture root under `fixtures/`:
   `sections` (out of order), `edges` (fewer edges than seams), `tests`
   (fewer contract tests than seams), `strategy` (a criterion not in the
   table), `orphan` (no requirement for the task).
2. `kaal drawings` exits 0 on the league's own tree, and the gates list in
   `kaal.config.json` carries a wall that runs it.
3. The skill's Fixed and free rule says the formats the developer's tests
   will name (a finding's line, a summary) are fixed first (retro 1
   Learned).
4. The skill's Hand off section names `human.gates` in `kaal.config.json`
   as where the approval is recorded, and says that a drawing and its build
   in one pull request are approved by that one merge (retro 7 Learned,
   retro 9 Lacked).
5. A fixture `fixtures/edge-count/` holds an `ask.md` (a requirement with
   three criteria) and an `expect.md` requiring three numbered seams, three
   labelled edges, and three contract tests.
6. The ten retros named below are under `retros/archive/` and none remains
   in `retros/`.

## Open questions

- A home for the runner's paste block in a pull request (retro 2 Lacked).
- Hosts in a reach declaration (retro 6 Lacked).
- A second platform in the `ci` matrix (retro 10 Lacked and Longed for;
  also the code skill's tenth retro).
- A reader that treats a refusal as a pass when the expectation asked for
  one (retro 8 Longed for).
- The human's approval as a recorded act in the tree rather than a merge
  that stands for it (retro 3 Longed for).

## Retros consumed

`retros/archive/2026-09-04-architect-first-use.md`,
`retros/archive/2026-09-04-architect-second-use.md`,
`retros/archive/2026-09-04-architect-third-use.md`,
`retros/archive/2026-09-04-architect-fourth-use.md`,
`retros/archive/2026-09-04-architect-fifth-use.md`,
`retros/archive/2026-09-04-architect-sixth-use.md`,
`retros/archive/2026-09-04-architect-seventh-use.md`,
`retros/archive/2026-09-04-architect-eighth-use.md`,
`retros/archive/2026-09-04-architect-ninth-use.md`,
`retros/archive/2026-09-05-architect-tenth-use.md`.

## Handoff

- Task: architect-v2
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/architect-v2/acceptance.test.mjs`;
  four red; criteria 5 and 6 green by this change (the fixture and the
  archive are the analyst's acts); no stand-in, the build's
  green is the proof
- Tests: `acceptance.test.mjs`, beside this file; fixture roots under
  `fixtures/`
- Open questions: 5, listed above
- Blocked on: nothing
- Supersedes: nothing
- Status: open
