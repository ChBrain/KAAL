# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-seventh use of the architect skill, on
`architecture/witness-a-tree` (four seams, one of them an existing wall),
6 September 2026.
Place: this repository

## Liked

- Making the read-only claim structural rather than tested. The acceptance
  test proves the command wrote nothing today; the wall refuses tomorrow's
  edit, and for a tool whose whole value is "it did not touch your tree"
  that is the difference between a promise and a property.
- Reading the closed tests before deciding the wall's finding shape. The
  better reading, a relative path in `file`, would have broken two closed
  unit tests; a new field costs nothing and keeps them.
- Closing the requirement's open question about file modes in a decision
  with its reopen condition, instead of leaving it for the developer to
  guess at.

## Learned

- Contract tests for a command look like acceptance tests unless the seams
  are chosen to promise something else. Here the acceptance test names the
  manifest of one tree; the contracts promise sorted against filesystem
  order, identical on a second run, and agreeing with the same tree at
  another path. That last one is the promise the guest harness actually
  needs, and no criterion had said it.
- A wall can be a seam. The fourth seam has no new module behind it at all:
  it is an existing wall, widened, and the contract drives it on a fixture
  root whose witness writes.

## Lacked

- Nothing in the skill says what to do when the shape a drawing wants is
  fixed by a closed task's unit tests rather than by its criteria. I went
  looking for importers by hand. The skill says to read closed
  requirements; it does not say to read their tests.
- No help on the boundary between a criterion's test and a seam's test for
  a command, where both drive the same executable. I found the split by
  asking what the harness will need, which is not in the skill either.

## Longed for

- A reading that lists, for a module I am about to change, who imports it
  and which closed tests name it. Half of this seat was that search.

Feeds: architect
