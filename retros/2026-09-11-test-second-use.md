# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the second use of the test skill, recording the runs the plan says are
owed before anything else in 0.0.2 moves, 11 September 2026.
Place: this repository

## Liked

- The cheapest item on the plan paid the moment it ran. Five records took the
  tester's row from 58 of 64 to 63, and one of the five is
  `an-install-carries-the-method`, which is this release's own promise and had
  been sitting green and unrecorded on a green board since it shipped. A
  release cannot claim a task delivered on evidence nobody wrote down, and
  nothing on the board was going to say so.
- Every one of the four stale records moved its suite sha, not just its date.
  The four were owed for the reason the report gave, which is the report being
  right about the half it can see.

## Learned

- `kaal runs` says green about suites it never ran. The command reads records
  only, which the comment above it states plainly, and then hands
  `verdict(root, run, 1, 0, task)` a hardcoded pass and fail so that it can
  borrow a message written for a caller that had run the suite. So `push-v1`
  reported `green, and no run has recorded it yet` while its criterion 7 fails
  on `no move at skill`. The reading is honest and the word is not, and the
  word is the part anybody quotes.
- `runs --write` offered 63 records where 5 were owed, and 57 of those differ
  by a date and nothing else. Second time this week, and the remedy each time
  was a hand sorting the list by whether the suite sha moved.
- A task that cannot be recorded reads exactly like a task nobody recorded.
  The coverage row now says 63 of 64, missing `push-v1`, and that row cannot
  say whether the tester is behind or the suite is red. It is red.

## Lacked

- Nothing in the skill about which records to keep when a write offers more
  than are owed. The rule used here, keep only those whose suite sha moved, is
  the right rule and it lives in nobody's page.
- No way for the tester to say that a suite is red on purpose today. The plan
  named `push-v1` as red for a reason of its own before this ran, and the
  coverage row has no room for that sentence.

## Longed for

- `runs --write` writing what is owed and nothing else, so that the hand
  sorting stops being the step that makes the command safe.

Feeds: test
Read: code
