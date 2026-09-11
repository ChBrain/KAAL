# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the sixtieth use of the architect skill, reading three drawings
against the criteria that shipping the method moved, 11 September 2026.
Place: this repository

## Liked

- Three readings and they came out differently. Two drawings had a seam that
  read the moved clause and one did not, so two are `updated` and one is
  `reviewed-no-impact`. A batch of readings that all agreed would have been a
  batch nobody did.
- The one that changed nothing was the quickest to be sure of.
  `the-tag-installs-offline` has two seams, the install-time scripts and the
  one named step, and its criterion 2 is about what the install carries. The
  drawing never reads that list, so the answer is a sentence and not a
  judgement call.
- The board now shows all four states at once: 90 current, four
  review-needed, one reviewed-no-impact, four updated. Yesterday that counter
  had never had more than two columns with anything in them.

## Learned

- `kaal traces --write` writes into whatever seat's tree a pin happens to
  live in, and the lane guard refuses the result. Three `supersedes` names
  landed bare in #171 and the writer pinned them here, correctly, in the
  analyst's file, from the architecture lane. The seats wall caught it in one
  line.
- So this is the same shape a fourth time: the plans count, the proof owner,
  the moved pin, and now the pin writer itself. A tool one seat runs writes
  into another seat's tree, and the answer each previous time was to move the
  cost rather than to stop the write.
- It is worse than the plans count in one way and better in another. Worse:
  every seat runs `traces --write` to finish a diff, so any seat can trip it.
  Better: leaving a name unpinned is not a finding, so the fix here is to let
  the owning seat pin it, which costs nothing and is what a lane is for.
- A seam is where a criterion's move shows or does not. Both `updated`
  drawings had a seam whose text quoted the clause that moved, almost
  verbatim, and both were wrong in a way a reader would have believed. That
  is the argument for reading rather than clearing, made twice in one diff.

## Lacked

- Nothing tells the writer whose tree it is about to write into. It knows the
  lane from the branch already, because the seats wall reads the same thing,
  and it could refuse or report instead of writing and being refused.
- No way to record a reading that spans several artefacts as one act. Three
  readings, three blocks, three reasons, and the fact that they were one
  sitting against one change is nowhere.

## Longed for

- The manage skill, ninth record in two days. Here the question is the
  narrowest yet and the most mechanical: which artefacts pin the region I am
  about to move, and who owns each.
- A supersede that names a criterion, third record asking. All seven pins
  moved because three criteria moved, and every reader chasing one had to
  diff a whole region to find the clause.

Feeds: architect
Read: analyse
