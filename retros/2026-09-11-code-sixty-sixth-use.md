# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the sixty-sixth use of the code skill, putting back the wall rule an
earlier diff of mine dropped, 11 September 2026.
Place: this repository

## Liked

- The unit was red before it was green, and red on the branch it guards. Six
  lines of `else if` and a case that fails without them is the whole of this
  diff, which is what a regression should cost.
- The finding names the wall and neither page, unchanged from how it read
  before it went missing. A pair is the fault and a page that is right on its
  own should not be told otherwise.

## Learned

- I deleted this rule in a diff about something else and wrote no word about
  it. The branch was `build/*`, the board was green, and three pull requests
  went by. A refactor that removes a branch removes a promise, and nothing in
  this tree reads a diff for what it stopped doing.
- Green is the same word for two different things. The suite that guards this
  rule was red the whole time, and the board said `not delivered` because the
  task had no fresh record, which is an answer and not a failure. The verdict
  was right about the tree and wrong about my confidence in it. A task whose
  record is stale is a task the board has stopped asking about, and it does
  not say how long it has been that way.
- The surface already promised the rule in a sentence that could be read two
  ways. `has one plan` was meant as exactly one and reads as at least one, and
  the reading that survived the refactor was the weaker one. It now says
  `no more and no fewer`.

## Lacked

- Any signal on a stale record's age. One day stale and three months stale are
  the same line today, and the second is a suite nobody has run since.

## Longed for

- A wall that reads what a diff removed, not only what it left. Every rule in
  this tree is a branch somebody can delete in a diff about something else.

Feeds: code
Read: test
