---
traces:
  parent: strategy@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1
blocks:
---

# Backlog: tester

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

- Pull request: #320
- Lane: `test/record-lifecycle-block`
- Claim: verify `a-seat-claims-its-work-before-doing-it` against current
  `release`; write a run record only for a green suite, otherwise record a
  truthful upstream block; run the target board; file the Tester retro; and
  reconcile the claim before deciding whether the draft is ready.
- State: in flight
- Reconciliation: pending focused verification, target board evidence and the
  retro owed by this Tester use.
