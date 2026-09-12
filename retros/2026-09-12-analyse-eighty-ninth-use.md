# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the eighty-ninth use of the analyse skill, stating that a wall which
does not apply reports, 12 September 2026.
Place: this repository

## Liked

- The block was found sideways and proved in one command. Checking whether a
  dependency update could take the asker's road turned up that the promotion
  cannot take its own, and `promote --into main --from release` answering
  `2 red wall(s) on the board` and exiting 1 settled it before a word of the
  requirement was written.
- Three correct pieces, one wrong seam. The seat rule declining to judge a
  promotion is right, the board refusing a wall that cannot run is right, and
  the promotion refusing a red wall is right. Nothing here is a mistake
  anybody made; it is the space between three decisions, which is the kind of
  defect no single reader was ever going to see.

## Learned

- An exit code is a vocabulary and a caller can flatten it. The surface page
  states three codes and what each means, and `ok: r.status === 0` collapses
  two of them into one. A vocabulary that is published and then read as a
  boolean is a vocabulary in one direction only.
- A criterion's proof can carry the words of its own opposite. Criterion 4
  first asserted that `red wall(s) on the board` does not appear, and
  `promote: 0 red wall(s) on the board` is the right answer carrying exactly
  those words. Asserting the count is what makes it read. That is the fifth
  time in a day that the test was wrong rather than the code.
- The naming script is deterministic in a tree and not across branches. It
  answered the same ordinal on two branches in flight, correctly, because
  each reads its own tree. The collision it retires is within a tree, and the
  one between branches is settled at the rebase, by running it again.

## Lacked

- Anything that reads a seam between two closed tasks. Both claims are
  written down, both are tested, and the contradiction between them is
  tested by neither.

## Longed for

- A case that runs the promotion. Item 13 is the first time anything will,
  and the first run of it found a block that has been there since the
  promotion was built.

Feeds: analyse
Read: architect
