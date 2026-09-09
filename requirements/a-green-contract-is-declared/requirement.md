---
traces:
  supersedes: nothing
---

# Requirement: a-green-contract-is-declared

_Written in analyse mode, the second of three tasks from the run over
twenty retros. The items behind it are the twenty-fifth's, the
twenty-seventh's and the twenty-ninth's, all of the architect skill._

## Goal

Whoever writes contract tests wants to know when a green one is a kind
rather than a defect, what a closed task actually fixes, and that a
contract may not drive the runner that will run it; they will know when
the skill says all three where a writer meets them.

## Assumptions

- The skill says every contract test fails now, because nothing behind the
  seam exists. That is false for a guard on a reader or a rule several
  seats share, and this repository has drawn three such guards in two
  days. Each time the architect decided alone whether a green test was
  allowed, and each time declared it in the handoff, which is the answer
  the skill should have given.
- A closed task's tests fix shapes its criteria never state. The analyst's
  half of this was settled in `what-a-closed-task-fixes`; the architect
  reads the same closed work and the same gap is in this skill.
- A contract that drives the repository's own board hangs: the board runs
  the contracts wall, which runs the file that called it. The rule is
  mechanical, it is enforced by nothing, and it costs a sixty second
  timeout to rediscover. Five closed tests already work around it with a
  marker.
- These criteria are text in `skills/architect/SKILL.md`.

## Constraints

- The skill stays under its line budget and the standard's shape; no
  vendor, no dash (rules).
- The rule about the board is written so it holds in any repository whose
  test runner is itself a wall, not only in this one.

## Acceptance criteria

1. The architect skill says a contract test green before the build is a
   kind and not always a defect: it is a guard on a reader or a rule that
   must not change, and it is named in the handoff with the reason it is
   green.
2. The skill says to read the tests of the closed requirements whose paths
   the drawing touches, as well as their criteria, because a closed test
   fixes shapes no criterion states.
3. The skill says a contract must never drive the runner that runs it,
   names why (the runner runs the contracts, which run the caller), and
   says to prove the case on a fixture instead.
4. These five retros are under `retros/archive/` and none remains in
   `retros/`: `2026-09-06-architect-twenty-fourth-use.md`,
   `2026-09-06-architect-twenty-sixth-use.md`,
   `2026-09-06-architect-twenty-seventh-use.md`,
   `2026-09-07-architect-twenty-ninth-use.md`,
   `2026-09-07-architect-thirtieth-use.md`.

## Open questions

- Where is the line between a criterion's test and a seam's test when both
  drive the same executable (twenty-seventh)? It was found by asking what
  the harness will need, which is not in the skill.
- What does an architect do at the bottom end of one seam one test, where
  one criterion and one obvious file tempt a second seam drawn for
  thoroughness (twenty-sixth)?
- Should the skill say when a drawing and its build belong in one pull
  request, instead of leaving that rule in `architect-v2`'s requirement
  (twenty-sixth)?
- What does a seat do on finding a defect in another seat's test, one that
  cannot pass for a reason unrelated to its criterion (twenty-ninth)?

## Handoff

- Task: a-green-contract-is-declared
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-green-contract-is-declared/acceptance.test.mjs`;
  all four red, run and read
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 4, listed above
- Blocked on: nothing
- Supersedes: nothing
- People: none
