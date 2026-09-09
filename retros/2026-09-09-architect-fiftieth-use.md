# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fiftieth use of the architect skill, on
`requirements/the-test-tree-is-written-down` (five seams, six criteria, the
third tree), 9 September 2026.
Place: this repository

## Liked

- Reading the tree before drawing it turned up the thing worth knowing. One
  grep over 111 artefacts answered that exactly one of them declares a
  parent, which changed what every decision in the drawing is weighed
  against. Nothing in the requirement said it and nothing in the board could
  have.
- The isolation list came out of Fixed and free this time, which the last
  architect retro longed for. Eight breaks for five seams, and seven of them
  reddened exactly one.

## Learned

- The wall that guards the tree's shape has never read a tree. Every shape
  rule bites only on an artefact that declared a parent, and no artefact
  has. Requirements and architecture are forests of 58 and 52 with a green
  wall over them. That is the tree level version of a defect this league
  keeps catching one function at a time: the rule is right, the reading
  never reaches it, and the board says the same word for "held" and "never
  asked".
- Because of that, the test tree is the first tree the shape rules can see,
  and the depth rule fires on it immediately: a strategy with three plans is
  three of four hanging off the root, which is a star by the letter. I
  proved it on a scratch root rather than reasoning about the arithmetic,
  and the run is what made the decision a decision instead of an opinion.
- A place is two things and I had only drawn one. `PLACES` says how a
  place's artefacts are listed; `KINDS.parent.where` says where a name
  inside it resolves. The second half has never run for a loose page place,
  and asked for the trunk's parent it answers `kaal/league/requirement.md`,
  a directory that cannot exist. Writing the contract test for seam 1 is
  what found it, which is the seam doing its job before any code existed.
- The obvious predicate was the wrong one twice over. A gate that runs tests
  does not name a `*.test.mjs` glob: the star sits in the middle in two of
  the three, and only `tests/*.test.mjs` reads the way the phrase does. The
  stand-in was red on two fixtures before I saw it, and the drawing had that
  phrase in three places.
- An isolation that reddens two seams is not always a leak. Breaking the
  parent resolution reddened seam 1 and seam 5, and seam 5's claim is that
  the strategy roots the tree: a shape whose parents resolve to nothing is
  not rooted. The question to ask of a wide break is whether the other seam
  is lying, not whether it is wide.
- Narrowing a seam's reading to its own findings is what let the other seven
  breaks fall alone. Seams 2 to 4 read only lines this wall says about
  plans, so a break beneath them reddens the seam that owns the place.

## Lacked

- No way in the drawing to record a finding about the tree that the drawing
  is not fixing. Two of them here, and both went in the Handoff under a
  label I made up, because the template has Decisions for choices and
  nothing for facts that outlive the task.
- No rule about a fixture that is a whole tree owing what the league owes.
  Nine fixture roots, nine requirements, and every one of them red on a
  closed criterion about People lines that no fixture author would think of.
  This is the fourth kind of sweep the last code retro asked for, arriving
  from the other direction.

## Longed for

- A wall that says a rule has never fired on the tree it guards. Every shape
  rule here is green and none of them has ever read a declaration. A count
  of how many artefacts a rule actually examined would have said in one line
  what a grep said in ten.
- A drawing section for what the runs found and the task will not fix. The
  Handoff is where it landed and the Handoff is read by the developer, who
  is not the person those two findings are for.

Feeds: architect
Read: analyse
