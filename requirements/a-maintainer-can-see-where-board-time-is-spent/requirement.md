---
traces:
  parent: gates-v1@ffd548104e02e54b97b197e3f31819ac3a55da39c88d6202e09948cbcc1d677f
  supersedes: nothing
---

# Requirement: a-maintainer-can-see-where-board-time-is-spent

## Goal

A maintainer wants the board to show where its execution time is spent, so
that a platform-specific cost can be located before anybody chooses an
optimization; they will know when every wall's result carries comparable,
advisory elapsed time on both platforms that run the board.

## What the runs said

- `npm test` on `release` at `6ca5826` ran all 15 walls and ended `red: 15
wall(s), 3 failing, 0 waived, 1 not applicable`; none of its wall lines
  carried elapsed time. The three failures were inherited regressions in
  `a-trace-pins-what-it-read`, `a-tree-has-one-root`, and
  `the-test-tree-is-written-down`.
- The ask reports that the same board generally takes about 2:20 to 3:00 on
  Linux and 7:00 to 8:05 on Windows, while setup and `npm ci` account for
  only seconds of the difference. That observation locates the unknown
  inside the board, not inside setup, but does not identify a wall.
- `.github/workflows/ci.yml` runs the same `npm test` command in jobs on
  `ubuntu-latest` and `windows-latest`; the Windows board job is present
  today.

## Assumptions

- The board's ordinary wall result lines are the evidence a maintainer can
  obtain. A separate profiler or provider-specific log would make the
  repository unable to state what evidence every run produces.
- One elapsed value per wall is enough for the first diagnosis. This task
  does not ask which command, process creation, filesystem operation, or
  test inside a wall accounts for that wall's cost.
- Milliseconds are a common unit that lets results from Linux and Windows be
  compared without choosing a threshold or promising clock precision.
- The reported platform difference is evidence to investigate, not evidence
  that process creation or filesystem work is its cause.

## Constraints

- The board keeps running every wall in declaration order, including the
  walls after one fails, and keeps each wall's answer, detail lines, count,
  fix hint, summary, and exit behavior.
- The timing is diagnostic only. No elapsed value, comparison, budget, or
  threshold may make a wall or release pass, fail, waive, or become not
  applicable.
- Windows coverage remains mandatory beside Linux coverage. Timing evidence
  is not grounds to remove, skip, or weaken the Windows board job.
- This requirement chooses no caching, parallel execution, batching,
  process reuse, filesystem change, or other optimization. Measurements
  must identify the actual cost before another seat chooses a remedy.
- This requirement is open and assigned to no release. The plan manager
  decides whether and when it enters a release train.

## Acceptance criteria

1. Each wall result from `node bin/kaal.mjs gates <root>` ends with exactly
   one annotation shaped `[timing: <number> ms, advisory]`; the annotations
   name every executed wall once and occur in the walls' declaration order,
   so their values can be compared without an elapsed-time threshold.
2. On a fixed board containing a passing wall with a count, a failing wall,
   a later passing report, and a wall that does not apply, removing only the
   timing annotations leaves the existing result lines, detail lines,
   summary, and non-zero exit answer unchanged.
3. The `ci` workflow keeps jobs on `ubuntu-latest` and `windows-latest` that
   each run `npm test`, so the same acceptance proof remains mandatory on
   Linux and Windows.

## Open questions

- Should the board also report time spent outside the walls? The ask names
  wall execution, and an unassigned total would not locate a wall.
- How much precision should the elapsed value retain? The criterion fixes a
  comparable numeric value and unit, not the clock or rounding policy that
  produces it.

## Handoff

- Task: a-maintainer-can-see-where-board-time-is-spent
- Criteria: 3; tests: 3 (equal)
- Red run: `node --test --test-timeout=60000
requirements/a-maintainer-can-see-where-board-time-is-spent/acceptance.test.mjs`;
  criterion 1 red because `ok   counted (2 passing)` has no advisory timing
  annotation, criteria 2 and 3 green as guards
- Green on a stand-in: all 3 passed on a discarded copy whose board measured
  each fixture wall and appended the required advisory annotation
- Tests: `acceptance.test.mjs`, beside this file; `fixtures/board` is fixed
  ground with four portable wall commands and no clock threshold
- Open questions: 2, listed above
- Blocked on: nothing
- Unblocks: nothing
- Supersedes: nothing
- People: none
