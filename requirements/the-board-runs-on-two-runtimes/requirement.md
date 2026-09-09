---
traces:
  supersedes: public-v1@1ccf1d0c7ba94c15b9f9f638a9491eac5d8bb395bcce20787385f937d7f4e417
---

# Requirement: the-board-runs-on-two-runtimes

_Named in five retros before it was written. The defect that made it
necessary reached main, was found on a contributor's machine rather than in
CI, and is closed; nothing has stopped the next one of its kind. Written
after the first attempt to add the job turned a closed contract red, which
is the second criterion here and the reason this is a requirement rather
than a one line change to a workflow._

## Goal

Whoever reads a green board wants it to mean the board is green on the
runtimes the league is actually run on, so that a defect visible only under
a runtime nobody pinned is red here rather than on a contributor's machine;
they will know it by a second job running the same one command under the
next major runtime, by the required check keeping the name it is required
under, and by the closed contract that counts CI's jobs naming them instead.

## What the runs said

- `node bin/kaal.mjs acceptance` on a tree carrying a third job that runs
  `npm test` reports `FAIL closed public-v1 (5 passing, 1 failing)`, on
  criterion 4, with `two jobs run npm test / 3 !== 2`.
- That test asserts `(jobs.match(/^\s*- run: npm test\s*$/gm)).length === 2`,
  a total over the whole file. Criterion 4 itself says the workflow "keeps a
  job named `walls` on `ubuntu-latest` and adds a job on `windows-latest`;
  both run `npm test` and nothing else as their test step". It names two
  jobs and says nothing about how many others there may be.
- `.github/workflows/ci.yml` today holds three jobs, `walls`,
  `walls-windows` and `standard`, and the last runs the skills validator
  rather than the board. Its `standard` job already uses a matrix, over
  `os`, so the pattern is in the file.
- `npm test` and `NODE_OPTIONS=--test-reporter=spec npm test` both report
  `green: 10 wall(s), 0 failing, 0 waived` on this tree today, which is the
  fix from `a-wall-reads-one-format` holding. Neither run proves anything
  about node 24, because this machine has node 22.

## Assumptions

- The second runtime is the next major, 24, and not the newest thing
  available. The league pins 22; the risk the retros named is the gap
  between what is pinned and what a contributor happens to have, and one
  step is the gap that has actually bitten.
- A job of its own rather than a matrix on `walls`. A matrix renames the
  check to `walls (22)`, and `walls` is the required check Kai set in the
  repository's rulesets, so a matrix silently un-requires the board. This is
  the same reason `walls-windows` is a job and not a matrix.
- Correcting the closed test is a supersede and is declared as one. The
  claim that moves is the test's, not the criterion's: the criterion names
  two jobs and the test counted every job in the file.
- Nothing about the runtime the league pins changes. `node-version: 22`
  stays where it is, in `walls` and everywhere else.

## Constraints

- The job named `walls` keeps that name, keeps `runs-on: ubuntu-latest`, and
  gains no matrix. A required check is a promise to a setting outside this
  tree.
- Every job that runs the board fetches the whole history, because the class
  wall reads a diff against `origin/main` and a wall that cannot run is a
  failure.
- The one command does not move: a job that runs the board runs `npm test`
  and nothing else as its test step.
- No skill's text changes and nothing under `bin/` moves.

## Acceptance criteria

1. The `ci` workflow holds a job that runs the board on `ubuntu-latest` with
   `node-version: 24`, fetching the whole history, whose only test step is
   `npm test`.
2. The job named `walls` is still a job named `walls` on `ubuntu-latest`
   with no `strategy:` of its own, so the required check keeps its name.
3. `public-v1`'s fourth acceptance test names the jobs it checks rather than
   counting them: it asserts that the `walls` job and a `windows-latest` job
   each run `npm test`, and asserts no total over the file.

## Open questions

- How many runtimes is the right number? Two is what the retros asked for
  and the third is free to add and not free to wait for.
- Should the second runtime follow the newest release automatically? A
  floating version turns an upstream release into a red board on a morning
  nobody chose, and a pinned one goes stale silently. Neither is obviously
  right and this task pins.
- Is a required check's name written down anywhere a reader of this tree can
  find? It lives in a setting only Kai can see, and two decisions here rest
  on it.
- The `standard` job runs on both platforms and one runtime. It runs a
  validator rather than the board, so nothing here touches it, and whether
  it should is unasked.

## Handoff

- Task: the-board-runs-on-two-runtimes
- Criteria: 3; tests: 3 (equal)
- Red run: `node --test --test-timeout=60000 requirements/the-board-runs-on-two-runtimes/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file; surface only, the text of
  `.github/workflows/ci.yml` and of `public-v1`'s fourth test
- Green before the build: criterion 2, and it is a guard rather than a
  defect. The `walls` job is correct today and the criterion exists to keep
  the build from reaching for a matrix, which is the obvious way to add a
  runtime and the one that would un-require the board
- Open questions: 4, listed above
- Status: closed
- Blocked on: nothing
- Unblocks: nothing
- Supersedes: `public-v1`. The claim that moves is its fourth acceptance
  test's, that exactly two jobs in `ci.yml` run `npm test`. Criterion 4
  itself names two jobs and claims nothing about a total, so the criterion
  stands unchanged and only the test's reading of it moves. The principle
  that permits it is `a-drawing-shows-its-ground`: a contract may assert a
  count only when it computes that count from the same tree it asserts
  about, and a total written into a test goes red on the league's own
  schedule rather than on a change
- People: none
