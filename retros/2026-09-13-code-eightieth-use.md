# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the eightieth use of the code skill, building the road a dependency
update takes, 13 September 2026.
Place: this repository

## Liked

- The drawing's build order held exactly as written. The matcher first, then
  seam 1, then 2 and 3 together, and nothing had to be undone. Four
  mutations, four reds, each on the contract that owns it, first attempt.
- The whole build is one import, one branch, one constant and five lines in
  the command. The drawing predicted that cost before a file was touched,
  and the stand-in is why: the shape was proven somewhere disposable before
  it was written anywhere durable.

## Learned

- **A drawing can fix a seam that the code cannot see all of.** Seam 2 says a
  target opening into a target is the sync, but `laneOf` reads a branch and
  never a base, so it cannot tell the sync from a push to `main` after a
  merge. Built as drawn, it turned `a-diff-carries-one-seat` criterion 4 red:
  the board runs on every push to `main` and answered `not applicable` where
  a closed task holds that it answers clean. The base lives in the command
  and nowhere else, so that is where the second half of the condition went.
- The closed case found it, and reading would not have. I read the drawing,
  the contracts and the criteria for this task, and none of the three says
  anything about a push to a target. What said it was a proof written for a
  different task nine days ago, running on the board. A criterion is what
  someone chose to say; a test is what is actually held, and the second
  caught what all the first ones missed.
- Two contracts can both be satisfied and still disagree about a word.
  Contract 2 drives `laneOf` with a branch and no base and demands the answer
  `sync`; the closed criterion demands that the same branch, with itself as
  the base, is not declined. Both hold only because the field means "this
  head is a target" and the command means "and it opens into another one".
  The name overclaims by exactly the distance between the two, and the
  comment in the command is the only place a reader is told.

## Lacked

- Any signal, before the board ran, that a change to a shared reader reaches
  a closed task's proof. The regression wall named it, which is what it is
  for, but it named it after twelve minutes of walls rather than at the seam.

## Longed for

- A way to ask which cases read a given function. The import graph would
  answer it, and this is the second retro in two builds asking for the same
  thing.

Feeds: code
Read: architect
