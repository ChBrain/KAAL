# Requirement: a-wall-reads-one-format

_Written in analyse mode. Ask, from Kai: "go, open it as a-wall-reads-one-format",
after a contributor's machine reported the board red on a commit that is
green in CI and green in two other checkouts. The machine runs node
v24.13.1; CI and every checkout that agreed run node 22. On 24 the test
runner prints the spec reporter when its output is piped, and on 22 it
prints TAP. The walls read TAP, so on 24 every count is zero and no failing
test is ever named. `package.json` declares `engines: ">=22"`, which is a
promise this tool does not keep._

## Goal

Whoever reads the board wants its counts to mean the same thing on every
runtime the tool says it supports, so that a green wall is evidence rather
than an artefact of a reporter's default; they will know when the same run
reports the same counts and the same failing test names whichever reporter
the runtime defaults to, and when a wall that measured nothing is never
green.

## Assumptions

- The reporter's default is the runtime's to change and not ours to predict.
  Node 22 prints TAP when piped and node 24 prints spec, both by default and
  both correctly; a third default is possible and this task should survive
  it. So the fix is for the walls to name the format they read rather than
  to teach them a second one.
- Forcing the spec reporter on node 22 reproduces the whole defect. Run with
  `NODE_OPTIONS=--test-reporter=spec`, `kaal acceptance` on a green closed
  requirement prints `(0 passing, 0 failing)`, `green: 1 requirement(s)` and
  `# pass 0`, which is the contributor's board line for line. That is what
  makes this testable on any runtime rather than only on the one that
  showed it.
- Red is still red today, by luck rather than by design. `fail` falls back
  to the child's exit status when `# fail N` does not match, so a failing
  file is still caught; what is lost is every passing count and every
  failing test's name. The board is wrong rather than blind, and this task
  does not get to rely on that fallback continuing to be enough.
- A closed requirement with nothing passing is judged `ok closed` today on
  any runtime. `judge` asks only whether `fail > 0`. That is the vacuity
  `nothing-passes-vacuously` closed for commands and it was never closed
  for this verdict, so the reporter change did not create it, only made it
  universal.
- Three places read a count and they are not one place: `bin/lib/acceptance.mjs`
  reads the runner's output for both judged walls, and `bin/lib/gates.mjs`
  reads a wall's output for the board, which for `units` is the runner's
  output directly. A fix in one is not a fix.

## Constraints

- Offline and deterministic. The proof forces a reporter through the
  environment and runs the tool's own commands on fixtures it builds; it
  reaches no network and reads no state that a rerun moves.
- The shapes already fixed hold: `# pass N` as the board's own count
  (`gates-v1`), the judged labels and the four verdicts (`status-v1`,
  `status-v2`), and the exit vocabulary of `SURFACE.md`.
- No wall is removed and no requirement's status changes to make this green.

## Acceptance criteria

1. `kaal acceptance` and `kaal contracts` report the same passing count for
   the same files whether the runtime's default reporter is TAP or spec.
2. Both name the failing tests of a red file, by name and indented under its
   line, under either reporter.
3. The board's line for the `units` wall carries its passing count under
   either reporter.
4. A closed requirement whose run reports no passing tests is not judged
   `ok`: the wall names it and the run is red.

## Open questions

- Should the walls pin the reporter they read, or read whichever they are
  given? Pinning is one word per spawn and survives a third default; reading
  both is two parsers to keep true and grows with every reporter node adds.
- Does `engines` become a refusal rather than a note? A tool that says
  `>=22` and works only on 22 could say so at the first command instead of
  in a manifest nobody runs.
- Criterion 4 refuses a closed requirement with nothing passing. Should the
  same refusal hold for a drawing with no contract tests, which is the same
  vacuity one layer up?

## Handoff

- Task: a-wall-reads-one-format
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=120000 requirements/a-wall-reads-one-format/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file; each builds a small root in
  a temporary directory and runs the tool's commands against it twice, once
  with the runtime's default reporter and once with spec forced through
  `NODE_OPTIONS`, because the defect is a disagreement between two runs and
  not a property of either
- Open questions: 3, listed above
- Status: closed
- Blocked on: nothing
- Supersedes: nothing
