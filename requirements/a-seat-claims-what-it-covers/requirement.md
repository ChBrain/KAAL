---
traces:
  supersedes: nothing
---

# Requirement: a-seat-claims-what-it-covers

_Ask, from Kai: "architect claims %of requirements covered, tester claims %of
requirements (functional and non functional (including architecture)) covered
and verified (test run), coder delivers to green, should be hard blocked on
red, operations here right now is just release packages.. so boring, but
needs comparable hard rules. always same: downstream answers."_

## Goal

Whoever reads the board wants to know how much of what was asked for each
seat has answered, without any seat writing a number down; they will know it
by a row per seat naming what it counts, what it counted, and what it did not
cover, computed from the tree and the records every time it is asked.

## What the runs said

- Every number the ask names is already computable and none of them is
  reported. Counted on this tree today: 61 requirements stated; 54 of 61
  answered by a drawing, which is 88 per cent; 59 of 61 with a fresh recorded
  run, which is 96 per cent; and 54 of 54 drawings carrying contract cases.
- The gaps are specific and nobody would find them by reading. Seven
  requirements have no drawing at all: `a-build-says-what-it-proved`,
  `a-diff-carries-one-seat`, `a-drawing-shows-its-ground`,
  `a-requirement-shows-its-work`, `skills-v1`,
  `the-board-runs-on-two-runtimes` and `the-publish-carries-a-token`. Five of
  those are closed work that shipped without a drawing, and the last is mine
  from four hours ago.
- The two without a recorded run are the two nobody has built, which the
  delivery report already says in different words.
- The board reports counts already, one per wall, as passing tests. What it
  has never reported is how much of the tree a wall looked at, which is the
  question the ask asks four times over.
- `kaal traces` holds the edge that answers the architect's number: a drawing
  declares the requirement it answers, and the trace wall reads it. `runs`
  holds the tester's. Neither needs a new source.

## Assumptions

- Every number is computed and none is declared. That is the same rule
  delivery just landed under, and for the same reason: a percentage a seat
  writes down is a claim nobody checks, and one the tool reads is a fact.
- A number alone is not a report. A row saying 88 per cent and not saying
  which seven are missing tells a reader they have a problem and not where,
  so the row names what it does not cover, up to a readable limit.
- The report does not fail. A coverage number is a fact about how far the
  work has got, not a promise anybody made, and there is no threshold in the
  ask. What would fail is a claim about the number, and no claim exists yet.
- The seats are the four the tree already has directories for, and the rows
  follow the chain: what was asked, what was designed, what was proved, what
  is green. Operations has no row until it has an artefact in the tree to
  count.
- The architect's coverage is read from the drawing's own trace and not from
  a directory listing. A drawing that exists and answers nothing covers
  nothing, and the trace is where that is visible.

## Constraints

- No new source of truth. Every row reads what the trace wall and the run
  records already hold.
- The exit vocabulary holds: 0 an answer, 1 findings, 2 the question is not
  this tree's. This command answers, so it exits 0 on any tree that has
  requirements.
- Nothing here reaches a network or a model.
- The board gains a line and no wall gains a way to fail that it did not
  have.

## Acceptance criteria

1. `kaal coverage` prints one row per seat, and each row names the seat, what
   it counts, how many of how many, and the share as a percentage.
2. The architect's row counts requirements answered by a drawing that
   declares them, and the tester's counts requirements with a run on record
   that is still about the suite it names.
3. Every row names what it does not cover, by name, up to a stated limit, and
   says how many more there are when it stops.
4. No page in this tree declares any of these numbers, and the command reads
   none.
5. The command exits 0 on a tree with requirements and 2 on a tree without,
   and never 1: a coverage number is a fact and not a finding.
6. The board runs it, and its line carries the four counts so a reader of the
   board sees them without asking a second question.
7. On this tree the rows answer what the tree holds: 61 stated, and the
   architect's and tester's counts equal to what the trace wall and the run
   records say when counted independently.

## Open questions

- Should a drop in coverage fail? A number that only ever reports is a number
  people stop reading, and a threshold is a judgement this league does not
  wall. The delivery report answers a related question with a record: a
  coverage record, pinned like a run, would make a drop a regression rather
  than a policy.
- Does the tester's row want two numbers, functional and non functional? The
  ask names architecture as part of what the tester covers, and this task
  counts contract cases separately without claiming they are a second kind of
  verification.
- What does the operator's row count once there is one? Releases with a
  record, against tags? There is one release and one record, and a row over
  one is a row nobody learns from.
- Should the coder's row be anything other than the board's own green? "The
  coder delivers to green, hard blocked on red" is already the push hook and
  the board, and a row restating it may be a fifth wheel.

## Handoff

- Task: a-seat-claims-what-it-covers
- Criteria: 7; tests: 7 (equal)
- Red run: `node --test requirements/a-seat-claims-what-it-covers/acceptance.test.mjs`,
  all seven failing
- Tests: `acceptance.test.mjs`, beside this file, with fixture roots for a
  tree fully covered, one with a gap in each row, and one with no
  requirements at all
- Open questions: 4, listed above
- Blocked on: nothing
- Unblocks: the answer to how far this league actually is, which is a
  question the board has never been able to answer about itself
- Supersedes: nothing
- People: none
