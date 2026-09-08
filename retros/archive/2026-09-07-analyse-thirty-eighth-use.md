# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirty-eighth use of the analyse skill, on
`requirements/the-engine-is-installable` (four criteria, the second of the
version tasks), 7 September 2026.
Place: this repository

## Liked

- The tool refused before the test did. `npm pack` in this tree answers
  "Invalid package, must have name and version", which is the task's whole
  premise stated by something that is not me. An assumption backed by a
  command's own output is one the asker can check in a second.
- The stand-in earned its keep again. Criterion 2 was green on nothing and
  wrong on the stand-in: npm puts `LICENSE` and `README.md` in every
  tarball whatever the manifest says, so the criterion as written would
  have forced a shipped tool without its licence. The criterion moved, not
  the tool.

## Learned

- A criterion about packaging is a criterion about what someone else's tool
  does, and that behaviour has to be found before it can be written down. I
  checked three things by running them: that `private` does not block a
  pack or an install, that `npm publish --dry-run` exits 0 anyway and so
  cannot be a criterion, and what a tarball carries unasked. Two of the
  three changed what I wrote.
- Isolating the tests took a second and a third stand-in, each missing one
  field, to show that criterion 2 and criterion 3 fail for their own
  reasons rather than for the missing version they all share. A first red
  run where every test fails for one cause says nothing about the tests.

## Lacked

- The skill says to see the tests green on a stand-in and says nothing
  about seeing them red one at a time. When several criteria depend on one
  precondition, a single red run and a single green run leave the middle
  untested, and the middle is where a vacuous test hides.
- Nothing helps with an assumption that is really a claim about a third
  party's tool. It is not something the asker can deny from knowledge, and
  it is not a fact of this tree either; I ended up writing what I ran, but
  the requirement template has no place for evidence.
- Nothing warns that a retro's name is a guess about a count. I wrote this
  file over the previous use's retro because I numbered it from a stale
  reading and the shell did not ask; git had the original, and only the
  staged diff showed it as a modification rather than an addition.

## Longed for

- A requirement that can name what it unblocks, still. This is the second
  task in a chain of four and the order lives in prose again.
- A convention for citing a run inside an assumption, so a reader can tell
  a thing I checked from a thing I believe.
- A retro whose name the tree computes, or a wall that refuses to overwrite
  one, since the ordinal is the one part of a retro nobody can verify by
  reading it.

Feeds: analyse
