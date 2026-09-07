# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fortieth use of the architect skill, on
`architecture/the-tag-installs-offline` (two seams, two declarations,
reversing a decision of my own), 7 September 2026.
Place: this repository

## Liked

- The decision being reversed was written well enough to reverse itself.
  `the-engine-is-installable` named the mechanism correctly, priced the
  trade as a contributor's hook against a consumer who did not exist, and
  wrote the reopen condition as a consumer needing an offline git install.
  A consumer arrived and the record told me what to do. That is the whole
  argument for decision records in one paragraph.
- The third record buys nothing on purpose. Someone will ask why no wall
  watches whether the step was run, and the honest answer is that a wall
  would be green in CI, which never pushes, and green on a machine only
  after the thing it guarantees already happened. Writing "this buys
  nothing, and that is the point" was possible because the record now has a
  place to say what a choice costs.

## Learned

- The acceptance proof needs a commit and nothing said so. Its tests clone
  this repository, so a working tree carrying the fix proves nothing: the
  clone still holds the old manifest, and the test that reads the board off
  the working tree runs a step the clone has no script for. Both contracts
  go green while all three acceptance tests are red, which reads like a
  broken build and is an uncommitted one. I only found it by committing a
  stand-in and discarding it, and it is now the handoff's last line.
- A stand-in for a change to a manifest is not proven by editing the
  manifest. Everything about this task lives in what a clone carries, so
  the stand-in had to become a commit to be a stand-in at all. That is a
  new shape of the same rule and the skill only knows the file-level one.

## Lacked

- Nothing tells a seat what to do with a claim that arrives from a run it
  cannot see. The requirement I drew from asserted a failure mode that two
  of my runs contradict, and correcting it was the analyst's work before
  this drawing could start. The ladder has a word for handing a criterion
  back and none for a fact that is simply wrong.
- The drawing template still has nowhere for a fact established by running
  something, which is now the eighth task in a row. Three facts decided
  this drawing and all three are prose a reader has to trust: what npm does
  with an install-lifecycle script, that the git install succeeds online,
  and that the acceptance proof needs a commit.

## Longed for

- A place in the template for the runs a drawing rests on, since a decision
  that names its own reopen condition is only as good as the evidence that
  the condition has arrived.

Feeds: architect
