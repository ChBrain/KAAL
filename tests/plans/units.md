---
traces:
  parent: strategy@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1
suites:
  units: faca719e1a925b10ec5c6ca6b3b29404a3d705cad864c0631016bee43f1cb25e
reviews:
  suites/units: reviewed-no-impact@faca719e1a925b10ec5c6ca6b3b29404a3d705cad864c0631016bee43f1cb25e by developer: the suite gained the one case that is about the command rather than a module, which this plan's wall does not yet run; which suites this plan uses is unchanged and the gate is governance's
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
