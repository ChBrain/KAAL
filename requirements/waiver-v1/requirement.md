# Requirement: waiver-v1

_Written in analyse mode. Ask: the design places the human at three gates
(the ask, the drawing's approval, the release key) and says a wall gates;
nothing says whether a human may let a red wall through, and if so where
that is written down. An outside review named it: make the human checkpoints
executable and auditable. This task makes the three gates data and gives a
waiver one shape: a file in the tree, naming the wall, the person, the
reason, and the day it expires._

## Goal

Kai wants the human gates named in one machine-readable place, and a red
wall waivable only by a recorded, time-boxed act in the tree that the board
shows as waived rather than as green; he will know when the runner reports a
waived wall as `waived` with who and why, refuses an expired or unnamed
waiver, and the config lists the three gates with the evidence each needs.

## Assumptions

- The gates live in `kaal.config.json` under `human.gates`: one entry per
  gate with `seam` (`requirements`, `architecture`, `deployment`), `act`
  (what the human does), `evidence` (what must accompany it), and `recorded`
  (where the act is visible: the ask in the requirement, the merge of the
  drawing, the key in the release record).
- A waiver is a file `waivers/<wall>.md` with frontmatter `wall`, `who`,
  `why`, `until` (a date, `YYYY-MM-DD`); one waiver per wall at a time.
- A waived wall still runs; the runner reports its result and marks it
  `waived` instead of `FAIL`, and the run's summary counts it. A waiver for
  a wall that is green is reported as unused, not as a failure.
- An expired waiver (`until` before today) or one missing a field counts
  for nothing; the wall stays `FAIL` and the runner says why.

## Constraints

- No wall is relaxed by code: a waiver is a human's act, recorded, visible in
  the board's output and in the tree's history.
- The gates entry shape `{ name, command, fix }` stays; the waiver is read by
  the runner from `waivers/`, not from the gate.
- No en-dash or em-dash; no dependency beyond node.

## Acceptance criteria

1. `kaal.config.json` carries `human.gates` with exactly three entries whose
   `seam` values are `requirements`, `architecture`, `deployment`, each with
   non-empty `act`, `evidence`, and `recorded`.
2. `kaal gates` on `fixtures/waived` (a failing wall with a valid waiver)
   exits 0 and prints a line beginning `waived` naming the wall and `who`.
3. `kaal gates` on `fixtures/expired` (the same wall, a waiver whose `until`
   has passed) exits 1 and says the waiver expired.
4. `kaal gates` on `fixtures/incomplete` (a waiver missing `why`) exits 1 and
   names the missing field.
5. The runner's summary line counts waived walls separately from failing
   ones.

## Open questions

- May a waiver be given for the acceptance or contracts walls at all, or
  only for format and units? (v1: any wall; the record is the control.)
- Who may sign a waiver: anyone with push, or the human named in the
  design? (v1: anyone; the name is in the file.)

## Handoff

- Task: waiver-v1
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test requirements/waiver-v1/acceptance.test.mjs`; green
  on a stand-in
- Tests: `acceptance.test.mjs`, beside this file; fixture roots under
  `fixtures/`
- Open questions: 2, listed above
- Status: closed
