# Requirement: <task>

## Goal

<One sentence: who wants what, and how they will know it happened. No how.>

## Assumptions

- <A thing taken as given that the asker could deny.>

## Constraints

- <A thing the ask forbids or fixes, with where it came from.>

## Acceptance criteria

1. <One observable at the surface, and the value it must have.>
2. <...>

## Open questions

- <A question the asker can answer in one line.>

## Handoff

- Task: <task>
- Criteria: <n>; tests: <n> (equal)
- Red run: <runner, date, all <n> failing, or the manual steps walked and not
  met>
- Tests: <path or paths, beside this file>
- Open questions: <count>, listed above
- Status: <open at handoff; closed when every test is green>
- Blocked on: <a person, a setting, or nothing>
- Supersedes: <an earlier task and what of it, or nothing>

---

# Acceptance test shape

One test per criterion, numbered to match. In the repository's own runner where
one reaches the surface; otherwise a manual test in this shape:

```
Test <n> (manual): <criterion n, restated>
Steps:
  1. <exact step at the surface>
  2. <...>
Expected: <exact observable and its value>
```

A test drives the surface the ask names and reads what comes back. It imports
nothing from inside the system and knows nothing of its structure.
