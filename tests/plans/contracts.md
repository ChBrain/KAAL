---
traces:
  parent: strategy@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1
suites:
  contracts: 3244c260211610828866c4b668f74e275c5efdb5260fc2ceab52495dc9a2660f
reviews:
  suites/contracts: reviewed-no-impact@3244c260211610828866c4b668f74e275c5efdb5260fc2ceab52495dc9a2660f by architect: the security contract case grew from five contracts to eight when its drawing was amended; this plan still selects the same suite and no case was added or removed
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
