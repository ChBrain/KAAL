# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirtieth use of the analyse skill, on
`requirements/pointed-elsewhere` (the guest fixture, four criteria), 6
September 2026.
Place: this repository

## Liked

- The two items before this one paid for themselves here. The fixture does
  not invent a mechanism: it points a skill at a copy, and the witness
  built yesterday says whether the copy moved. Almost all of the criteria
  are about assembling what already exists.
- Deciding that the witness verdict belongs in the record and not in the
  checklist. A reader reads an output; it cannot see a filesystem, and a
  checklist item asking a reader to vouch for a directory would be a
  checklist item that lies.

## Learned

- A record whose subject is an act on a filesystem needs a fact the reader
  cannot supply. All ten of the record's fields are required of every
  record, and the eleventh is required only of a record whose fixture
  carries a tree. That condition is invisible to `readRecord`, which is
  handed a path and nothing else, and plain to the function that already
  knows the root and the skill.
- So where a check lives is decided by what the function can see, not by
  where the rule reads best. I wrote the criterion at the command's
  surface, `kaal ledger` counts it or names why it did not, and left the
  seam to the architect, which is the honest line.

## Lacked

- The skill has nothing to say about a conditional criterion. Every
  example it gives is a thing that must always be true; "required only
  when the fixture carries a tree" needed me to reason about which reader
  could see the condition, which is nearer design than analysis, and I
  only stayed on my side by writing it at the surface.
- No guidance on a fixture that is itself data for a run rather than text
  for a model. A tree that ships in a fixture and is copied before every
  use is a new kind of artefact here, and the fixtures rule knows nothing
  about it.

## Longed for

- A way for the fixtures reading to know a tree when it sees one, so
  `kaal fixtures` lists it as a shape rather than passing over it in
  silence.

Feeds: analyse
