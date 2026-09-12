# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventieth use of the code skill, adding fifteen units beside the
modules they import, 12 September 2026.
Place: this repository

## Liked

- Every one of the fifteen was compared against the file it came from, pass
  count to pass count, before anything was named. Fifteen files moved by a
  script is fifteen chances to move a path wrong, and the only honest check is
  that the copy says what the original says.
- Nothing is deleted here. The tester's tree still holds all fifteen, so the
  units wall runs each of them twice and the count is the proof that both
  copies say the same thing. The hole comes after the duplicate, never before.

## Learned

- The first pass moved one walk per file and four files walk more than once.
  `acceptance` reaches two fixture roots, `ledger` three, and the script that
  replaced the first `..` left the others one directory short. It showed as
  four files with fewer passing cases, which is the cheapest possible way for
  that mistake to arrive, and only because the counts were compared.
- Two of the fifteen walk nowhere at all. `sha` and `standard` import their
  module and read no fixture, so the transform that every other file needed
  would have failed them loudly if it had been required, and the script had to
  be told that walking nowhere is an answer.
- The move is one lane now and was two yesterday. The file lands in the
  developer's tree and the line naming it goes in `tests/suites/units.md`,
  which is shared since the day a new test file could not be added at all.

## Lacked

- Any way to know a path is wrong other than running it. A unit that walks to
  a fixture root it cannot find is red; one that walks to a root that happens
  to exist and holds something else is green and wrong, and nothing in this
  tree would say so.

## Longed for

- The root as one exported thing rather than a walk each file counts for
  itself. Fifteen files each counting their own distance to the same place is
  fifteen places for a move to go wrong, and this was the move.

Feeds: code
Read: test
