---
traces:
  supersedes: nothing
---

# Requirement: what-proves-a-build

_Written in analyse mode, the third of three tasks from the run over
twenty retros, and the one whose signal was loudest: four of the ten code
retros say the same thing in four different weeks of one day. Five of the
ten record "Lacked: nothing new"._

## Goal

Whoever builds wants to know what counts as proof when the diff is text
and there is nothing for a unit test to hold, and wants to know that a
unit test written after the code is not trusted until the code has been
broken; they will know when the skill names both cases instead of reading
as though every build has source.

## Assumptions

- Four builds in two days had no source at all: sentences in skill files,
  held by contract and acceptance tests, with no unit layer. Each time the
  developer closed the task on two layers and explained it in the pull
  request, and each time the skill still said to write the unit test
  first.
- A text line's proof is its presence and its place. No deterministic test
  holds what a sentence means, and pretending otherwise is how a skill
  gains tests that assert nothing.
- A unit test written after the code has never been seen red. Breaking the
  thing it tests and watching it fail is a minute's work and it found two
  real holes this week, one of them a test that passed because the
  filesystem happened to return names in order.
- The cure and the analyst's `red-for-the-right-reason` are the same idea
  at two seats: a green test proves something only when it could have been
  red for the reason the criterion names.
- These criteria are text in `skills/code/SKILL.md`.

## Constraints

- The skill stays under its line budget and the standard's shape; no
  vendor, no dash (rules).
- Nothing here loosens the rule that a unit test comes first where there
  is source. The new text names the case where there is none.

## Acceptance criteria

1. The code skill says that a build whose diff is text and not source has
   no unit layer, that the contract and acceptance tests are then the
   whole proof, and that the task closes on the layers that exist with the
   handoff naming which runs were made.
2. The skill says what a text line's proof is: its presence and its place,
   held by the tests the seats above wrote, and never its meaning.
3. The skill says a unit test written after the code has not been seen
   red, and is trusted only after the thing it tests is broken and watched
   to fail; and it warns that a test of an ordering can pass whatever the
   code does, when the order came from the environment rather than the
   code.
4. These eleven retros are under `retros/archive/` and none remains in
   `retros/`: `2026-09-06-code-twenty-first-use.md`,
   `2026-09-06-code-twenty-second-use.md`,
   `2026-09-06-code-twenty-third-use.md`,
   `2026-09-06-code-twenty-fourth-use.md`,
   `2026-09-06-code-twenty-fifth-use.md`,
   `2026-09-06-code-twenty-sixth-use.md`,
   `2026-09-06-code-twenty-seventh-use.md`,
   `2026-09-06-code-twenty-eighth-use.md`,
   `2026-09-07-code-twenty-ninth-use.md`,
   `2026-09-07-code-thirtieth-use.md`,
   `2026-09-07-code-thirty-first-use.md`.

## Open questions

- How does a build record that it improved on its drawing, rather than
  departed from it (thirtieth)? It has happened twice, both times by a
  note the developer invented.
- How does a developer verify a text change beyond the tests, other than
  reading the rendered page by eye (twenty-ninth)?
- Which seat may edit a skill that a seat is standing in?

## Handoff

- Task: what-proves-a-build
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=60000 requirements/what-proves-a-build/acceptance.test.mjs`;
  all four red, run and read
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 3, listed above
- Blocked on: nothing
- Supersedes: nothing
- People: none
