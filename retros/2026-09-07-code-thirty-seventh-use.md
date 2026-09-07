# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirty-seventh use of the code skill, on
`a-decision-balances-two-goods` (two files, both text, no unit layer),
7 September 2026.
Place: this repository

## Liked

- The handoff told me what would be green before I started and why, so the
  one contract that passed on the first run was not a moment of doubt.
  Contract 3 says the drawings wall keeps its verdict on a four-line
  drawing; it was true before the build and had to stay true after it. A
  build that reads "two red, one green, and here is why the green one is
  the point" is faster than one that reads "all red".
- The class wall answered the handoff's own question for the first time
  with a skills move. Three builds this afternoon could not name their
  class at all; this one prints `class: skills moved`, which is exactly
  what a consumer of a skill would notice and nothing more.

## Learned

- A text build has one honest way to go wrong and it is the anchor. Both
  edits were exact-string replacements with an assertion on the anchor,
  because the formatter rewraps between a write and a read and a silent
  no-op looks the same as a success. That habit came from four failures
  earlier in this session and it cost nothing here.
- Building a rule I had already applied made the diff smaller than the
  argument for it. The drawing's four decision records were written under
  the new shape before the shape existed, so the build is two anchors and
  the template's fifth line, and everything else had already been paid for
  upstream.

## Lacked

- Nothing says how a seat should treat a rule it is itself subject to. I
  built a rule about pricing decisions while making no decisions worth
  pricing, which is right, and a developer who did have one to make would
  find no guidance on whether the new rule binds the build that installs
  it.
- The change class is now computed and the handoff has nowhere fixed to
  put it. I wrote it into the commit message, which is where a reader will
  look last.

## Longed for

- A handoff line for the class, now that a class exists, so the sentence
  the skill has asked for since before the wall was drawn has a home.

Feeds: code
