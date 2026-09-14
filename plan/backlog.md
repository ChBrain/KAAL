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
