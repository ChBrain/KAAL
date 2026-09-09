# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the sixty-first use of the analyse skill, on
`requirements/the-test-tree-is-written-down` (six criteria, six red tests),
9 September 2026.
Place: this repository

## Liked

- The three plans were read off the board rather than proposed. The ask said
  requirements, architecture and code motivate three plans; the config's
  first three gates are acceptance over the requirements, contracts over the
  architecture and units over the code. The task invents nothing and names
  what already runs.
- The numbers made the case on their own: 128 suites, 266 acceptance cases,
  145 contract cases, and above them no document at all. A tree entirely
  built and entirely unwritten is a sentence that needed no argument once
  the counts were on screen.

## Learned

- The per task Test strategy sections are not the strategy. Fifty drawings
  each carry one, which is fifty local answers to how one task is tested and
  no answer to why the league tests three ways. I nearly counted them as the
  document existing; they are the strongest evidence that it does not.
- A criterion that asks two texts to agree needs both directions or it is
  half a check. Criterion 4 asks that every wall has a plan and every plan a
  wall, and the second direction is the one that catches a plan for a wall
  somebody deleted. The surface page's criterion 4 is the only other both
  ways check in the league and it was written for the same reason.
- A rule stated in prose still needs its because. Criterion 2 asks the
  strategy to say that what cannot be tested cannot be built and also why,
  which is that nobody would know whether it were true. Without the second
  half it is a slogan a reader can disagree with and no test can tell the
  difference.

## Lacked

- No word in the skill for a task whose subject is a document nobody owns.
  The analyst tests requirements, the architect seams, the developer units,
  and the question of why there are three belongs to none of them. It went
  into an open question because there was nowhere else.
- Nothing about naming a place for a new kind of artefact. The strategy and
  the plans need a home, `tests/` is where the test tree's files are and is
  not obviously where its documents go, and the requirement had to name a
  path and then apologise for it in an open question.

## Longed for

- A way to ask the board which of its gates are about the product and which
  are about the tree. Three gates have a plan under this task and nine do
  not, and whether those nine want plans is a question the requirement had
  to leave open because nothing distinguishes them.

Feeds: analyse
Read: test
