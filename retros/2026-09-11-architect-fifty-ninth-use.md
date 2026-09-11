# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty ninth use of the architect skill, amending the contract that
shipping the method genuinely contradicts, 11 September 2026.
Place: this repository

## Liked

- This one is superseded and its neighbour is not, and the two went red on
  the same push. Keeping them apart is the whole of these two diffs: one
  claim moved and one reading broke, and the answers are opposite.
- The contract lands honestly red. Its criterion says the package carries
  `skills/` and the manifest does not ship it yet, so the test fails, the
  record is stale, and the wall reads `not delivered` rather than
  `regressed`. That is the four verdicts telling an unbuilt claim from a
  broken one, on a claim that is three diffs from being true.

## Learned

- The delivery report now gives two reasons in one line: the record is stale
  and three pins await a review. I built that join this morning without a
  case that needed it, and the first tree to produce one is this. A `why`
  that can only carry one reason would have shown the stale record and hidden
  the pins, and the pins are the part a reader must act on.
- A supersede travels further than the task that declares it. Amending three
  criteria left seven pins `review-needed` across five artefacts, because
  `supersedes` is a kind that pins a region like any other. Every one of them
  is a reading somebody owes, and none of them is a failure. The tree is
  visibly mid handoff and still green, which is what this morning's work was
  for and the first time it has been true of five artefacts at once.
- Checking whether a chain link is a link is worth one command. Its neighbour
  needed nothing and went up in parallel; this one genuinely needed the
  supersede on main first, because without it the stale record would not have
  been stale and the wall would have called this a regression.

## Lacked

- Nothing separates a proof that is red because its subject is unbuilt from
  one red because its subject is three diffs away. Both read `not delivered`,
  which is correct and tells a reader nothing about when to expect green.
- No way to say which diff will turn a given red green. The plan holds that
  answer in prose and no wall reads it.

## Longed for

- A supersede that names a criterion rather than a task, second record asking.
  Seven pins moved because three criteria moved, and a reader chasing any one
  of them has to diff a whole Acceptance criteria region to find the clause.
- The manage skill, eighth record in two days, and the question is unchanged:
  what else reads the thing I am about to change.

Feeds: architect
Read: analyse
