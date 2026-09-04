# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the first real use of the architect skill, on `requirements/push-v1`,
4 September 2026.

## Liked

- The refusal check had nothing to refuse: eight criteria, eight red tests,
  so the drawing started from a finished requirement.
- Five seams came out of the requirement without invention; every one serves
  a numbered criterion, and the handoff can say which.
- The decision records forced two rulings that would otherwise have been
  argued in the developer's pull request: where the tool's modules live, and
  which token the workflow commits with.

## Learned

- The first fixed thing an architect writes is the finding format, because
  the developer's unit tests will name the rule strings; leaving that free
  would have made the contract tests unwritable.
- Rung-relative paths in the ledger are two conventions in one file, and the
  drawing had to say so in a decision because the acceptance tests already
  assumed it silently.
- Inferred: a contract test on a command line tool is easy to keep blind; a
  contract test on a workflow is not, so criterion 8 stays with the
  acceptance layer and the strategy says so.

## Lacked

- A place for the drawing in a consumer repository; `architecture/<task>/`
  is the skill's default and nobody has ratified it.
- A way to test seam 2 and 3 without copying a fixture root to a temp
  directory in a shell one-liner; a fixture per failure would be cleaner
  and would not need `sh`.

## Longed for

- The developer's seat, so the stand-in stops being the only tool.
- A drawing template check (the sections in order) as a wall, the way the
  skill rules are one for `SKILL.md`.

Feeds: `architect`.
