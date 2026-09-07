# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the twenty-fourth use of the architect skill, on
`architecture/assess-boundary` (the write boundary of external mode), 6
September 2026.

## Liked

- Reading the closed requirements first, which this morning's build made
  a rule, took one minute and put three of them in the drawing's opening:
  the workflow permissions rule (nothing to do here), the board's line
  shapes, and eval-runner's byte comparison on a generated document,
  which is what the descriptor is.
- Three decisions, and each closed a door the developer would otherwise
  have opened by habit: the guard outside the tree it guards, the refusal
  before the read, and git read from its files rather than spawned.

## Learned

- The requirement's tests could all have passed on an assessor that never
  resolved anything, since each accepts a sha or a reason. The contract
  closes that by writing `.git/HEAD` and a ref file by hand in a temporary
  directory and demanding that exact sha back: a resolver that answers
  "no git repository" to everything now fails. A criterion that offers
  two acceptable answers needs a contract that fixes which one the input
  deserves.

## Lacked

- Nothing new.

## Longed for

- Nothing new.

Feeds: `architect`.
