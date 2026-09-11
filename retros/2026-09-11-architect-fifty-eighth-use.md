# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty eighth use of the architect skill, teaching one contract
that an exclusion is not a path, 11 September 2026.
Place: this repository

## Liked

- Telling the two failures apart. Both contracts went red on the same push
  and a summary read them as one thing: the package shipped skills and two
  contracts objected. One of them was objecting to that. The other was
  objecting to a negation in `files`, because it read every entry as a path,
  and its claim, that what ships is what `files` names, is as true as it was
  yesterday.
- So this one is not superseded and it was worth the minute it took to see
  that. Superseding it would have quietly retired a claim that still holds,
  and a supersede is the easiest way in this league to lose something without
  noticing.
- The fix carries a new check rather than only a narrower one. An exclusion
  that matches nothing in the tree is as silent as a wrong path, so the
  contract now asks that too.

## Learned

- A contract can go red without its claim being wrong. This one has a claim,
  a reading of the tree, and a comparison, and only the reading broke. The
  four verdicts tell an unbuilt task from a regression and there is no word
  for a proof whose subject moved underneath it while its claim stood.
- `files` is two languages in one list: paths that name and patterns that
  exclude. Anything reading it as one kind was correct until the day the
  other kind appeared, and that day was today.
- This diff needs nothing else in the chain and that is worth knowing before
  queueing it. The other three wait on each other; this one is green on main
  as it stands, because a tree with no exclusion in `files` runs the new loop
  zero times. Checking which links of a chain are actually links cost one
  command.

## Lacked

- Nothing distinguishes a contract that broke from one that was contradicted.
  Both arrive as `regressed` with a failing line, and the difference decides
  whether the answer is a supersede or a fix. A reader has to open the test.
- No name for a reading that was right about a shape the tree has since
  grown. Not stale, not vacuous, not wrong when written.

## Longed for

- A `files` reader the tree owns, used by every wall that reads the manifest.
  Three suites now parse that list independently and each had to learn about
  exclusions on its own; two of them have not.
- The manage skill, seventh record in two days. The question here is the same
  one every time: what else reads the thing I am about to change.

Feeds: architect
Read: analyse
