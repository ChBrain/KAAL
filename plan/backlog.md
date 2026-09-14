---
blocks:
---

# Backlog: manager

What this seat cannot do, and who owes what it is waiting on. One entry per
line under `blocks:`, keyed `<seat>/<task>` with the kind as its value, read
by `kaal backlog` and by nobody else.

What this seat _can_ do is not here and never will be: that is a fact about
the tree, so it is derived rather than written. A requirement with a drawing
and a red test is this seat's work whether or not anybody typed it.

Nothing is blocked. The four kinds a block may name are `no requirement`,
`no drawing`, `no proof` and `no record`, and this seat is waiting on none of
them today.

## Provisional lifecycle claim

The persistent claim representation is intentionally left to the architecture
for `a-seat-claims-its-work-before-doing-it`. Until it exists, this section
bootstraps the same fact without changing the `blocks:` grammar.

- Pull request: #313
- Lane: `plan/a-seat-claims-its-work-before-doing-it`
- Claim: refresh the lifecycle placement and cross-seat order after #314
  changed release truth, using the exact release board, all six backlogs,
  accepted work, live pull requests, asks and human gates.
- State: completed
- Reconciliation: #313 remains based on exact release head
  `de94ab8f2dea71944b064288adffaf2eccf996cf`; #315 and #312 are current-base,
  ready and CI-green in that cross-seat order; all six backlogs were read;
  the fifth Manager retro and refreshed local-backlog boundary are recorded;
  targeted Manager checks pass; no `pdca` capability was implemented.

- Pull request: #318
- Lane: `plan/a-working-team-is-the-release-objective`
- Claim: re-evaluate 0.0.2 against the human objective of a working KAAL team
  rather than against the three promises this plan opened with, and place
  every remaining want explicitly, in the release or out of it by name.
- State: completed, after two rounds of changes requested
- Reconciliation, second round: reconciled against live pull request state on
  release head `bbd89e1`, which #318 already sits on. #319 is a draft, behind
  its base, and blocked by a supervisor review requiring changes: schema 2
  provenance is self-asserted, so criterion 13 is unsatisfied and criterion 9
  has the same hole. Item 18 no longer calls that architecture cost paid and
  names no seat after the architect; item 17 no longer treats the five bug
  pages as ready to remove; the possible architect to analyst return is
  recorded against item 18 as one of the two ways the block clears; the
  superseded lifecycle section is marked where it sits, naming #315 and #312 as
  merged rather than open. `retros/2026-09-14-manage-seventh-use.md` records
  the use. The board was re-run on this tree and is quoted in the pull request.
- Reconciliation, first round: based on exact release head
  `bbd89e1` with #312 merged in, and re-measured there rather than on the head
  the first revision read. Six findings were taken: cold-start orientation
  now names four facts rather than a page route; the regression is the
  tester's until a bug names the lane; items 15 and 16 say when and no longer
  say what; the wall count is taken from the board quoted beside it;
  `an-open-finding-blocks-every-target` is kept in 0.0.2 as item 18 on the
  asker's decision, with #319 carrying the architecture; and this entry and
  `retros/2026-09-14-manage-sixth-use.md` are the evidence that was missing.
  All six backlogs were read. `kaal backlog` reports nothing blocked and this
  seat records no block: the manager is not blocked on its own account.
