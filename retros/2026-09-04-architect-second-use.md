# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the second real use of the architect skill, on
`requirements/gates-v1`, 4 September 2026.

## Liked

- Three seams for five criteria: the drawing is smaller than the
  requirement, which is the right way round for a task about one command.
- Two of the requirement's open questions closed as decisions with a reopen
  condition each (the format check gates; `prepare` wires the hook), rather
  than lingering as questions for the developer to guess at.
- The unrunnable-wall rule came straight from conduct: a missing command is
  a failure with a fix hint, never a skip.

## Learned

- A contract test can observe a hook wiring without pushing: copy the
  package into a temporary clone, run `prepare`, read git's config. That is
  cheaper than the temp-repository push the first draft imagined.
- The test's environment variable in the hook is now a recorded decision
  with a reopen condition, which is where a known smell should live until
  someone removes it.

## Lacked

- A drawing check as a wall: the sections in order, one seam one contract,
  every criterion served by a row. This is the second drawing and both were
  checked by reading.
- A named home for the runner's paste block in a pull request; the design
  says "printed for the pull request" and no seam says who pastes it.

## Longed for

- The walls actually running in a hook, which this task delivers next.

Feeds: `architect`.
