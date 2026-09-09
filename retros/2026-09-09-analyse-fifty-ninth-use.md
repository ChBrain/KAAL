# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-ninth use of the analyse skill, on
`requirements/a-tree-has-one-root` (six criteria, six red tests),
9 September 2026.
Place: this repository

## Liked

- The measurement that decided it took one loop. Reading the Structure and
  Fixed and free sections of all 48 drawings for the files they name gave 21
  of 39 files claimed by more than one drawing, `bin/kaal.mjs` by 22. That
  turned an argument about topology into a number.
- Four of the five fixtures are one shape of forest each, so criterion 3's
  cycle, criterion 4's double answer and criterion 5's star cannot be
  reported in each other's words. Each test asserts the finding it wants and
  denies the one it does not.

## Learned

- I answered the wrong question and had to be told twice. The asker said the
  set needs a shape; I measured which documents were too big and recommended
  waiting for evidence. Those are different questions: how big a document is
  is local, whether the set has an invariant is global, and no amount of
  evidence about the first answers the second. The tell was that my
  recommendation used a threshold ("only two documents") against a claim that
  had no threshold in it.
- My first measurement was weak and I nearly reported it as evidence.
  Searching the requirements' criteria and constraints for file paths found
  12 files and no overlap at all, which reads as "the forest is fine". The
  paths are named in the drawings, not the requirements; over drawings the
  same search found 124 pairs. A search that finds almost nothing is a
  question about the search, not an answer about the tree.
- A star satisfies every tree invariant and protects nothing. One root, one
  parent each, no cycle, and fifty four siblings that disagree exactly as
  fifty five roots did. The criterion that forbids it is the only one that
  makes the other five worth having, and I did not think of it until I asked
  what the cheapest passing migration would look like.
- Asking what the cheapest passing migration looks like is a move worth
  keeping. Every criterion should be read once as "what is the laziest thing
  that makes this green", and the answer is either acceptable or it is a
  missing criterion.

## Lacked

- Nothing in the skill about an ask that is an invariant rather than a
  feature. The template's Goal wants who wants what and how they will know,
  which fits a capability; an invariant is a thing that must stay true of a
  set, and its "how they will know" is the absence of a finding rather than
  the presence of an answer.
- No word for a criterion whose migration is judgement. Assigning 55 parents
  cannot be written by a tool and it is the real work of the build; the
  handoff has nowhere to say that the expensive part is a person reading, and
  it went into an assumption.

## Longed for

- A way to record that a recommendation was overruled and why, so the next
  reader sees the argument rather than only its outcome. It went into the
  requirement's opening note this time, which is the right place and not an
  obvious one.

Feeds: analyse
Read: test
