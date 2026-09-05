# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twentieth use of the architect skill, on
`architecture/eval-runner` (one module, one command, one generated file),
5 September 2026.

## Liked

- The fixture is a skill with one reference and a two-item checklist, and
  the three contracts read the document by position: skill before
  reference before ask, items before `Output:`, the shas in the last block.
  Nothing in the contracts knows the framing sentences.

## Learned

- A fenced block in the document is only a block until the skill inside
  it carries a fence of its own; the analyse skill does, and the first
  render split into five blocks and let the formatter into the middle.
  The fence is now one backtick longer than any run inside, and the tests'
  block reader closes a block only at its own fence. Neither the drawing
  nor the requirement foresaw it; a fixture whose skill carries a fence
  would have.

## Lacked

- A fixture with a fence inside the skill, so the seam is held by a
  contract rather than by the league's own skill happening to have one.

## Longed for

- Nothing new.

Feeds: `architect`.
