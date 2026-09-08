# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-fifth use of the code skill, building
`a-build-says-what-it-proved`, the first build held to the rules it
installs, 7 September 2026.
Place: this repository

## Liked

- The three new rules were run on their own build and all three had
  something to say. The sweep sent me to `kaal runner code <fixture>
--check` for three fixtures, which is a check nothing asked for before
  and which I would not have run. The supersede rule sent me to the
  seventeen closed tests that read this skill. The class line had somewhere
  to go for the first time in five builds.
- The sweep's answer was "nothing", and that is worth as much as a finding.
  The code skill's three fixtures carry no generated page, so the runners
  wall is green because there is nothing to be stale rather than because
  something was regenerated. A rule whose honest answer is often "none" is
  a rule a seat will actually run.

## Learned

- A rule that installs itself is the cheapest test of the rule. Building
  this without following it would have been possible and would have said
  nothing about whether the rules are followable; following it cost three
  commands and produced two facts I would otherwise have guessed at.
- The class line is the smallest of the six criteria and it closed the
  oldest complaint in the stack. Three retros asked for it across two days,
  two of them while the tooling could not compute a class at all. The gap
  between "the skill asks for output no seat can produce" and "the seat has
  nowhere to put the output it produces" was five builds long and neither
  half was expensive to fix.

## Lacked

- Nothing says what a sweep should do when its answer is that nothing is
  generated. I ran three checks, got three "missing" answers, and had to
  decide myself that creating three runner pages was scope I was inventing
  rather than work the sweep implies. The rule says to walk the tree it
  reaches; it does not say that reaching nothing is a complete answer.
- The handoff's new lines have no reader that checks them. `Unproven:` and
  `Superseded:` are honest because I wrote them honestly, and a build that
  left both blank would pass every wall in the tree.

## Longed for

- A wall over the change record's own lines, so a handoff missing the class
  the tooling computed is a finding rather than a habit. It is the same
  shape as the drawings wall and it would make the six lines load bearing.

Feeds: code
Read: test
