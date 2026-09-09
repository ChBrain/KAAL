---
traces:
  supersedes: status-v1@ac0e9a9e1379f649391920f737bfd76d6cc599c2dc1f98c7010f014132c193ed, status-v2@46430499e3ddd4d43a1c228869736792d62a9d4fbe79e1ce1e5d87f480d157df
---

# Requirement: a-task-is-delivered-by-its-run

_Ask, from Kai, correcting a category mistake: "coder claims code fulfills
test, tester proofs it! (test strategy, test plans, test suites and test
runs!!!) while test cases are untouched and requirements are untouched. if
they're delivered is a deterministic report running in the correct scoped
lane." And the rule under it: "always same: downstream answers."_

## Goal

Whoever reads the board wants to know whether a task was delivered without
anybody having written down that it was, and whoever builds wants to stop
editing the analyst's page to say so; they will know it by every requirement
losing its status line, by a run recorded where the tester works, and by the
board answering delivered, not delivered, regressed or nothing ran from the
run and the record alone.

## What the runs said

- 59 requirements carry a hand written `- Status:` line, 57 closed and 2
  open, and `bin/lib/acceptance.mjs` is the only reader of it.
- That one field decides four verdicts: closed with a red test is a failure,
  open with a red test is a report, closed and green is fine, and open and
  green is `FAIL open and all green: close it`. Three of the four are
  computable from the run. The one that is not is the first, because a red
  suite is a regression if it ever passed and an unbuilt task if it never
  did, and the current run cannot tell those apart.
- Nothing in this tree records that a suite ever passed. `tests/` holds a
  strategy, three plans and 22 unit suites, and no run. The ask names runs as
  the fourth thing under the strategy and they are the piece that is missing.
- The last verdict is what forces a build to write on the analyst's page. A
  build that lands green and cannot write `- Status: closed` turns the board
  red by construction, which is the whole reason the lane guard's drawing
  invented an exemption for it.
- Measured against the tree today: 57 of 59 requirements have a green
  acceptance run, 53 of 59 are answered by a drawing, and every one of the 53
  drawings carries contract tests. Five closed requirements have no drawing
  at all. Those are the numbers a report would print and nobody declares any
  of them.

## Assumptions

- A run is an artefact and lives where the tester works, under `tests/runs/`.
  It says which task, which suite, when, the sha of the suite it ran, and
  what passed and failed. Without a record the board can only ask whether a
  thing passes now, which is a live re-run and not evidence.
- The coder claims and the tester proves, so recording a run is not the
  build's act. A build lands green code and the task reads not delivered
  until a run is recorded, which is the ask read literally and is the
  honest state in between.
- A wall never writes. Recording is a command with a flag, the way pins are
  written, and it records only what is green when it runs.
- A record whose suite has changed since is not evidence about the suite as
  it stands. A stale record proves nothing and must not turn a red run into
  a regression, because the thing that passed is not the thing that failed.
- Not delivered is not a failure. A task specified and not yet built is the
  normal state of work in progress, and the board reports it the way it
  reports an open task today.
- The status line goes from every page rather than being left and ignored.
  A field nothing reads is a field somebody will maintain and believe.

## Constraints

- The exit vocabulary holds: 0 an answer, 1 findings, 2 the question is not
  this tree's.
- The board's other eleven walls are untouched, and the acceptance and
  contracts walls keep their commands and their globs.
- Nothing here reaches a network or a model. A run record is written by the
  tree's own runner and read as text.
- The skill rules apply to any skill text this touches.

## Acceptance criteria

1. No `requirement.md` in this tree carries a `- Status:` line, and no wall
   reads one; a tree whose pages carry none is not a finding.
2. A run record under `tests/runs/` names its task, the suite it ran, when it
   ran, the sha of that suite, and its passing and failing counts.
3. `kaal acceptance` reports one of delivered, not delivered, regressed or
   nothing ran per task, decided from the run it just made and the records
   it reads, and never from a page.
4. Regressed and nothing ran are failures and exit 1; not delivered is
   reported and does not fail the wall.
5. A run is recorded by a command with a `--write` flag, which records only
   what is green when it runs; no wall writes a record.
6. A record whose suite sha no longer matches the suite counts as no record:
   the task reads not delivered rather than regressed, and the report says
   the record is stale.
7. On this tree the board answers what it answers today, with no status line
   anywhere: the same tasks failing and the same tasks reported.

## Open questions

- Does the contracts wall get the same four verdicts, or does a drawing's
  delivery follow its requirement's? A seam proved and a criterion proved are
  different claims and the ask says downstream answers, which suggests the
  drawing has its own.
- Where does a run record for a contract suite or a unit suite live? The same
  directory, or one per plan, since the plans are already one per wall.
- Should recording be part of the release rather than a command anybody runs?
  A run recorded on a laptop and a run recorded by the board are different
  evidence and the record does not currently say which.
- What happens to the two open tasks, `push-v1` and `a-diff-carries-one-seat`?
  Under this they are not delivered, which is true and is a weaker statement
  than open, and nothing marks that one is stalled and the other is in flight.

## Handoff

- Task: a-task-is-delivered-by-its-run
- Criteria: 7; tests: 7 (equal)
- Red run: `node --test requirements/a-task-is-delivered-by-its-run/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file, with fixture roots for a
  task delivered, not delivered, regressed, stale and never run
- Open questions: 4, listed above
- Blocked on: nothing
- Unblocks: the lane guard, whose drawing needed an exemption only because a
  build had to write on the analyst's page; and the coverage report, which is
  a second reading of the same records

## Build

- Built: all seven criteria, on
  `requirement/a-task-is-delivered-by-its-run-build`
- Landed: `bin/lib/runs.mjs`, new; both walls rewired off the field, with
  `readStatus`, `statusForDrawing` and `mustClose` gone; `kaal runs [root]
[--write]` and its applicability; `- Status:` gone from 61 requirement
  pages and from the analyst's template; the `acceptance` and `judged` unit
  suites rewritten; `SURFACE.md`
- Proved: `node bin/kaal.mjs gates` green on twelve walls, seven criteria,
  five seams, eleven units
- Found by a fixture that would not behave: the runner reports a file
  declaring no test at all as one passing test, named for the file itself.
  So a suite whose tests were all deleted reads as green, and the old wall's
  guard against a closed task measuring nothing could not catch it either,
  because it asked for `pass > 0` and the count was one. The wall now reads
  the single passing line's name against the file it ran and calls that
  nothing having run. The fixture named `nothing-ran` did not run nothing
  until this was fixed
- Superseded beyond what was declared, and both found by measuring first:
  `status-v1`'s first two criteria are the field and the four verdicts read
  from it, rewritten to ask the report instead of the page; and
  `a-wall-reads-one-format`'s third contract called `judge` with a status,
  where its claim, that silence is not success, now reads `nothing ran`
- The board says why. A task not delivered because its record is stale and
  one not delivered because nobody has recorded it are the same word and
  different work, so the verdict's reason is printed beside it
- Red on Windows and nowhere else, caught by CI: the empty suite reading
  compared the runner's name for the file against the path it was given, and
  the two platforms do not write a path the same way. It compares the last
  segment alone now. That is the third time a path crossing a boundary has
  cost this league a red on one runtime only, and the first two are in
  retros saying the same thing
- Owed next, and it is not this diff's: every task reads not delivered until
  a run is recorded, because the coder has claimed and the tester has not yet
  proved. The first `kaal runs --write` belongs in the tester's own lane
- Class: surface moved, tool moved (`kaal class . --against origin/main`,
  run last, after the final edit)

- Unblocks: the lane guard, whose drawing needed an exemption only because a
  build had to write on the analyst's page; and the coverage report, which is
  a second reading of the same records
- Supersedes: `status-v1` and `status-v2`. The first's opening two criteria fix the written line and
  the four verdicts read from it, and the second's first fixes the same for
  the contracts wall. Both were right about the question and answered it
  with a field, which is the category mistake the ask names: whether a thing
  was delivered is a report and not a declaration
- People: none
