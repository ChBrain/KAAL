# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-third use of the code skill, putting the command's own
test beside the command, 12 September 2026.
Place: this repository

## Liked

- Five and five, compared before it was named, like the twenty before it.
- No path moved. From `tests/` the root was one step up and from `bin/` it is
  the same one step, so the only edit the file needed was that the command it
  drives is beside it now and says so.

## Learned

- This file lands and nothing runs it. The units wall reads
  `bin/lib/*.test.mjs`, one level, so a case named in the suite and run by no
  gate is the state this diff leaves, and no wall says a named case is unrun.
  It is the only order that works: widening the gate first makes a glob that
  matches nothing, and `node --test` refuses that rather than shrugging.
- Nothing in the tree would have told me. A case in a suite that no wall runs
  is exactly as green as one that runs and passes, and the only reason this is
  a sentence in a commit message rather than a hole is that the diff after it
  is already written.

## Lacked

- A wall for a named case no gate runs. The suites wall asks who names a file
  and the plans wall asks which wall a plan is about, and between them nobody
  asks whether the cases a suite names are actually run.

## Longed for

- The gate and the case to be one declaration. The suite says which cases
  exist and the config says which globs run, and the two can disagree
  silently in either direction.

Feeds: code
Read: test
