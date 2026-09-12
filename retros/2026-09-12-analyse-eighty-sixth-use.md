# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the eighty-sixth use of the analyse skill, saying that a test file is
not a script, 12 September 2026.
Place: this repository

## Liked

- The criterion's own other half already said it. The skills clause has always
  excluded `.test.mjs` from the scripts it counts; the `bin/` clause never did,
  and the two sat four lines apart for a month.
- Green before the move and green after it, proven rather than reasoned: the
  unit was dropped beside the command, the suite run, and the file taken away
  again. The criterion now holds at both ends of a move that has not happened
  yet.

## Learned

- The criterion held an opinion it had no business holding. "Every script
  under `bin/` has a test under `tests/`" fixed where a test lives, and the
  tests' own plan is what owns that. It was true when written and it became an
  obstacle the moment the units started moving, which is what a criterion
  about somebody else's tree always becomes.
- A defect can hide behind a thing that never happened. Nothing under `bin/`
  had ever been a test file, so the missing exclusion cost nothing until a
  unit moved there, and then it read that unit as a script wanting a unit of
  its own.
- Three pins moved and only two were this seat's. The drawing over `push-v1`
  reads the criteria region too, and that read is the architect's: this diff
  leaves the task `not delivered` and the promotion says so.

## Lacked

- Any pairing between the two halves of one criterion. They are one sentence
  and one test and the two halves drifted inside both, and nothing reads a
  criterion for a clause that contradicts its neighbour.

## Longed for

- A criterion that can say `where this lives is not mine`. It took a paragraph
  of prose to say it here, and the next criterion that wants to say it will
  write the paragraph again.

Feeds: analyse
Read: code
