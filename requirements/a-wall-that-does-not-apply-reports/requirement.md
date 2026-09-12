---
traces:
  parent: gates-v1@ffd548104e02e54b97b197e3f31819ac3a55da39c88d6202e09948cbcc1d677f
  supersedes: nothing
---

# Requirement: a-wall-that-does-not-apply-reports

## Goal

The operator can promote `release` into `main`, which today no tree can do,
because a wall that declines to judge a promotion stops reading as a wall
that failed.

## What the runs said

- The promotion cannot pass, on this tree, today. `KAAL_BRANCH=release
KAAL_BASE=origin/main node bin/kaal.mjs promote . --into main --from
release` answers `seats: wall: red, and release is where that may stand`,
  `promote: 2 red wall(s) on the board`, `promote: into main: 3 finding(s)`
  and exits 1.
- The wall it names did not fail. `KAAL_BRANCH=release KAAL_BASE=origin/main
node bin/kaal.mjs seats .` answers `seats: not applicable here: this is the
promotion, and it is the operator's` and exits 2, which is the right answer:
  a promotion carries every seat's work by design, so the rule this wall
  asks has no true answer about it.
- The board reads that as a failure. `bin/lib/gates.mjs` line 104 is `ok:
r.status === 0`, so every code but zero is the same code, and the same run
  answers `FAIL seats` and `red: 15 wall(s), 2 failing`. The second of the
  two is `format`, red because that worktree holds no `node_modules`, and it
  is not part of this.
- The vocabulary says the three are different. `SURFACE.md` states them as
  the whole vocabulary: 0 an answer, 1 findings or usage, and 2 the question
  is not this tree's, where the tree holds none of what the command reads,
  so there is nothing to judge and a pass would be a coincidence.
- The board's own page says why it refuses a wall that cannot run: silence
  and success must not look alike, and a wall whose command cannot run is a
  failure with its fix hint and never a skip.

## Assumptions

- Declining to judge and failing to run are two answers and the board has one
  word for both. A wall that exits 2 said so on purpose, in the vocabulary
  this engine publishes; a wall whose command is missing never got to say
  anything, and the board cannot tell them apart because it reads one number.
- This does not reopen what a vacuous pass means. `nothing-passes-vacuously`
  is about a wall that ran and judged nothing while reporting success; a wall
  answering 2 reports that it judged nothing and says so in the answer, which
  is the opposite act.
- Nothing about the promotion's demands moves. It refuses a red wall and it
  goes on refusing one; what changes is that a wall which never judged is not
  counted red.
- The sync will want the same answer. The asker's `main -> release` leg is a
  target opening into a target, which is as little a lane's diff as the
  promotion is, so whatever shape this takes is the shape that leg reads too.

## Constraints

- A wall that cannot run stays a failure. From `gates-v1`: silence and
  success must not look alike, and that is the claim this task is closest to
  breaking.
- The three exit codes keep their meanings. The vocabulary is on the surface
  page and other commands are judged against it.
- Deterministic and offline, like every wall.

## Acceptance criteria

1. A wall answering 2 is reported in a word of its own, which is neither the
   word for a wall that passed nor the word for one that failed, and its own
   line carries what the wall said about why.
2. A board whose walls are each either passing or not applicable answers
   green and exits 0.
3. A wall whose command cannot run is still a failure, reported with its fix
   hint, and a board carrying one is red. This is `gates-v1`'s claim and this
   task must leave it exactly as it stands.
4. A promotion whose board carries a wall that does not apply is not refused
   for it: `promote --into main --from release` names no red wall where every
   wall either passed or declined to judge.
5. The board's count line says how many walls did not apply, beside the
   failing and the waived, so a reader sees it without opening a log.

## Open questions

- May a wall that does not apply be waived? A waiver is a human's act over a
  red, and there is no red here to waive. Today the board would let one be
  filed and report it as unused, which is a third thing a reader has to
  reason about.
- Should a board of nothing but walls that do not apply be green? Every wall
  declining at once is either a tree this engine has nothing to say about or
  a configuration that reads nothing, and the two look identical from here.
  It cannot happen on a promotion, where the test walls all apply.
- Does the answer belong to the wall or to the board? A wall says 2 and the
  board decides what that means, so a tree whose config names a command that
  exits 2 for its own reasons is a wall that does not apply and nobody
  intended it. The alternative is a declaration in the config, which is the
  thing this league has been moving out of that lane.
- What does a wall that does not apply do to the count of walls? Fifteen
  walls with one not applicable is fifteen walls, and whether the sentence
  reads that way is the architect's.

## Handoff

- Task: a-wall-that-does-not-apply-reports
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test --test-timeout=60000
requirements/a-wall-that-does-not-apply-reports/acceptance.test.mjs`, 12
  September 2026, 4 of 5 failing, and each of the four failing on its own
- Green before the build: criterion 3, and it is a guard rather than a
  criterion testing nothing. A wall that cannot run is `gates-v1`'s claim,
  this task moves the board around it, and it must read the same after
- Stand-in green: all five, discarded from file copies. It showed the board
  answering `n/a  seats` and counting `2 not applicable` beside the failing
  and the waived, and the promotion answering `0 red wall(s) on the board`
  and `nothing refuses this` where the only wall that did not pass had
  declined. It also found a criterion whose proof was wrong rather than code
  that was: criterion 4 first asserted that `red wall(s) on the board` does
  not appear, and `promote: 0 red wall(s) on the board` carries those words
  and means the opposite, so the count is what it reads now
- Tests: `acceptance.test.mjs`, beside this file, on fixture trees whose walls
  are scripts that exit as the case needs, because the answer this task is
  about is a number and a tree that produced it honestly
- Open questions: 4, listed above
- Blocked on: nothing
- Unblocks: item 13 of `plan/0.0.2.md`, which cannot happen until this does,
  and the sync leg of `a-dependency-update-lands-on-main`, which is a target
  opening into a target and reads the same way
- Supersedes: nothing. `gates-v1`'s claim about a wall that cannot run is
  untouched and criterion 3 exists to keep it that way
- People: none
