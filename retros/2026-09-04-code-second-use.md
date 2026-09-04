# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the second real use of the code skill, on `architecture/gates-v1`,
4 September 2026.

## Liked

- The drawing's three seams built in under an hour, tests first, and every
  layer above stayed untouched.
- The runner reported its own first red honestly: the acceptance wall is red
  because an open criterion is red, and the summary said so in one line.

## Learned

- Green on nothing, observed: node's test runner marks its children with
  `NODE_TEST_CONTEXT`, and a nested `node --test` that inherits it reports
  pass whatever happened. An acceptance test that spawned the runner saw
  green while the runner run by hand was red. The runner now strips the
  marker from every wall's environment, and a unit test pins it by running
  a known-red suite from under the test runner. This is conduct's third law
  and it cost a measurement to find.
- A wall's verdict must not depend on who called it; that sentence is now
  in the runner's own comment.
- The leak had hidden a recursion: an acceptance test that proves npm test is
  the runner spawns the runner, whose acceptance wall runs that test again.
  A guard on npm's lifecycle variable held only under npm; the runner now
  marks every wall's environment with its own variable and the test reads
  that. Guard on the thing you control, not on the thing that happens to be
  set.

## Lacked

- A rule for when an open requirement's acceptance tests start gating. Today
  every requirement's tests are walls from the moment they exist, so the
  league's board is red until push-v1's manual step is done, and a reader
  cannot tell "the tree is broken" from "a task is not finished". A
  requirement should say whether it is open or closed, and the runner should
  report an open one's reds as expected rather than as failures.
- An analyst's test that found the evals workflow by a phrase in a comment
  broke the moment another workflow used the phrase; it now matches the
  trigger condition. A finder should match structure, not prose.

## Longed for

- The first two eval records, so that the board can be green for a reason
  and not by relaxing a wall.

Feeds: `code`.
