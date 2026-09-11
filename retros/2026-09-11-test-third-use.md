# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the third use of the test skill, reconciling on merged main the one
record two merges left stale, 11 September 2026.
Place: this repository

## Liked

- The tree said so by itself. Nobody went looking: `kaal runs` on the merged
  commit named the stale record in one line, which is the reading-only report
  doing the half it is good at.
- One line changed. The record names the suite as it stands now and nothing
  else moved.

## Learned

- A record can be true on its branch and false on main. One diff wrote a
  record against the suite as that branch held it; another diff moved the
  suite; both merged in the order that was asked for, and the second merge
  carried a record naming a sha the tree no longer has. Git saw no conflict
  because the two diffs touched different files, which is exactly the case a
  merge cannot catch.
- Nothing on the board went red, and that is correct rather than a gap: a
  stale record reads `not delivered`, which is an answer. The cost showed up
  as the tester's row dropping from 63 of 64 to 62 on a green board, which is
  a number nobody watches between one merge and the next.
- This is what the plan's item 9 is for, and it fired eight items early. A
  record is evidence about a suite, so any diff that moves a suite invalidates
  every record naming it, including one merged the same minute.

## Lacked

- Nothing tells a branch that its base has moved the suite its record names.
  The rebase run locally caught it; the merge did not, and the merge is what
  lands.
- No rule about ordering a record against a fix for the thing it records. The
  order chosen here was right and still produced a stale record, because the
  record was written before the fix existed and merged after it.

## Longed for

- The reconcile step run on main rather than trusted per branch. Item 9 says
  to do it once before the tag; today says it is owed after any pair of merges
  where one moved a suite the other recorded.

Feeds: test
Read: code
