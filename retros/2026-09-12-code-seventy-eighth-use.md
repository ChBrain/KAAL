# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-eighth use of the code skill, building the board's third
answer, 12 September 2026.
Place: this repository

## Liked

- Five seams in two files and no new argument anywhere. The classification is
  one field read from one number, and the four readers below it each lost a
  line rather than gaining one.
- The build order the drawing set was right for a reason it stated: seam 2,
  the waiver, is the one nothing else would have caught, and putting it
  second meant it was proven before three easier seams made the file look
  finished.

## Learned

- A worktree is at HEAD and not at my working tree. Proving the promotion
  passes was run against a detached worktree carrying the code before the
  fix, and it answered `FAIL seats` exactly as it had all day. The answer
  looked like the fix not working and was the fix not being there.
- The faithful test of a promotion needs git to name no branch. Run in this
  repository, where git names the build branch, the seat rule judges the
  branch it is on and finds real findings about other seats' work; only a
  detached checkout with `KAAL_BRANCH` set reads as CI reads.

## Lacked

- A way to run the board as a target sees it without building a worktree by
  hand. It took three tries today and two of them were wrong for reasons that
  had nothing to do with the code.

## Longed for

- The exit codes to be one list in one place. The vocabulary is on the
  surface page as prose, and now three modules compare against the numbers in
  it; nothing makes them agree except that somebody read the page.

Feeds: code
Read: test
