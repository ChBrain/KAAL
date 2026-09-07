# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-fifth use of the analyse skill, on
`requirements/a-wall-reads-one-format` (four criteria, from a defect a
contributor's machine found), 7 September 2026.
Place: this repository

## Liked

- The ask arrived as a board nobody could explain and the requirement is
  written from runs rather than from the report. A machine said red, CI
  said green, and neither is wrong: forcing the spec reporter on node 22
  reproduces the contributor's board line for line, including the word
  green on a wall that measured nothing.
- Reproducing it locally is what made the criteria testable anywhere. A
  criterion that could only fail on node 24 would need node 24 to prove;
  written as a disagreement between two runs, it fails on any runtime that
  has the defect and passes on any that does not.

## Learned

- A wall can be green and blind at the same time, and the counts are the
  only thing that says which. `judge` asks whether anything failed and
  never whether anything ran, so a closed requirement reading zero passing
  and zero failing is `ok closed`. That predates the reporter and is not
  its fault; node 24 only made it universal. It became criterion 4, which
  fixes the class rather than the instance.
- Red survived by luck. `fail` falls back to the child's exit status when
  the count does not parse, so a failing file is still caught on a runtime
  the wall cannot read. That is the difference between a board that is
  wrong and a board that is blind, and it is one line of fallback nobody
  wrote for this reason.
- Three places read a count and they look like one. The judged runner
  reads the runtime's output, the board reads a wall's output, and for the
  units wall those are the same bytes. A fix in either alone leaves the
  board lying.

## Lacked

- Nothing in the skill says a supported runtime is part of the surface.
  `engines` says `>=22` and the tool works on one of them; that is a
  promise in a manifest with no test, and I only noticed because a machine
  broke on it.
- The template still has nowhere for a fact established by running
  something. Ninth task in a row. Four runs decided this requirement and
  all four are prose.

## Longed for

- A wall that runs the board under more than the one runtime CI pins,
  since the whole defect is that CI pins one and the contributors do not.

Feeds: analyse
