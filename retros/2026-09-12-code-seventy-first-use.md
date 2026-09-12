# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-first use of the code skill, merging three units into the
three that already sat beside their modules, 12 September 2026.
Place: this repository

## Liked

- Every merge is the sum of its two halves and the count says so: six where
  three met three, nine where four met five, twenty-two where thirteen met
  nine. A merge that loses a case loses it silently, and the arithmetic is the
  only thing that would have noticed.
- No case name collided across any of the three pairs. The two halves were
  written months apart about the same module and neither reached for the
  other's ground, which says the split was by subject rather than by accident.

## Learned

- Helpers collide where cases do not. Two of the three pairs each defined
  something with the same name and a different shape: `git` in the class pair,
  one taking a directory as a flag and one as a working directory, and
  `scratch` in the plans pair, one making a directory and one building a tree
  and handing it to a function. Merging by appending would have taken the
  second definition silently in both.
- One of the two was worth unifying and the other was not. The two `git`
  helpers wanted the same thing and differed only in which of them set an
  identity, so one helper carrying both is better than either. The two
  `scratch` helpers are different jobs with one name, so the arriving one was
  renamed and nothing was bent.
- A header comment is a claim that goes stale. `bin/lib/frontmatter.test.mjs`
  said the rest of its cases were in the tester's tree "where they stay: a
  unit belongs beside the code it tests and moving somebody else's file is
  somebody else's diff". That was true the day it was written, the shared
  suites made it false, and nothing in this tree reads a comment.

## Lacked

- Any check that a merge kept what it merged. The counts were compared by
  hand, as they were for the fifteen an hour ago, and a merge is exactly where
  a case goes missing without a wall noticing.

## Longed for

- The duplicate to be visible while it stands. Six of these cases now run
  twice, from two files, and the only thing that says so is that somebody
  remembers the delete is still owed.

Feeds: code
Read: test
