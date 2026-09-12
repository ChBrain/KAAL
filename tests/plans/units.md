---
traces:
  parent: strategy@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1
suites:
  units: d93c97947c3d28f97025b667311ea21e0c4fde95818a2db7f6ac099b8926af8d
reviews:
  suites/units: reviewed-no-impact@d93c97947c3d28f97025b667311ea21e0c4fde95818a2db7f6ac099b8926af8d by developer: the suite re-pinned one case it already names, the units beside `gates.mjs`; which suites this plan uses is unchanged and no case was added to or taken from it
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
