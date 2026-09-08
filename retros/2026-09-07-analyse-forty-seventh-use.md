# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-seventh use of the analyse skill, on
`requirements/a-drawing-shows-its-ground`, a run over a stack of eleven,
7 September 2026.
Place: this repository

## Liked

- Two stacks read an hour apart reached the same verdict about the same
  missing place, and neither knew what the other would say. That agreement
  is worth more than either stack's count, and writing it into the
  assumptions rather than the goal keeps it as evidence rather than as a
  claim.
- The ordering between the two tasks was removed by fixing three words in
  a criterion instead of pointing at the other template. The cheaper move
  and the one that keeps both tasks free to land in either order, which is
  the second of the two goods bought for nothing on the first.

## Learned

- An alternation is not a word boundary and neither is enough on a page you
  just widened. `/gap|closes|opens/i` was green because `closes` matched
  inside `forecloses`, in the rule about pricing a choice that landed in
  this same skill two tasks ago. The half held nothing. Two assertions with
  `\b` around each word found the truth, and the lesson is that a pattern
  read against a whole section is a pattern that can be satisfied by any
  sentence in it.
- Sixth isolation, sixth run, and it was the isolation that bit rather than
  the stand-in. Two stacks in a row now where the full stand-in was green
  and a partial one exposed a test that was not holding its half. Breaking
  one thing at a time is not a formality on top of the stand-in; it is the
  part that finds the defect.
- A regex assumption cost a second pass on the reader itself: `bullets()`
  cut every bullet to its first line, because `$` under `m` stops at the
  wrap the formatter chose rather than at the end of the item. The tests
  that read folded text were right to fold; the one that split them was not.

## Lacked

- Still nothing about a stack's items that belong to another skill, and now
  nothing about the order of stacks either. The code skill sits at nine, one
  short of the line, so a third run is already queued behind these two and
  the rule says only when a stack fires, never which fires first or what a
  run does when a second stack's subject turns up in its own reading.
- No cheap way to assert against a named section. Every test here folds the
  whole document and matches a pattern, so a pattern is only as honest as
  the region a human remembered to slice first, and twice this week it was
  not sliced at all.

## Longed for

- A helper for acceptance tests that takes a heading and returns that
  section alone, and fails loudly when the heading is absent rather than
  matching the rest of the page. Both green-for-the-wrong-reason defects
  this week die at that helper.

Feeds: analyse
