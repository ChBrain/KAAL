# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirty-third use of the analyse skill, on
`requirements/nothing-passes-vacuously` (three criteria, and the first
task here that supersedes a closed one), 6 September 2026.
Place: this repository

## Liked

- The ask removed a concept instead of adding one. I had proposed an
  instance of the league, a second tree carrying the engine's shape; the
  question "any chance without a second repository" was right, and the
  requirement got smaller for it. There is one engine and many roots.
- Three of the four commands were already able to take a root: their
  modules have taken one all along and only the entry point passed the
  working directory. The change is smaller than the problem sounded.

## Learned

- A closed task's tests are where a design actually breaks, not its
  criteria. `applies-here` says nothing in its criteria about these four
  commands; its unit test names them in a list of commands the table does
  not name. That is the second time today a closed test rather than a
  closed criterion decided a design, and the first time I have superseded
  one rather than given way.
- The difference between the two cases is the closed task's own stated
  principle. `code-v2` had a reason that pushed against guarding
  `fixtures`, so my criterion gave way. `applies-here` guarded the
  commands that judge a tree against a league artefact, and these four do
  exactly that; they were left out because nothing ran them outside the
  league yet. The principle brings them in, so the supersede is honest
  rather than convenient.
- A crash and a vacuous pass are one defect in two costumes. Two of the
  four exit 1 today on a bare root, which reads like a wall that ran.

## Lacked

- The skill says to read the closed requirements whose criteria touch the
  path. It says criteria. Twice today the thing in the way was a test, and
  both times I found it by grepping on a hunch rather than by following
  the skill.
- Nothing tells an analyst how to supersede. The requirement template has
  a `Supersedes` line and no guidance on what belongs in it, so I wrote
  the exact list of what moves and hoped that is the right grain.

## Longed for

- A reading that lists, for a path or a command I am about to change,
  which closed tests name it. This is the third retro today asking for the
  same thing from a different seat.

Feeds: analyse
