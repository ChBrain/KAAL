# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the eighty-ninth use of the analyse skill, stating how a dependency
update reaches main, 12 September 2026.
Place: this repository

## Liked

- This page's name was computed, by the script that landed an hour ago,
  against the tree it is being filed into. The first retro named the ordinary
  way rather than by somebody counting.
- The ask arrived with a conclusion attached and the conclusion was the wrong
  way round. Asking what actually refuses the pull request, rather than how to
  let it through, turned a hole in the promotion into a lane and a target
  branch, and the promotion keeps the one claim it makes.

## Learned

- A criterion can be wrong about its own tree. Criterion 2 was first proved
  with `tests/plans/units.md` as a path a bump may not touch, and the seat
  rule let it through, correctly: the plan and suite pages are shared and
  open to every lane. The criterion was arguing against a rule the tree
  already holds, and the stand-in is what said so.
- Three criteria can read as three proofs and be one. Criteria 1, 2 and 3 all
  rest on a lane existing, and until it did, all three were red for that and
  none of them for its own reason. Only standing the lane up showed which of
  them had anything to say.
- A criterion green before the build is not always a defect. The fifth is a
  guard: `main takes only release` is a closed task's claim, this task moves
  the tree around it, and it must read the same after. Naming it in the
  handoff is what keeps it from looking like a criterion that tests nothing.

## Lacked

- Any way to tell a shared path from a lane's own when writing a criterion.
  The seat rule holds both and a page reads as if a lane's allows were the
  whole answer.

## Longed for

- A word for the two kinds of drawing. What this tree uses to deliver and
  what it delivers are different questions, the architect answers both, and
  the tree has one word for the seat and none for either.

Feeds: analyse
Read: architect
