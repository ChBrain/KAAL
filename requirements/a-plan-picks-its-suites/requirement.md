---
traces:
  parent: a-suite-names-its-cases@26e53d7fea7a4b49cc4bfff85796fff717741026e66dd3a58500cea0fd9b9a18
  supersedes: nothing
---

# Requirement: a-plan-picks-its-suites

## Goal

The tester can change what is re-run to protect `main` without a diff in
anybody else's lane, and a reader can see what that protection covers by
opening one page.

## What the runs said

- The selection is in the governance lane today. `kaal.config.json` holds
  fourteen gates and three of them name test files by glob:
  `requirements/*/acceptance.test.mjs`, `architecture/*/contracts.test.mjs`,
  and `bin/*.test.mjs bin/lib/*.test.mjs skills/*/scripts/*.test.mjs`. The
  seat that owns the method cannot change what is re-run without a diff in a
  lane that is nobody's seat.
- Each plan reaches exactly one suite. `kaal traces` answers `plans reach
acceptance: 1 suite(s), 66 case(s); contracts: 1 suite(s), 60 case(s);
units: 1 suite(s), 26 case(s)`. The many to many the suite layer built is
  declared and unused: no suite is named by two plans and no plan names two
  suites.
- Every case in the three suites is verification. The two eval records in the
  tree sit under `evals/` and no suite names a path there; the strategy page
  says validation is never a wall because it cannot be settled the same way
  twice.
- A plan is about one wall and a wall has one plan, and the board enforces
  both. A plan with no `- Wall:` line answers `carries no \`- Wall:\` line, so
  it is a plan about nothing`, a plan naming a wall no gate holds answers
`is about the wall X, which no gate in kaal.config.json holds`, and two
plans about one wall answer `is the wall of 2 plans`.
- The promotion into `main` already refuses a red wall and a task whose
  verdict is `regressed`, `nothing ran` or `not delivered`. What it does not
  do is read any page that says which cases matter more than others.

## Assumptions

- What protects `main` is a selection and not all of it. The asker's words are
  that the very same verification cases can be used to harden CI, which is a
  choice of which, and a selection that is everything is not a selection.
- The tester owns that choice. Selecting and grouping what is re-run is the
  method and the method is the tester's, which is the same sentence the suite
  layer was built on.
- Verification only, and the tree already draws that line. A case that is a
  model's reading cannot be re-run to the same answer twice, so it can be
  evidence and never a gate; the strategy page says so and this task does not
  reopen it.
- The regression plan names suites other plans also name. That is the whole
  use of the many to many, which has been declared since the suite layer and
  has never had an instance.
- This does not narrow what a promotion refuses. `a-promotion-names-what-it-
refuses` criterion 5 says no wall may stand red on the promotion to `main`,
  and a selection that excused a red case outside it would contradict a closed
  criterion. What this task moves is who declares the selection, not how much
  of it a promotion demands.

## Constraints

- The selection lives in the tester's tree and nowhere else. From the delta:
  a change to what is re-run must not need a diff in the governance lane.
- Deterministic and offline, like every other wall.
- No case is written or copied for this. A regression plan picks cases that
  exist, by picking suites that name them, and a plan that holds a case of its
  own has stopped being a selection.
- A suite named twice is not a finding. From `a-suite-names-its-cases`
  criterion 5, which this task is the first instance of.

## Acceptance criteria

1. `tests/plans/regression.md` is a plan of the same shape as the others and
   names the suites it picks. A regression plan naming no suite is a finding
   saying so, in the same words a plan naming no case already answers.
2. A suite named by the regression plan and by another plan is a finding in
   neither direction, and the board's counts say how far each of the two
   reaches without either subtracting from the other.
3. The board answers which cases the regression plan reaches, each by its
   path, so a reader sees what is protected without opening the plan, its
   suites and the cases in turn.
4. A gate runs what the regression plan reaches and nothing else: a case one
   of its suites names is run, a case no suite of its names is not, and the
   answer says how many cases it ran. The plan is what the gate reads, so the
   two can never disagree about the selection.
5. What the regression plan reaches is verification only. A suite it names
   whose cases include a path under `evals/` is a finding naming the path,
   whatever else is true of it.
6. What is re-run to protect `main` changes with a diff in `tests/` alone. A
   tree whose regression plan names one more suite protects one more suite's
   cases, with no change to `kaal.config.json` and none to any workflow.

## Open questions

- Does the regression plan name a wall, and if so which? Every plan is about
  one wall and every wall has one plan, both enforced. A `regression` gate on
  the board would re-run cases their own walls have already run, on every pull
  request; a plan whose wall is read only at a promotion is a plan about a
  wall the board does not hold, which the trace wall calls a finding today.
  This is the tension this task carries and it is the architect's to resolve.
- Is the regression selection one plan or one per target? `release` and `main`
  refuse different things already, and a selection that protects `main` may
  not be the selection a branch is measured against.
- Does a case belong to the regression plan or does a suite? Naming suites
  keeps the plan short and takes whatever the suite later gains; naming cases
  makes the protection exact and goes stale the day a suite grows.
- What happens when a case the regression plan reaches is red and the seat
  that owns it is not the seat promoting? It is a block, and whose it is may
  need saying here rather than being left to the general rule.
- How often does the regression gate run? Every case it reaches has its own
  wall already, so on every pull request it is a second run of work that has
  just been done. On a push to a target, or on a schedule, it is a guard that
  a target stayed green rather than a tax on every branch. The asker's words
  are that it is tied to CI, which does not say which.

## Handoff

- Task: a-plan-picks-its-suites
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test requirements/a-plan-picks-its-suites/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file, on scratch trees, because
  the league's own `tests/` is what this task changes and a case that read it
  would be reading the answer it is asking for
- Open questions: 4, listed above
- Blocked on: nothing. The first open question is the architect's and it does
  not block this page
- Unblocks: the version, which is what a release is cut against, and the cut
- Supersedes: nothing
- People: none
