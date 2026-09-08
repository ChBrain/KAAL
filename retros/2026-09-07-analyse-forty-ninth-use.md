# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-ninth use of the analyse skill, on
`requirements/the-board-runs-on-two-runtimes`, written after a one line
change to a workflow turned a closed contract red, 7 September 2026.
Place: this repository

## Liked

- The change refused itself before anyone reviewed it. Adding a third job to
  the workflow made `public-v1` red on a count of two, so the smallest
  possible edit produced a supersede, a requirement and three tests instead
  of a commit. That is the board doing exactly what it is for, on a change
  its author had already decided was too small to need it.
- The supersede is of a test and not of a criterion, and saying so made the
  whole task honest. `public-v1` criterion 4 names two jobs and claims
  nothing about a total; its test counted every job in the file. The
  criterion stands, the test's reading moves, and the principle that permits
  it is a rule shipped this morning.

## Learned

- A count carried in a test is the defect that keeps arriving. Three times
  today: two criteria of my own asserting zero unconsumed retros, and now a
  closed contract asserting two jobs. The rule against it was written this
  morning and it did not stop the third, because the rule lives in the
  architect skill and this test was the analyst's.
- A word is not a name. Three isolations were needed to make one assertion
  hold: `walls` matched the test's own title, then matched a local bound to
  something else, and only a quoted literal separated the job being looked
  up from the word appearing. Fourth time this week that a pattern read
  across too much text was green while holding nothing.
- A criterion can be green before the build and still be worth writing.
  Criterion 2 guards the `walls` job's name against the obvious way to add a
  runtime, a matrix, which would rename the required check and silently
  un-require the whole board. It cannot fail today and it is the criterion
  most likely to save the task.

## Lacked

- The skill has no rule for a change to a file the league does not own the
  meaning of. A required check's name lives in a repository setting only Kai
  can read, and two of this task's decisions rest on it. Nothing says what
  to do when a constraint is real, load bearing, and unverifiable from the
  tree.
- Nothing tells the analyst to run the change before writing the
  requirement. This requirement exists because the workflow edit was made
  first and the board refused it. Written the other way round, the count in
  `public-v1` would have been found in review or not at all.

## Longed for

- A wall over the tests themselves: a total asserted against a tree the test
  did not read is a finding, wherever it is written. Every instance this
  week was found by a change breaking it rather than by anything looking.

Feeds: analyse
Read: test
