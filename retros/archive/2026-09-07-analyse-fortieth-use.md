# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fortieth use of the analyse skill, on
`requirements/each-skill-carries-its-own-version` (four criteria, the last
of the version tasks), 7 September 2026.
Place: this repository

## Liked

- The standard decided where the version lives before I had a preference.
  Its frontmatter allows six keys and `version` is not one of them, so
  `metadata.version` is the only home that does not make every skill fail
  the standard's own validator. An assumption settled by a rule someone
  else wrote is the cheapest kind.
- Splitting the ask held. Kai asked for three things in one line and only
  the first is here: a skill carrying a version, a changed skill moving it,
  and the set on top. The second needs a base to compare against, which is
  the class command's question and not this one's, and saying so was
  quicker than drawing a task that reaches into two walls.

## Learned

- A fixture that trips a rule it is not testing makes a green case
  impossible, not just noisy. My temporary skill had no adversarial
  fixture, so `check` exited 1 on every case, the failing ones for the
  wrong rule and the passing one not at all. The tests looked red the way
  I wanted and two of them were lying, and I only saw it by reading the
  finding text rather than the exit code.
- Four criteria, three of which are one command's findings, still need
  three isolations. Removing the missing-version branch reddens 2 alone;
  removing the place check and removing the shape check each redden 3 and
  nothing else. A single stand-in would have said only that the rule can
  exist.

## Lacked

- Nothing warns that a fixture built inside a test is still a fixture. The
  rule "a fixture obeys the rules it is not testing" lives in AGENTS.md and
  reads as being about `fixtures/` directories on disk; a skills directory
  built in a temporary place is the same thing and the skill does not say
  so.
- The requirement template still has nowhere for a fact established by
  running something. Fifth task in a row. Here it was the finding text of a
  wall I had to read to learn my own fixture was wrong.

## Longed for

- A line in the analyse skill saying that a fixture a test builds obeys the
  same rule as one that is checked in, since the case that hides is the
  passing one.

Feeds: analyse
