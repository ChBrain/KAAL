# Requirement: analyse-v2

_Written in analyse mode. The ask is a stack: the first ten retros on the
analyse skill, read as section 6 of the skill says. Recurring Lacked items
are criteria; a Lacked that names a defect is a criterion alone; Longed for
items are open questions; Learned items that changed how the skill reads are
criteria on its text; Liked items are constraints._

## Goal

Whoever uses the analyse skill wants its next version to do what ten retros
say it did not: carry the task's status and who closes it, refuse a test
that is green on nothing, run its red with a timeout and off the league's
own tree, say in the handoff which criteria were already met or need a
person, and name what it supersedes; they will know when the skill's text
and template say so, a fixture reproduces the vacuous loop, and the ten
retros are archived.

## Assumptions

- The skill's text is the surface: a criterion on the text is met when the
  sentence is there, in the section named, and a reader of that section
  would act on it.
- The requirement template is part of the skill and changes with it.
- A retro is consumed by this requirement naming its file; the ten files
  move to `retros/archive/` in the same change.

## Constraints

- What the retros liked stays: the stand-in rule, one criterion one test,
  the count script, the retro after every use (Liked, retros 1, 3, 5, 9).
- The skill stays under its line budget and the standard's shape (rules).
- No vendor, no dash, nothing that names a runtime (rules).

## Acceptance criteria

1. The requirement template's Handoff carries `Status:`, `Blocked on:` and
   `Supersedes:` lines, and the skill's Hand off section says the analyst
   owns both ends of the status: open at handoff, closed when the tests are
   green (retro 3 Learned, retro 4 Lacked, retro 3 Lacked).
2. The skill's proof rules say that a test which iterates first asserts
   there is something to iterate, because a loop over nothing is green
   (retro 5 Learned and Longed for).
3. The skill's red-run rule names a timeout for the run, and says a test
   that drives the league's own commands on the league's own tree runs on a
   fixture root or guards on the runner's marker (retro 10 Lacked and
   Learned, a defect; retro 2 Learned).
4. The skill's red-run rule admits a partial red: the handoff names the
   criteria already met before any build and the criteria that need a
   person's step, so the board can tell waiting on a person from waiting on
   a developer (retro 6 Lacked, retro 3 Lacked).
5. A fixture `fixtures/vacuous-loop/` holds an `ask.md` whose natural test
   iterates over something that may be empty, and an `expect.md` that
   requires the test to assert the count first.
6. The ten retros named below are under `retros/archive/` and none of them
   remains in `retros/`.

## Open questions

- Should a script read a test file for a loop with no count assertion before
  it, as a candidate for the Script rung? (retro 5 Longed for)
- Division names for the standings table, instead of the rung names
  (retro 5 Lacked; also the code skill's sixth retro).
- A wall that notices a merged pull request whose commits are not on main
  is a repository question, not a tree question (retro 7 Lacked).
- Who may sign a waiver (retro 9 Lacked).
- The three human gates read by the seats that hold them (retro 9 Longed
  for).
- The board saying, when every wall fails the same way, that the runner and
  not the tree is the likely cause (retro 10 Longed for).

## Retros consumed

`retros/archive/2026-09-04-analyse-first-use.md`,
`retros/archive/2026-09-04-analyse-second-use.md`,
`retros/archive/2026-09-04-analyse-third-use.md`,
`retros/archive/2026-09-04-analyse-fourth-use.md`,
`retros/archive/2026-09-04-analyse-fifth-use.md`,
`retros/archive/2026-09-04-analyse-sixth-use.md`,
`retros/archive/2026-09-04-analyse-seventh-use.md`,
`retros/archive/2026-09-04-analyse-eighth-use.md`,
`retros/archive/2026-09-04-analyse-ninth-use.md`,
`retros/archive/2026-09-05-analyse-tenth-use.md`.

## Handoff

- Task: analyse-v2
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/analyse-v2/acceptance.test.mjs`;
  four red; criteria 5 and 6 green by this change (the fixture and the
  archive are the analyst's acts); no stand-in, the criteria are text and the build's green is the
  proof
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 6, listed above
- Blocked on: nothing
- Supersedes: nothing
- Status: open
