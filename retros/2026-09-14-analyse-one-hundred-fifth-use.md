# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the one-hundred-fifth use of the analyse skill, stating
`a-block-follows-a-declared-edge` after the asker gave the eight edges of the
dependency flow between seats, 14 September 2026.
Place: this repository

## Liked

- Mutating the stand-in found a weak test, and it is the practice worth
  keeping. The stand-in went green first time, which says nothing on its own,
  and five mutations turned that into evidence. One of them, reading the edge
  backwards, left criterion 3 green: its fixture was forbidden in both
  directions, so it could not tell a correct wall from a reversed one. The
  fixture is now legal one way round and the mutation reds it.
- The two criteria that were green before the build were caught and fixed
  rather than excused. "This is not a finding" passes on a tree where nothing
  is a finding, and the skill's own rule for absence, assert the run did its
  work and then assert the effect is absent, is what the fix is: each fixture
  now carries one block the wall must refuse, so the silence about the other
  means something.
- Counting the ask to two held up even after the ground moved. The split
  between "which edges may exist" and "do the standing blocks close a ring"
  is a real seam whichever base it is read on.

## Learned

- A sentence of prose in a requirement consumed a retro. Explaining the
  rebase conflict meant quoting the other lane's retro path, and a
  requirement page naming a retro's filename is exactly how this tree
  declares that retro consumed. The `analyse` count went from 61 to 60 and
  `a-requirement-shows-its-work` criterion 5 went red, on a page that had
  said nothing about consuming anything. Naming the ordinal instead fixed
  it. A declaration that is made by mentioning a filename cannot tell a
  citation from a claim.
- Two analyst lanes open at once collide on two things, and both are
  bookkeeping rather than work. This page was filed as the one-hundredth use
  and `an-operator-verifies-controls-outside-the-tree` landed the same
  ordinal first, so the rebase was an add/add conflict on a filename; and both
  lanes add a line to the one shared acceptance suite, so the plan pins over
  that suite move under whichever lands second. Neither is a disagreement
  about anything. The ordinal is derived from what is filed, so it is correct
  only until somebody else files, and the retro's identity is decided before
  the merge that decides what it collides with.
- I read the wrong branch and wrote a whole requirement against it. `main` is
  what a consumer installs and `release` is where the work happens, and
  `release` was twenty one merges ahead. The first page said nothing in this
  tree records a block, which was true three days ago; on `release` there are
  six backlog pages, a `kaal backlog` command, four declared kinds and the
  doctrine table. Everything in the ask that I called unstateable was
  stateable, and the second task changed from "cannot be written yet" to the
  cycle question alone.
- What gave it away was not reading. It was a workflow failure on a push and
  a list of other people's runs, which showed merges landing on a branch I
  had not looked at. Reading `AGENTS.md` at the top of the session would have
  said it in one line, and I read the copy on the stale branch.
- A finding nothing runs is not enforcement. `kaal backlog` exists and is on
  no wall, so the refusal this task asks for needed a gate as a criterion and
  not as an afterthought. Checking that a standing block still exits 0 was
  what made that safe to ask for.
- Enforcing an edge that cannot be written enforces nothing. Three of the
  eight edges have no block kind that can express them, because all four
  kinds resolve into the analyst's, the architect's or the tester's tree.
  That is in the page as an open question rather than as an invented kind.

## Lacked

- Nothing about an identity that only holds until somebody else merges. The
  naming command is explicitly the way to avoid two retros claiming one
  ordinal, and it answers correctly for the tree it is run in; with two lanes
  open it cannot answer for the tree that will exist. Rebasing and rerunning
  the command is what fixes it, and the skill does not say so.
- Nothing in the skill about which branch the tree's truth is on. It says to
  read the closed requirements whose paths the task touches; it does not say
  to check that the checkout is the branch the league works on, and every
  fact in step 1 is wrong if it is not.
- No rule for mutating a stand-in. The skill says a stand-in finds tests red
  for the wrong reason; it does not say what to do when the stand-in finds
  nothing, which is when a test that cannot fail is most likely to survive.
- Nothing about a criterion whose subject is an absence of a finding. The
  absence rule is written for a criterion about the system doing nothing, and
  a criterion about the wall saying nothing needs the same witness and is not
  named.

## Longed for

- A way to say "this criterion holds until the answer to open question 1
  arrives". The ninth edge is one line in a declaration and the page carries
  it in three places as prose.
- Something that reads the ask's vocabulary against the tree's. The ask says
  Coder and the tree says developer, and that assumption is made in prose in
  every requirement that touches a seat.

Feeds: analyse
Read: analyse, retro-4ls
