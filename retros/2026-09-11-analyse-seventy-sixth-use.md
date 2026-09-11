# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-sixth use of the analyse skill, stating
`a-suite-names-its-cases` after the asker gave the five kinds `tests/` holds
and the reason for taking it first, 11 September 2026.
Place: this repository

## Liked

- The ask counted to four tasks and this diff carries the first. The suite
  layer, the twenty-one moving, the regression plan and the bugs can each
  fail on their own, and the asker's reason for the order is the criterion
  rather than a preference: a glob matches whatever is there, a named
  reference has an owner, and a case with no owning lane has nowhere valid to
  be named.
- Nothing was softened to make a criterion provable. The one criterion that
  changed changed because its test was wrong, not because the claim was hard.

## Learned

- The stand-in found one, and it would never have gone green. Criterion 1
  read the five kinds as substrings and `re-runs` matched before `suites`, so
  the order assertion failed on a page that named all five correctly. A
  criterion about a page's prose is the one most likely to be proven by a word
  the page happens to contain, and the fix was to read the three kinds that
  have a place by their place.
- Two rounds of shared red before seven distinct reasons. Six tests first
  failed on a fixture with no requirement, so `kaal traces` answered "not
  applicable here" six times; then on the fixture's own strategy page carrying
  no root line. Both times the fixture was the thing that was wrong, and the
  rule that a fixture obeys every rule it is not testing cost two rounds
  because it was applied after writing rather than while.
- Running answered an open question before it could be asked. The trace wall
  already treats anything under `tests/` as an artefact, so a suite carries a
  `traces` block whether or not this task asks for one; and a `parent:` there
  resolves against `tests/` rather than the declaring file's own directory, so
  a suite can only parent to a page sitting directly in `tests/`. The open
  question narrowed from whether a suite traces to which of two parents it may
  have.

## Lacked

- Nothing in the skill about a criterion whose subject is a page's prose. The
  rule that a criterion fixes a finding's format is exactly right for a
  command and says nothing about how to read a sentence without becoming
  hostage to a word that sentence happens to carry.
- No place for the count from step 1. The ask here was four tasks, three of
  them are named in the handoff, and nothing in the tree checks that a task
  named as owed was ever written.

## Longed for

- A fixture that is built by the rule rather than checked against it. Both
  shared reds were a scratch tree missing something every real tree has, and
  the tree knows what a real tree has.

Feeds: analyse
Read: test
