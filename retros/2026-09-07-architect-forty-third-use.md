# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-third use of the architect skill, drawing
`the-board-counts-the-reads`, three seams and three contract tests,
7 September 2026.
Place: this repository

## Liked

- The seam that broke the analyst's stand-in became seam 1, drawn as what
  it is: two readers of the same argument that must agree a flag is not a
  directory. A defect found the day before became a promise with a test,
  rather than a fix somebody remembers to keep.
- The third decision bought exactly what it said it bought, and the
  isolations proved it. The contract runs the command the config names
  rather than reading the entry, so renaming the gate and reshuffling it
  redden nothing while removing it reddens the contract; the acceptance test
  holds the spelling `--check` and reddens when the flag is dropped. Two
  layers, two promises, no overlap.
- Writing the gap the second decision opens as a named task,
  `an-argument-is-read-once`, with the condition that reopens it: a third
  command taking a flag. The rule is written three times now and the third
  copy is where a fourth becomes a pattern rather than a repetition.

## Learned

- A gate's command is written for the tree it gates, so a contract cannot
  run it anywhere else unchanged. The command names `bin/kaal.mjs` by a path
  relative to the league, and running it inside a fixture found no binary at
  all. The contract runs it from the league and passes the fixture as the
  root, which is the only way to drive the configured command against a tree
  that should fail it.
- Two isolations that redden nothing are two isolations that prove a
  decision. Renaming the gate and reshuffling it are Free in the drawing,
  and the contract staying green is that freedom being real rather than
  asserted. This is the first drawing where a no-op isolation was the
  answer rather than a question.

## Lacked

- Nothing says how a contract should drive a command the config owns. This
  drawing decided it by hand: split the command, insert the root after the
  subcommand, run from the league. A second wall wanting the same proof will
  invent it again.
- The drawing has no way to say that a promise is split across two layers.
  Seam 3's promise is held by the contract and its spelling by the
  acceptance test, deliberately, and the strategy table has one row per
  criterion with one kind in it.

## Longed for

- A row in the test strategy table that can name two layers for one
  criterion, so a promise deliberately held in two places reads as a design
  rather than as a duplicate.

Feeds: architect
Read: test
