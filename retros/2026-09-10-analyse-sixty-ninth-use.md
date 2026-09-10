# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the sixty-ninth use of the analyse skill, one assertion removed from
`a-trace-pins-what-it-read`'s second test so that the task superseding it can
be built, 10 September 2026.
Place: this repository

## Liked

- The collision was found by reading the superseded test before writing any
  code, rather than by a red board on the build branch. The build has not
  started and already knows what it may not break.
- The fix is one assertion and no criterion. Amending the criterion's text
  would move the region the architect's drawing pins, and a tree where that
  is a red board is the tree `a-pin-says-who-cleared-it` exists to end. Going
  around it would have meant either a waiver or the deadlock itself.

## Learned

- A test can assert more than its criterion says, and nobody notices until
  something supersedes it. Criterion 2 asks that a moved pin be reported,
  naming the artefact, the kind, the name and the region, and says nothing at
  all about an exit code. The test asserted `status === 1` anyway, which is
  criterion 6's claim smuggled into criterion 2's test, and criterion 6 is the
  one being superseded.
- So a supersede does not always land where it is declared. This one names
  criterion 6 and the thing that blocks the build is criterion 2's test, one
  line that borrowed 6's claim. Reading the criteria and not the tests would
  have missed it.
- The report has to keep saying more than the new criterion asks. The new one
  wants the artefact, the kind, the name and the state; the old one wants the
  region and the word moved, and the constraint says everything else it says
  still stands. A line naming all five is what makes both true at once, and
  that is now owed with the build.

## Lacked

- Nothing checks that a test asserts its own criterion and no more. The
  acceptance wall counts criteria and tests and compares the numbers, which
  catches a criterion nobody proved and never a test proving somebody else's.
- A supersede declares a task and not a claim. `supersedes:` names
  `a-trace-pins-what-it-read` whole, when what is superseded is its sixth
  criterion; the handoff prose says so and no wall reads prose.

## Longed for

- A way to ask which tests read a criterion. Answering "what breaks if this
  criterion changes" took a grep and a read of six tests, and the tree
  already pins regions by sha, which is most of what such an answer needs.

Feeds: analyse
Read: analyse
