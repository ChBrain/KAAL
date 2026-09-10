# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-ninth use of the code skill, building
`a-diff-carries-one-seat` across three diffs because the guard it builds says
so, 10 September 2026.
Place: this repository

## Liked

- The build split itself, and the rule that split it is the rule being built.
  `kaal.config.json` is governance's, so the declaration could not travel with
  the module; the gate could not land before the module it runs; and the
  module was useless before the declaration. Three diffs fell out of that with
  nothing left to argue about, and the third one is the guard judging itself.
- Every decision the drawing fixed was needed. The rename decision fired on
  the first build, the environment variable is the only reason the wall runs
  in CI, and the matcher's two wildcards are what let the config be read at a
  glance. Nothing in the fixed list went unused, which has not been true of
  the last three drawings.
- The exit vocabulary was checkable in four commands and I ran all four before
  pushing: a lane, an unresolvable ref, a detached HEAD with nothing set, and
  a detached HEAD with the variable set. The fourth is the case CI actually
  runs and the only one I could not have reasoned my way to.

## Learned

- A guard that governs its own declaration cannot be installed in one move.
  The bootstrap is not a wart, it is the guarantee: if the wall and the list
  it reads could land together, a build could always have written its own
  permissions. Three diffs is the cost of that, and it is the cost the ask
  bought on purpose.
- The first thing the rename decision met was the build that shipped it.
  `tests/applies.test.mjs` had to be edited because its count of guarded
  commands went from thirteen to fourteen, and editing a unit case in the
  tester's directory is a finding. So it moved, and the guard read the move as
  one act. I did not plan that: the wall told me by refusing.
- A wall's own line has to distinguish two things a reader will conflate. The
  seat lines are about the diff and the findings are about the lane, so this
  build's own run printed `seat tester` beside exit 0. That is right and it
  reads wrong for a second, and the only reason it is defensible is that the
  contract test asserts exactly that pair.
- The units wall's glob is a declaration too. Adding `bin/lib/*.test.mjs` to
  it broke `tests/plans/units.md`, which names the suites the wall runs, and
  the plans are shared for precisely that reason. A rule I wrote as a
  concession paid for itself two diffs later.

## Lacked

- Nothing tells a build how many diffs it is. The drawing's handoff said what
  was owed with the build and the lane rule said those things could not
  travel together, and reconciling that was mine to do with no rule to read.
  A drawing that fixes a lane should be able to say the build is three.
- No name for a diff that exists to make another diff possible. The first of
  the three declares something nothing reads yet, which reads as dead code in
  a config and is really a bootstrap step.

## Longed for

- A way to run the guard against a diff that does not exist yet. I checked
  every lane by building scratch repositories in a contract test, and the
  thing I actually wanted was to ask "would this set of paths pass on that
  branch" without a repository at all.
- The other twenty suites. One moved because the wall forced it, and the other
  twenty sit in the tester's directory until somebody moves them on purpose.
  The guard now makes each one a finding the moment it is touched, which is a
  queue that will drain itself one edit at a time and never all at once.

Feeds: code
Read: architect
