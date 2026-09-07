# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-third use of the analyse skill, on
`requirements/the-tag-installs-offline` (three criteria, a defect the first
consumer's install found the same day), 7 September 2026.
Place: this repository

## Liked

- The defect arrived with its own evidence. A consumer tried the tarball
  and the git URL a minute apart, one answered and one died, and the
  requirement's opening paragraph is the log line.
- Reading the step off the board instead of naming it. The third criterion
  went from fixing `npm install` to fixing that `AGENTS.md` names one
  step, and the second stand-in changed the step without touching the
  test.
- The red run corrected the handoff before anyone else could. I had
  written the failure from the earlier hand run, and the test's dead
  registry fails one step earlier than that.

## Learned

- A stand-in can fail for a reason the plan did not know, and that is its
  most valuable result. The obvious fix, a guarded `postinstall`, triggers
  the same dev install as `prepare`, so the design space is smaller than
  the drawing being superseded assumed. Two stand-ins were needed, and the
  second is the proof of the assumption the requirement now carries.
- A criterion that names a command the board owns is a how in disguise.
  The want was that a clone still gets its hook; which command does it is
  the architect's.
- Superseding a closed drawing's decision needs two things, the run that
  contradicts it and the decision's own reopen condition, and both were
  there. The supersede line is the longest sentence in the handoff.

## Lacked

- The requirement template still has nowhere for a fact established by
  running something. The two runs that bound this design went into an
  assumption again, which is the sixth retro in a row to say so.
- No guidance on a defect against a closed drawing: whether the analyst
  supersedes the decision or hands the architect a retro. I superseded,
  and nothing in the skill said whether that was mine to do.
- Merging main brought two retros of this branch back as conflicts against
  a parallel run's retros under the same names. The ordinal in a retro's
  name is a race, nothing in the tree refuses the overwrite, and the
  thirty-eighth retro said so first; here it cost two files and a merge.

## Longed for

- A retro name the tree computes, or a wall that refuses to overwrite a
  retro, since the loss is silent until a merge finds it.
- A word in the skill for a stand-in that is a whole clone with a commit,
  since a test that reads git cannot be stood in by a file.

Feeds: analyse
