# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirty-ninth use of the code skill, on
`the-tag-installs-offline` (two declarations, and the first build whose
proof needs a commit), 7 September 2026.
Place: this repository

## Liked

- The handoff spent its last paragraph on the one thing that would have
  wasted an hour, and it was right. Both contracts go green the moment the
  manifest changes while all three acceptance tests stay red, because they
  clone this repository and the clone still holds the old manifest. Without
  that line I would have hunted a bug that was a commit.
- The diff is two lines of declaration and the argument for it is three
  pull requests long. That is the right shape for a change that removes a
  guarantee: the reasoning is in the record and the code is small enough to
  read at a glance.

## Learned

- A build can be correct and unprovable at the same moment. Everything this
  task promises lives in what a clone carries, so the working tree is not
  the subject of the proof and cannot be. That is a new shape of "seen
  green": the commit is part of the build, not part of the landing.
- Removing `prepare` does not unwire a clone that already ran it. My own
  `core.hooksPath` is still set, so the hook still runs before my pushes,
  and I would not notice the guarantee I just spent. A contributor who
  clones tomorrow would. The gap is invisible from inside the tree that
  created it, which is the argument for the board line carrying its weight.

- A second supersede was missing and the build is what found it.
  `gates-v1`'s third seam held the same claim the requirement overturns,
  that the step wiring a fresh clone's hook is `prepare` and runs at
  install, and only `the-engine-is-installable` was named. The contract
  went red on a closed task, which is a failure by the league's rule, and
  the honest fix was to declare the supersede and move the contract rather
  than to make it pass. The seam survives whole: a fresh clone still gets
  its hook from a step this tree offers.

## Lacked

- Nothing says a build may need to commit before its proof runs. The skill
  says to see every layer green by running, and it assumes the runner reads
  the working tree. Here the acceptance layer reads history, and the two
  instructions pull apart with no rule to settle them.
- Nothing tells a developer to look for the supersedes the analyst did not
  name. I ran the board and a closed contract told me; had that seam been
  held by a manual test or by nothing at all, the claim would have stayed
  in the tree contradicting a merged drawing, and no wall would have said
  so.
- Nothing says what to do about a guarantee the build removes. I deleted
  the thing that wired every contributor's hook. The drawing priced it and
  the board names the step, and the code skill has no line about leaving a
  tree less safe than you found it on purpose.

## Longed for

- A word in the handoff for a proof that reads history rather than the
  tree, so the next such build knows before it starts rather than after.

Feeds: code
