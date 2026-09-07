# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirty-first use of the architect skill, repairing a contract
test of my own that turned a closed task red on main, 7 September 2026.
Place: this repository

## Liked

- The wall found it, on main, within an hour, and named the two closed
  tasks and the count of failing tests. Nothing about the failure needed
  investigating beyond reading the line.

## Learned

- I wrote a contract that asserted the stack held one unconsumed retro for
  the analyse skill. That was true when I wrote it and false as soon as
  the next analyse retro was filed, which was the same afternoon and by
  me. A number that is true on the day is not a promise about a mechanism.
- The promise I meant was that archiving changes no count, because
  consumption is by name. The way to hold that is to read the tree in the
  test and compare, the way a witness computes its own hashes rather than
  asking the thing it is witnessing. I had used that pattern two days ago
  and did not reach for it here.
- Three more contract tests of mine, written this morning for the same
  kind of seam, carried the same defect and had not landed yet. They were
  fixed before they could do the same thing.

## Lacked

- Nothing warns that a contract asserting a count of anything the league
  itself grows will go red on its own schedule. The board is full of
  counts: retros, fixtures, walls, skills, and every one of them moves.

## Longed for

- A rule in the skill: a contract may assert a count only when it computes
  the count itself from the same tree, never when it carries one.

Feeds: architect
