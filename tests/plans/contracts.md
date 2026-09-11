---
traces:
  parent: strategy@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1
suites:
  contracts: 20e19a92d632c1a8020f9f51885acc45325b13a560e0ed679122d0b928c35e10
reviews:
  suites/contracts: reviewed-no-impact@20e19a92d632c1a8020f9f51885acc45325b13a560e0ed679122d0b928c35e10 by tester: the suite recorded a read of a case that moved, which changes the suite's page and never which suites this plan uses; this is the second time today that one read cost two
  parent/strategy: updated@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1 by tester: the strategy gained the section naming the five kinds `tests/` holds, and a plan is one of them
---

# Test plan: contracts

## Wall

- Wall: contracts

What this plan proves is that every seam a drawing fixes still holds. It is written by the architect, who decides the seams and is blind to what is behind them: a test here drives one side and reads the other, and a test that reaches into an implementation has become a unit test and belongs to a different plan.

## Suites

It uses the `contracts` suite, which names its cases by path. A plan picks suites; it owns neither the place they live nor how many there are, and both were once written here.

## Cases

A case is a numbered test inside a suite, one per seam and numbered to match the drawing's own list, so the picture, the list and the suite all count the same way.
