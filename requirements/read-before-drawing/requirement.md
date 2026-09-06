# Requirement: read-before-drawing

_Written in analyse mode. Ask: the stack of ten unconsumed retros on the
architect skill, the eleventh to the twentieth use. Read under section 6 of
the analyse skill: recurring Lacked items and Lacked items that name a
defect are criteria, Learned items that changed how the skill should read
are criteria on its text, Longed for items are open questions, Liked items
are constraints._

## Goal

Whoever uses the architect skill wants a model reading it to read what
already binds a path before drawing on it: the closed requirements that
constrain it, the readers a shared parser serves, the sentences and fixed
words a text change is made of; and wants the one seam a fixture failed to
hold (a fence inside a fenced block) held by a fixture; they will know when
the skill's text says each in the section where a drawer looks, the
eval-runner fixture carries the fence, and the ten retros are archived.

## Assumptions

- The three text items are text misses: the architect who drew public-v1
  found security-v1's constraint through the acceptance wall, not through
  the skill (retro 12 Learned); the parser change of standard-v1 was drawn
  as a seam every reader crosses by instinct, not by rule (retro 17
  Learned); the text drawings of analyse-v2 found their structure in the
  fixed words without the skill saying so (retro 13 Learned).
- The fence defect (retro 20 Lacked) is a behaviour, so it gets a fixture:
  the eval-runner tree's skill carries a fence, and the seam is then held
  by the contract that reads it rather than by the league's own analyse
  skill happening to carry one.
- The Longed for that recurs three times across three skills, the
  drawings wall reading the diagram's node names against the Structure's
  parts (analyse 13, architect 14, code 14), is a candidate criterion; a
  rule tried over the league's twenty drawings (a node label shares a word
  of four letters or more with the Structure section) leaves seven of them
  red, every one on a node that names the outside world (the board, the
  developer at work, the configured endpoint). It stays an open question
  until a rule holds on the tree.

## Constraints

- What the retros liked stays: the drawing says what does not change
  (retro 11), one decision worth a record and no more (retros 12, 17, 18),
  seams on fixture roots that already exist (retros 15, 20), read and never
  run for a shape wall (retro 14), the same words in two files held by one
  contract (retro 16).
- The skill stays under its line budget and the standard's shape; no
  vendor, no dash, nothing that names a runtime (rules).
- The eval-runner contracts stay green with the fence in the fixture; the
  fixture change is the analyst's act.

## Acceptance criteria

1. Section 1 of the skill says to read the closed requirements whose
   criteria touch the path as constraints before drawing, since the
   acceptance wall reads them whether the drawing did or not.
2. The Seams rule in section 2 says a change to a reader that several
   seats share (a parser, a template) is a seam for every reader, and the
   drawing names the readers and fixes the behaviour they keep.
3. The Fixed and free rule in section 2 says that for a text change the
   parts are the sentences' places and the fixed words are what the
   contract reads.
4. `architecture/eval-runner/fixtures/tree/skills/y/SKILL.md` carries a
   fenced block, and `kaal runner y f` on that root still prints a document
   of exactly three fenced blocks whose first block holds the whole skill.
5. The ten retros named below are under `retros/archive/` and none of them
   remains in `retros/`.

## Open questions

- The drawings wall reading the diagram's node names against the
  Structure's parts (Longed for, three retros across three skills; see
  the assumption above for the rule tried and where it fails).
- A local chat-completions stub, so a seam that reaches an endpoint is
  held by a contract test and not by reading the fetch's text (retro 11
  Lacked and Longed for).
- The evals script out of the workflow file and into `bin/`, where a
  unit test can call it (retro 11 Longed for).
- A wall that lists the constraints closed requirements place on a path
  (retro 12 Longed for); criterion 1 makes it a reading rule until then.
- The template stamped by a script (retro 13 Longed for; the developer's
  thirteenth retro too): the analyse ledger's `stamp the requirement file
from the template` move is the candidate.
- A place in the requirement for "the fixture must change too" (retro 15
  Lacked, once); the drawing's What changes carries it today.

## Retros consumed

`retros/archive/2026-09-05-architect-eleventh-use.md`,
`retros/archive/2026-09-05-architect-twelfth-use.md`,
`retros/archive/2026-09-05-architect-thirteenth-use.md`,
`retros/archive/2026-09-05-architect-fourteenth-use.md`,
`retros/archive/2026-09-05-architect-fifteenth-use.md`,
`retros/archive/2026-09-05-architect-sixteenth-use.md`,
`retros/archive/2026-09-05-architect-seventeenth-use.md`,
`retros/archive/2026-09-05-architect-eighteenth-use.md`,
`retros/archive/2026-09-05-architect-nineteenth-use.md`,
`retros/archive/2026-09-05-architect-twentieth-use.md`.

## Handoff

- Task: read-before-drawing
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test --test-timeout=60000 requirements/read-before-drawing/acceptance.test.mjs`;
  three red; criteria 4 and 5 green by this change (the fixture and the
  archive move are the analyst's acts); the three text criteria seen green
  on a stand-in copy of the skill, then discarded
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 6, listed above
- Status: closed
- Blocked on: nothing
- Supersedes: nothing
