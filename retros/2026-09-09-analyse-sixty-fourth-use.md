# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the sixty-fourth use of the analyse skill, on
`requirements/a-task-is-delivered-by-its-run` (seven criteria, delivery as a
report rather than a field), 9 September 2026.
Place: this repository

## Liked

- The asker named the mistake as a category and it was one. I had been
  arguing about which lane may write `- Status:` and about whether a shared
  list should let a build reach the analyst's page. Neither question
  survives: whether a thing was delivered is a report, so nobody writes it,
  so no lane needs to reach anywhere.
- Counting first made the requirement short. Four verdicts read from one
  field, three of them computable from the run, one not. The whole task is
  that one, and the fourth noun in the ask, runs, is what answers it.

## Learned

- I read a list of four and used three. "Test strategy, test plans, test
  suites and test runs" was written with three exclamation marks and I built
  the strategy and the plans, took suites as read, and dropped runs entirely.
  The piece I dropped is the one that makes the whole model work, because a
  red suite is a regression if it ever passed and an unbuilt task if it never
  did, and nothing but a record can tell those apart.
- A criterion asserting "this tree still answers what it answers" costs a
  full board run to prove, and inside the board that run is the board running
  itself. `gates-v1` met this and guarded it with the runner's own marker,
  and I wrote the same test without the guard and watched it time out. The
  precedent was two directories away.
- A test that reads a fixture I wrote to match the shape I am asserting
  proves my typing. Criterion 2 was green on the first run for exactly that
  reason, and the fix was to have the tool write the record and read that
  instead. Green before the build is sometimes a guard and is sometimes a
  test pointed at the wrong thing, and telling them apart means asking who
  wrote the thing being read.
- A stale record must not prove a regression. A recorded pass against text
  that has since changed says nothing about the text that is failing now,
  so it reads not delivered rather than regressed. That is the pin idea
  arriving in a new place, and without it every unfinished task whose suite
  once passed would read as a regression.
- Removing a field from 59 pages includes the page doing the removing. This
  requirement carries the `- Status:` line it exists to delete, because the
  wall still demands one until the build lands, and a requirement that fails
  the wall it is changing is a requirement nobody can read.

## Lacked

- Nothing in the skill about a criterion whose proof is expensive. Two of
  these seven need a full sweep of the tree, and the skill's one test per
  criterion says nothing about what to do when the test costs a minute.
- No way to say a task is stalled rather than merely not delivered. Under
  this report `push-v1`, waiting on a human step for weeks, and
  `a-diff-carries-one-seat`, specified an hour ago, read the same. That is a
  weaker statement than open was, and the open question records it.

## Longed for

- The runner's marker as a thing the skill mentions rather than a thing two
  tests happen to know. It is the answer whenever a test's subject is the
  runner, and I have now needed it once and found it late.
- A count of what each criterion costs to prove. The two expensive ones here
  are expensive for a good reason and I would still like the board to say so.

Feeds: analyse
Read: test
