# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the eightieth use of the architect skill, amending the drawing for
`an-open-finding-blocks-every-target` from five criteria to fourteen,
14 September 2026.
Place: this repository

## Liked

- The board named the work before the backlog did. `kaal drawings` was red on
  one strategy table, `kaal traces` said the requirement under this drawing
  had moved, and five bug pages in `tests/bugs/` all named `architecture/*`.
  Three readings, one cause, and the seat's own backlog carried no block
  because there was none to carry: the work was derived and visible.
- The analyst left seventeen semantic names and no contents. Every one of them
  turned out to be a state the wall must be able to say in its own words, so
  the fixture list read as a specification of the state machine before a line
  of the drawing was written.
- The stand-in earned its keep twice over. It ran the eight contracts and then
  the requirement's fourteen, and the fourteen are what proved that twenty-two
  fixture trees, every digest in them computed by hand, actually hold together.

## Learned

- **A criterion that asks for distinguishable answers is a criterion about
  wording, and wording is normally free.** Criterion 8 wants nine red states
  whose answers differ, so the drawing had to fix that they differ without
  fixing what they say. Naming a state list in the seam and leaving the
  sentences to the developer is the only split that gives both.
- A contract that asserted a message I had chosen went red on the stand-in for
  the right reason and the wrong text: `does not match` against `do not
match`. The old contract had passed because the old fixture failed further
  up, on the code hash rather than on the bindings. A fixture carried forward
  unchanged can move which branch it proves without moving a byte of the test.
- Excluding a path from a content manifest is a decision with two directions,
  and one of them only shows up a step later. Leaving acceptances out of the
  candidate is what makes waiving possible at all: put them in, and writing
  the waiver makes the evidence stale, so no finding can ever be accepted.
  That fell out of running criterion 4, not out of drawing.
- A drawing that fixes a whole corpus of fixtures owes the developer the rule
  for regenerating them. Every digest here was computed after the formatter
  ran, and a build that reformats one fixture and not its evidence would get
  a red nobody could read.

## Lacked

- Anything that tells an architect a fixture corpus is internally consistent
  except running the layer above on a throwaway. Twenty-two trees, four
  deliberately holding a wrong digest: no wall in this tree could have told
  me which four.
- A way to hand five now-clearable bug pages to the tester. The diff turns
  five red cases green, `kaal traces` says so in five findings, and the only
  channel is the pull request body, because the block kinds are the four the
  tree can hold and `stale record` is not one of them.

## Longed for

- A fifth block kind, or a different reading of `no record`: work this diff
  creates for another seat has no shape in the backlog, and the only shape it
  has is a wall going red in somebody else's tree.
- A generator the tree owns for a fixture corpus with computed pins. Mine was
  a scratch script that nobody will see again, and the next amendment of this
  task will write it a second time.

Feeds: architect
Read: analyse
