# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty sixth use of the architect skill, reading the criterion that
moved under `a-diff-carries-one-seat` and recording what the reading found,
10 September 2026.
Place: this repository

## Liked

- The reading was not a formality. Criterion 5 gained a second excuse and seam
  5 turned out to take three inputs where the drawing said two, so the state
  is `updated` rather than `reviewed-no-impact` and the page moved. Had the
  tool cleared this pin, as it did until this morning, the drawing would still
  say seam 5 takes the paths and the requirements, and nothing would ever have
  disagreed with it.
- The contract gained the cases the strategy row now claims. Writing the row
  first and the cases after would have been a drawing describing a test that
  does not exist, which is the same defect as a seam nothing calls.
- Both new halves seen red on their own, in the contract this time rather than
  in the unit. The unit beside the code already covered them, and a seam's own
  proof covering them is not the duplication it looks like: one is the
  developer asking whether the function is right, the other is the drawing
  asking whether the seam still promises what it promised.

## Learned

- A pin is not a formality either, and this is the evidence. The pin under
  this drawing had been advanced by the tool three times while the criteria
  moved three times, and the drawing drifted from the criteria by one whole
  input without a single wall noticing. The state that stops the tool is what
  made anybody look.
- `updated` and `reviewed-no-impact` are worth keeping apart, and I only
  believe that now that one has happened. `reviewed-no-impact` would have
  been the cheap answer here and it would have been a lie by one input.
- Who cleared it is the question the requirement left open and it is not
  rhetorical. This review says `by architect`, because a person did not read
  this criterion: a seat did, and I am running it. Writing `by Kai` would have
  claimed a reading that never happened, which is the exact thing a pin exists
  to prevent, and the league has no register of people to check it against.

## Lacked

- Nothing tells a reader that a pin's review is stale in the other direction:
  a review naming the sha the region has now stays `updated` forever, even
  after the drawing that it describes has moved on. It expires when the
  criterion moves and never when the drawing does.
- No wall counts a drawing's seams against the signatures its "Fixed" list
  names. The signature said `proofs(root, paths)` and the tree has taken a
  third argument since the build, and that mismatch sat in the page for a day.

## Longed for

- A register of who may clear a pin. The requirement's first open question is
  still open and this reading is the first thing to hit it: `by architect` is
  honest and it is not a person, and the criterion asks for a person.
- A way to ask what a drawing owes its criteria. This reading was a diff of
  two texts done by eye, and the tree already pins the region by sha; what it
  cannot say is which part of the drawing answers which criterion.

Feeds: architect
Read: analyse
