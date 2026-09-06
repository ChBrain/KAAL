# Requirement: fixed-ground

_Written in analyse mode. Ask: the stack of ten unconsumed retros on the
analyse skill, the eleventh to the twenty-first use, less the sixteenth,
which a defect consumed on its own. Read under section 6 of the skill:
recurring Lacked items and Lacked items that name a defect are criteria,
Learned items that changed how the skill should read are criteria on its
text, Longed for items are open questions, Liked items are constraints._

## Goal

Whoever uses the analyse skill wants a model reading it to put every test on
ground that does not move before the build: a text criterion proven on a
stand-in copy, a line a test will read fixed in the requirement, a fixture
root instead of the league's own tree, and the place of a file the task
creates named as a criterion; they will know when the skill's text says each
of the four in the section where a writer looks, and the ten retros are
archived.

## Assumptions

- The four are text misses: a model that followed the skill this far would
  have followed one more sentence in the same place.
- The stand-in rule as written is read as exempting text criteria, since
  the thirteenth use of the code skill paid three rounds for the exemption
  (retro 12 Lacked; code retro 13 Lacked and Learned, a defect).
- The finding format fixed in a requirement is the analyst's act, not the
  architect's, since the tests are written before any drawing (retro 13
  Learned, retro 14 Learned).
- A test that reads the league's own tree for a state a rerun will erase is
  red for nobody's reason; a fixture root is the cure (retro 20 Learned).
- Where a generated file lives is a criterion, since the wrong place makes
  every reader of that directory misread it (retro 21 Learned).

## Constraints

- What the retros liked stays: the ask's fact quoted in the opening
  paragraph (retro 11), the Supersedes and Blocked on lines (retros 11, 15),
  section 6 reading a stack without a judgement call (retro 12), one
  criterion per misread (retro 20), the pure-function framing where the ask
  allows it (retro 21).
- The skill stays under its line budget and the standard's shape; no
  vendor, no dash, nothing that names a runtime (rules).

## Acceptance criteria

1. The stand-in rule in section 3 says a criterion on a skill's text or a
   template is not exempt: it is proven on a stand-in copy of the file, and
   a text criterion needs the stand-in most.
2. The criteria rule in section 2 says a criterion on a wall's finding or a
   command's output line fixes that line's format in the requirement, so
   the test can be written before any code exists.
3. A proof rule in section 3 says a test reads a fixture root, never the
   league's own tree for a state that a rerun or a later change will move.
4. The criteria rule in section 2 says that where a file the task creates
   lives is a criterion, not a detail.
5. The ten retros named below are under `retros/archive/` and none of them
   remains in `retros/`.

## Open questions

- A wall that reads a workflow's external hosts the way `reach` reads a
  script's imports (retro 11 Lacked, once).
- The analyst's run over a stack as a script: the filenames, the archive
  move and the count restart are mechanical (retro 12 Longed for). It
  recurs with the architect's and the developer's wish for the template
  stamped by a script (their retros 13); the candidate is the analyse
  ledger's `count unconsumed retros per skill` and `stamp the requirement
file from the template` moves, both already candidates for Script.
- A Handoff line for a task stacked on another task's branch, naming what
  it depends on (retro 14 Lacked, once).
- The standard cutting releases, so the validator pins to a tag (retro 18
  Longed for).

## Retros consumed

`retros/archive/2026-09-05-analyse-eleventh-use.md`,
`retros/archive/2026-09-05-analyse-twelfth-use.md`,
`retros/archive/2026-09-05-analyse-thirteenth-use.md`,
`retros/archive/2026-09-05-analyse-fourteenth-use.md`,
`retros/archive/2026-09-05-analyse-fifteenth-use.md`,
`retros/archive/2026-09-05-analyse-seventeenth-use.md`,
`retros/archive/2026-09-05-analyse-eighteenth-use.md`,
`retros/archive/2026-09-05-analyse-nineteenth-use.md`,
`retros/archive/2026-09-05-analyse-twentieth-use.md`,
`retros/archive/2026-09-05-analyse-twenty-first-use.md`.

## Handoff

- Task: fixed-ground
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test --test-timeout=60000 requirements/fixed-ground/acceptance.test.mjs`;
  four red; criterion 5 green by this change (the archive move is the
  analyst's act); the four text criteria seen green on a stand-in copy of
  the skill, then discarded
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 4, listed above
- Status: closed
- Blocked on: nothing
- Supersedes: nothing
