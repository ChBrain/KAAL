---
traces:
  parent: skills-v1@2ee10ad98d9c672dba9f55b29f362e12c3ca8dae480a9bd7a80c09cd318cd6a7
  supersedes: skills-v1@a27b576b0351ab513d87badd0c1823a8c16391a3d54c2166be2b5ff94ce40e53
---

# Requirement: a-skill-list-is-a-floor

## Goal

Adding a skill to the league is not a finding, and removing one still is, so
the list nobody derived stops being the thing that breaks when the league
grows.

## What the runs said

- A closed criterion counts to six and the league has seven.
  `requirements/skills-v1/acceptance.test.mjs` holds
  `const EXPECTED = ["analyse", "architect", "code", "test", "operate",
"retro-4ls"].sort()` and criterion 1 asserts `deepEqual(dirs(), EXPECTED)`.
  The manage skill landed and the wall went red on `release`.
- The list was recording an incomplete state, not a rule. `DELIVERY` is
  `EXPECTED` without `retro-4ls`, one delivery skill per seat, and it held
  five for six declared seats: the manager had none. Adding the sixth is what
  broke it.
- It broke on `release` and stood there. The board printed `red: 15 wall(s),
3 failing` and `gates: release takes this: 3 red wall(s), each a block with
an owner`, exited 0 because `release` does not bind, and the check went
  green. The seat that broke it was the seat that pushed it.
- The first red this task recorded was not the criterion. The stand-in runs
  the superseded suite in a child process, the child inherited
  `NODE_TEST_CONTEXT` from the run that spawned it, decided it was already
  inside a run and skipped the file it was given. It exited with no counts,
  and a count read as a default rather than a finding turned that into a
  number. A suite that never ran and a suite that passed answered the same.
- Two more faults in the same stand-in, both of them the copy failing to be
  the tree it stands for: it did not carry `retros/`, which criterion 9
  reads, and the skill it added was a byte copy still claiming the name it
  was copied from, which the standard refuses. A stand-in that is not a
  faithful tree answers about itself.
- The name is used nine times in that one file. `EXPECTED` and `DELIVERY`
  drive every other criterion in it, so the fix is to what the list is rather
  than to one assertion.

## Assumptions

- A list of what the tree already holds is a liability wherever it is
  written. This release has met that four times: the regression selection,
  the retro numbering, a plan's suite count and now this.
- What the old criterion bought that is worth keeping is the floor. A skill
  disappearing is a real loss and nothing else would notice it; a skill
  arriving is ordinary growth and nothing should.
- Every skill that is there is already checked. `kaal check skills` holds
  each one to the standard's shape, so a directory that is not a skill is
  refused whether or not any list names it.

## Constraints

- No wall becomes quieter about a skill that is there. Every criterion that
  reads the list keeps reading every skill.
- A skill going missing stays a finding. This is the half the closed
  criterion is right about.
- Deterministic and offline, like every wall.

## Acceptance criteria

1. Adding a skill is not a finding and removing one is. On a tree holding
   every skill the league has named and one more, the suite that reads the
   list answers clean; on a tree missing one of them, it answers a finding
   naming the skill that is gone.

## Open questions

- Should a seat declare its skill? One delivery skill per declared seat is a
  rule the tree could check both ways, and it would have said the manager had
  none long before this. It needs a field on the seat in `kaal.config.json`,
  which is governance's, so it is named here and not taken.
- Should the floor itself be derived from something? It is a written list
  again, one release older, and the honest answer is that a floor is a claim
  about history rather than about the tree, so nothing in the tree can
  compute it.

## Handoff

- Task: a-skill-list-is-a-floor
- Criteria: 1; tests: 1 (equal)
- Red run: `node --test --test-timeout=60000
requirements/a-skill-list-is-a-floor/acceptance.test.mjs` with
  `requirements/skills-v1/acceptance.test.mjs` at the version this supersedes,
  13 September 2026. Red on the half that says adding a skill is not a finding,
  which is the half the closed criterion refuses
- Tests: `requirements/a-skill-list-is-a-floor/acceptance.test.mjs`
- Open questions: 2, listed above
- Blocked on: nothing
- Unblocks: item 7 of the plan, which is not finished while the skill it
  added stands a wall red
- Supersedes: `skills-v1` criterion 1, which fixes the list exactly. Its
  other criteria are untouched and still read every skill the tree holds
- People: none
