# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-ninth use of the analyse skill, amending
`the-test-tree-is-written-down` where `a-suite-names-its-cases` supersedes it:
criterion 3's third clause and criterion 6's second, 11 September 2026.
Place: this repository

## Liked

- The amendment says on that task's own page what it lost and why, rather than
  deleting a clause and leaving a reader of the older text to wonder. Its own
  open question, whether a plan holds a count that goes stale or a glob that
  does not, is answered by neither, and the page now says so.
- Both tests are green on main before the pages they read have moved, so the
  diff that moves them lands without a red wall in between. That ordering is
  now the third time this task has needed it.

## Learned

- I replaced the Handoff's `- Supersedes:` line instead of adding beside it,
  and the trace wall caught it at once: a requirement's Supersedes prose must
  mention every name its trace declares, and this task supersedes
  `a-tree-has-one-root`. The wall was right and my edit had quietly dropped a
  claim that is still true. `Superseded in part by` is a different line and
  belongs beside the old one, not on top of it.
- Amending a criterion moves two pins, not one. The requirement's own
  `supersedes:` pin in the task that supersedes it, which is this seat's and
  is recorded here, and the drawing's `requirement:` pin, which is the
  architect's and is left owed. One edit to a criteria region reaches two
  other lanes, and only one of them is mine to close.

## Lacked

- No word for a criterion that is superseded in part. The trace grammar says a
  task supersedes a task; the prose here has to carry which clause of which
  criterion, and a reader has only prose to go on.
- Nothing tells a seat which pins its edit will move before it makes the edit.
  Both of today's were found by running the wall afterwards, which is cheap
  here and would not be on a tree where the answer took an hour.

## Longed for

- A `traces --what-moves <file>` that answers which pins an edit to a region
  would put in review, before the edit. It is the same walk the wall already
  does, run forwards.

Feeds: analyse
Read: architect
