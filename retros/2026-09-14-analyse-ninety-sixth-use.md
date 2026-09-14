# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the ninety-sixth use of the analyse skill, correcting criterion 6 of
`an-open-finding-blocks-every-target`, 14 September 2026.
Place: this repository

## Liked

- The review isolated one proof defect without reopening the approved
  requirement or the other thirteen cases.
- The discarded stand-in passed all fourteen cases after the semantic
  assertion was added.

## Learned

- A red exit alone does not prove the required failure when several unrelated
  red states are possible.
- Each candidate mutation needs both an outcome assertion and a diagnostic
  assertion to demonstrate staleness for the intended reason.

## Lacked

- The original criterion 6 test captured the wall answer but never asserted
  its meaning.

## Longed for

- A reusable acceptance helper that pairs wall status with a semantic reason
  assertion while keeping each criterion visible as one top-level test.

Feeds: analyse
Read: retro-4ls
