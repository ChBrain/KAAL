# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-sixth use of the code skill, building
`the-board-counts-the-reads`: an eleventh wall, a flag, and a corrected
surface page, 7 September 2026.
Place: this repository

## Liked

- The unit fell on its own, which is the first time this week a new unit
  did. Six existing units passed and the seventh failed against the old
  reader, because `appliesHere` was already exported and the test needed no
  name the module did not have. The collapse that made four units share one
  module load error two builds ago was about a missing export, not about
  unit tests.
- The sweep and the supersede check, run for the second time, both answered
  in under a minute and both answered "nothing". Two runs is enough to say
  the rules are cheap rather than that they were cheap once.

## Learned

- The same three words guard `class` and nothing tests them. Adding the unit
  for `retros` made it obvious that the older case has no unit at all, and
  I left it alone: I am not changing `class`, so a test for it is scope I
  would be inventing. It belongs to `an-argument-is-read-once`, which the
  drawing named, and it is the second reason that task exists.
- An eleventh wall costs nothing to add and the board says so. `green: 11
wall(s)` needed one config entry and no change to `gates.mjs`, which is
  the shape `gates-v1` was drawn for and the first time this session has
  used it.

## Lacked

- Nothing tells a build what to do about untested behaviour it now depends
  on. `retros` and `class` read their arguments by the same rule, one of
  them is now tested and one is not, and the rule against inventing scope
  and the rule against depending on the untested pull in opposite
  directions with nothing to settle them.
- The surface page is corrected by hand and nothing will notice the next
  time it goes stale. This build fixes a paragraph that was wrong for a day
  on a green board, and the wall that would find the next one is a Longed
  for rather than a task.

## Longed for

- A check that every command's surface entry names the exit codes the
  command can actually produce. The tree already knows them: each command's
  codes are in its own source and the page lists them in one sentence.

Feeds: code
Read: test
