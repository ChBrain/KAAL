---
traces:
  parent: strategy@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1
suites:
  units: eeb4ce477d244b65758c2af0029fb7ee3ffb2567d7b51802d16719ccf2a1f32d
reviews:
  suites/units: reviewed-no-impact@eeb4ce477d244b65758c2af0029fb7ee3ffb2567d7b51802d16719ccf2a1f32d by tester: the suite recorded a read of a case that moved, which changes the suite's page and never which suites this plan uses; the fourth, fifth and sixth times today, and `--write` advancing the pin is itself a seventh, because the sha a read names is the sha before the write that read clears
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
