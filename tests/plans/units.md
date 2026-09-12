---
traces:
  parent: strategy@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1
suites:
  units: c30c6f10eb926caad1d50a2bdf255e1da106cc1f504bb2eb23684b8ca6dfb2ec
reviews:
  suites/units: reviewed-no-impact@c30c6f10eb926caad1d50a2bdf255e1da106cc1f504bb2eb23684b8ca6dfb2ec by developer: the suite gained the fifteen units that moved beside the modules they import, which are the same cases this plan's wall already ran from the tester's tree; which suites this plan uses is unchanged
  parent/strategy: updated@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1 by tester: the strategy gained the section naming the five kinds `tests/` holds, and a plan is one of them
---

# Test plan: units

## Wall

- Wall: units

What this plan proves is that the code does what its author meant, below every seam. It is written by the developer, who is the only seat that can see the behaviour a seam never mentions, and it is the one plan whose tests may know how a thing is built, because that is the whole of what they are for.

## Suites

It uses the `units` suite, which names its cases by path. A plan picks suites; it owns neither the place they live nor how many there are, and both were once written here.

## Cases

A case is a named test inside a suite. These are not numbered against anything, because there is no list above them to match: a unit answers to the code and not to a criterion or a seam.
