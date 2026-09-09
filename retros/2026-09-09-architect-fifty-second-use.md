# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-second use of the architect skill, on
`requirements/a-task-is-delivered-by-its-run` (five seams, delivery as a
report over recorded runs), 9 September 2026.
Place: this repository

## Liked

- The acceptance tests decided two of the open questions before I could argue
  about them. Where a record lives and whether there is one per wall are both
  fixed by criterion 2's test reading `tests/runs/` one directory deep, so
  the drawing recorded the reading rather than inventing a shape. That is the
  correction from two builds ago arriving as a habit.
- The tree already had the answer to the contracts wall. `statusForDrawing`
  reads the status of the requirement whose task the drawing answers, so a
  drawing's verdict has always followed its task's, and the ask's rule that
  downstream answers is what that function was already doing.

## Learned

- The drawings wall counts contract tests and cannot pair them. My first
  version tested seam 3 twice and seam 5 not at all, five tests for five
  seams, and the wall said the drawing holds its shape. A count is not a
  pairing, and the seam that went untested was the one carrying criterion 1,
  which is the whole point of the task.
- I found that by running the isolations rather than by reading. Three breaks
  reddened seams 3 and 4 together, which sent me to look at why, and the
  answer was that both tests drove the same seam. An isolation that reddens
  two is worth the same suspicion as one that reddens none.
- Second weak break of the day, same shape as the last drawing's. Seam 5
  passed on a field the wall carries and never prints, so stripping the word
  from the label changed nothing. The fix is the one I wrote down last time
  and did not apply: read what the seam promises a reader, which here is the
  board's own line.
- An argument exists for exactly one branch, and deleting the branch deletes
  the argument. `mustClose` is passed false by one caller so a green drawing
  on an open task is not told to close, and the verdict it guards is the one
  this task removes. Nobody would have found that by reading the signature;
  it came from asking what each verdict is for.

## Lacked

- No rule pairing a contract test to its seam. The wall counts, the template
  says numbered to match, and nothing checks that test 4 is about seam 4. It
  cost me a missing test on the most important seam in this drawing.
- Nothing about a stand-in that must span two modules. This one needed a new
  module and a rewiring of an old one before seam 5 could go green, and I ran
  the first stand-in without the second half and read the red as a defect in
  my test.

## Longed for

- The drawings wall to read a contract test's numbered name against its
  seam's number. It has the list and it has the names, and it is one
  comparison.
- An isolation list computed from Fixed and free rather than written by hand.
  Nine breaks here, and the two that taught me something were the ones whose
  result surprised me.

Feeds: architect
Read: test
