---
traces:
  parent: strategy@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1
suites:
  contracts: 0a12095c887a5aa489acfdf7df9e7c0f0b1d0fd546f0aa2d4a824534d558404b
reviews:
  suites/contracts: reviewed-no-impact@0a12095c887a5aa489acfdf7df9e7c0f0b1d0fd546f0aa2d4a824534d558404b by architect: the suite gained the case this task's contracts are, and recorded a read of one whose line was written early; neither changes which suites this plan uses
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
