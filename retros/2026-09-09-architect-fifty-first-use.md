# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-first use of the architect skill, on
`requirements/a-diff-carries-one-seat` (five seams, seven criteria, the guard
that stops a seat grading itself), 9 September 2026.
Place: this repository

## Liked

- The isolations found the weak one. Seven breaks, and the sixth reddened
  nothing: seam 5 was passing on seam 3's finding, because a crossing names
  the same path a proof finding names and the test read them together. The
  break that answers nothing is the one worth chasing, and this is the second
  time narrowing a seam to its own kind of finding is what fixed it.
- Reusing the class wall's git reader was right and the build showed exactly
  where it stops. One import, and one honest exception written down.

## Learned

- Two walls can share a reader and not share what a diff is. `changed` reads
  tracked files only and says why: a file git has never seen is not yet part
  of the change the class wall measures. That is correct there and wrong
  here, because a new acceptance test is untracked until somebody adds it and
  is the whole of what this guard exists to notice. The decision record now
  carries the exception rather than the reuse alone.
- A rename is one act and a diff is two paths. `changed` passes no rename
  flag, so moving a unit case beside its code reads as the tester losing a
  file and the developer gaining one, which would refuse the very move the
  seat rule exists to cause. The module pairs a removal with an addition by
  content, and the drawing fixes that rather than leaving it to the build.
- The escape and the crossing are different questions and the fixture proved
  it. A build that must move another task's proof is doing analyst work: the
  supersede makes it legitimate and does not make it one seat, so it is still
  two diffs. That is the ask read back to itself.
- Three times today a `str.replace` did nothing because its anchor had been
  reformatted, and twice I did not notice until a later run answered
  strangely. An edit that silently does nothing is the same family as a test
  that silently passes, and the habit that fixes it is the same one: assert
  the anchor before writing.

## Lacked

- No fixture shape for a git repository, still. The last architect retro
  named it and this drawing needed it again, this time in contract tests as
  well as acceptance tests. Two files now carry the same forty lines of
  scratch repository helper.
- Nothing in the skill about a seam whose finding shares a name with
  another's. Two of my last three drawings had a seam passing on a
  neighbour's output, both found by an isolation and neither by reading.

## Longed for

- A rule that a contract test reads only the findings of the seam it is
  about. It has now been the fix twice and it would have been cheaper as a
  habit than as two discoveries.
- The scratch repository helper as something a fixture can be rather than
  something each test file writes again.

Feeds: architect
Read: test
