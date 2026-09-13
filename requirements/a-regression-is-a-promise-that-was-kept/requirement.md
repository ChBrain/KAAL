---
traces:
  parent: a-plan-picks-its-suites@be41213713264fba7f983c54c52d569281b573baad418fd3026219bf16b13caf
  supersedes: a-plan-picks-its-suites@be41213713264fba7f983c54c52d569281b573baad418fd3026219bf16b13caf
---

# Requirement: a-regression-is-a-promise-that-was-kept

## Goal

The regression wall is red when something that used to work has stopped, and
at no other time, so a reader of the board can act on it instead of learning
to read past it.

## What the runs said

- Two walls answer opposite things about one file. On this tree today, `node
bin/kaal.mjs regression .` answers `regression: case:
requirements/a-dependency-update-lands-on-main/acceptance.test.mjs is red`
  and exits 1, while `node bin/kaal.mjs acceptance
requirements/a-dependency-update-lands-on-main/acceptance.test.mjs` answers
  `green: 1 requirement(s), 0 failing` and exits 0. The same case, the same
  tree, the same minute.
- The tree already knows which of the two is right. That task is open and its
  suite has no run on record, so the acceptance wall reads it as an open
  task's red, which `AGENTS.md` says is reported and never a failure.
- The regression wall does not judge at all. `runCases` hands the paths to
  the runner and reads an exit code, and `bin/kaal.mjs regression` prints
  every path that came back red. Nothing in that path opens a requirement or
  a record.
- It fires on every task in flight. Every requirement stated since the
  regression gate landed has turned that wall red on its own branch: item 4's,
  this release's Dependabot task, and the wall's own third-answer task. Four
  pull requests in one day each carried a red wall that nobody was going to
  act on.
- The four verdicts already exist and already say this. `regressed` is red now
  with a record that passed; `not delivered` is a task with no record. They
  are computed once, by the judged runner, for the acceptance and contracts
  walls.
- The question was asked and never answered. `a-plan-picks-its-suites` open
  question 4 is what happens when a case the regression plan reaches is red
  and the seat that owns it is not the seat promoting, and its drawing hands
  that one back as the analyst's.

## Assumptions

- A regression is a promise that used to hold and stopped, which is what the
  plan page says in its own words. A case for a task nobody has delivered has
  never held, so its red is news about work in progress and not about a
  promise.
- The two walls must not disagree about one case. They run the same file on
  the same tree, so a case cannot be a regression to one and an open task's
  red to the other; whichever answer is right, one of them is reading
  something the other should read.
- The record is what says a promise was made. `a-task-is-delivered-by-its-run`
  already fixes that a record carries the sha of what it ran, so a record
  whose suite moved is no record, and the same rule decides this without a
  second definition.
- This does not weaken the promotion. A wall that stops reporting a thing that
  is not a regression refuses less noise and not less work: what the promotion
  demands of a red case is untouched, and a genuinely regressed case is still
  red on every board that runs.

## Constraints

- The selection does not move. `a-plan-picks-its-suites` criterion 4 fixes
  that the gate runs what the plan reaches and nothing else, and this task
  changes what the wall says about what it ran, never which cases it runs.
- One definition of the four verdicts. They are computed by the judged runner
  today and a second copy in the regression path would be the drift this
  release has already met twice.
- Deterministic and offline, like every wall.
- No case is written, edited or moved for this.

## Acceptance criteria

1. A case the regression plan reaches whose task has no run on record is not
   reported as a regression, whatever that case does when it runs.
2. A case whose task has a run on record and now fails is reported red, naming
   the case by path.
3. The two walls do not disagree about one case: on a tree where the
   acceptance wall reads a task as not delivered, the regression wall does not
   read that task's case as a regression, and where the acceptance wall reads
   one as regressed, the regression wall does too.
4. The answer says how many cases it ran and how many it did not judge, so a
   reader sees what was passed over rather than having to count it.

## Open questions

- Should a case with no record be run at all? Running it costs the time and
  answers a question nobody asked; not running it means the wall's count of
  what it ran is smaller than what the plan reaches, and a reader comparing
  the two numbers needs the difference explained. Criterion 4 asks for both
  numbers either way.
- What does the wall do with a case whose record is stale? A record whose
  suite moved is no record, so the task reads as not delivered and criterion 1
  covers it. Whether that is the right answer for regression specifically, or
  whether a moved suite deserves a louder line than silence, is a judgement
  this page does not make.
- Does the promotion still see a red case that this wall passes over? It does,
  because the acceptance wall runs the same file and reports it there, and the
  promotion refuses on the verdict rather than on this wall. Worth stating
  because the fear this criterion raises is exactly that something stops being
  seen.
- Should the regression plan reach a case whose task is open at all? A
  selection computed from delivered requirements would never hold one, which
  is the shape placed for 0.0.3, and this task is the smaller answer that
  works before that exists.

## Handoff

- Task: a-regression-is-a-promise-that-was-kept
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=60000
requirements/a-regression-is-a-promise-that-was-kept/acceptance.test.mjs`, 13
  September 2026, 3 of 4 failing, and each of the three failing on its own
- Green before the build: criterion 2, and it is a guard rather than a
  criterion testing nothing. The wall reports every red case today, so a
  genuine regression is already named; this task narrows what it reports and
  criterion 2 is what keeps the narrowing from going too far
- Stand-in green: all four, discarded from file copies. It found that
  `a-plan-picks-its-suites` criteria 4 and 6 go red under this change: their
  fixture carries no run record, so every red case in it was
  indistinguishable from a regression and the assertion was written against
  that accident. The fixture now carries a record per task and passes both
  before this change and after, which is the same under-specified shape this
  release has met four times. Reading only the criteria said this was not a
  supersede; the seat rule refused the diff and named the reason, and the
  claim that moves is the one the proof holds
- Tests: `acceptance.test.mjs`, beside this file, on scratch trees, because a
  record and a requirement have to be real for the verdicts to read them
- Open questions: 4, listed above
- Blocked on: nothing
- Unblocks: item 13 of `plan/0.0.2.md`, which wants a board whose red means
  something, and every task stated between here and the cut, each of which
  reds this wall on its own branch today
- Supersedes: `a-plan-picks-its-suites`. The claim that moves is not in its
  criteria and is in its proof, which is what is actually held: criteria 4 and
  6 assert that a red case the regression plan reaches refuses the wall, and
  after this only a case whose task has a run on record does. Neither
  criterion says it in words, which is how this read as a fixture correction
  until the seat rule refused the diff and was right to: a test is what is
  held and a criterion is what somebody chose to say. What permits it is that
  task's own plan page, which says a regression is a promise that used to hold
  and stopped, and a case for a task nobody has delivered never held. Which
  cases the gate runs is untouched, and that is what its criterion 4 fixes
- People: none
