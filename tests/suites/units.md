---
traces:
  parent: strategy@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1
cases:
  bin/lib/promote.test.mjs: 554a18dbf817385ea43d23af1a298c7e1b2f28eba3767d92a4e554d3ff291c4c
  bin/lib/class.test.mjs: ef024a79fc7b69b3aa1ffa353a97ffefb2cd2d26fdd3c42c23746353005ab504
  bin/lib/applies.test.mjs: e1af6a2dde4b07ee7b85a2b1c8c06da3adf71f4a33b591460fcb3a65aa45ae9d
  bin/lib/frontmatter.test.mjs: d8f3afed85fa1b75d39bba4871e73a62b3b9f36191a9d4b7ee9ab47ce87e4413
  bin/lib/plans.test.mjs: bf5d1080c227b437ff5478376dbbc178ea04379000a3d9f449079f449c51eeca
  bin/lib/seats.test.mjs: e772a35dafa54dbc9e1851c8d5247074393239dbbbb9308d2d018023b2510871
  bin/lib/traces.test.mjs: d4ac671061589837bdb523380a618ffb57e6afda593c36a52a499f688d9a2b60
  skills/analyse/scripts/count.test.mjs: 94d67a0b353f913eeeb965147cb104528985fd431edcb6c4daba014ef917d774
reviews:
  cases/bin/lib/promote.test.mjs: reviewed-no-impact@554a18dbf817385ea43d23af1a298c7e1b2f28eba3767d92a4e554d3ff291c4c by developer: the line naming this case was written before its last unit, the one about reading a ref where a person types one; it is the same case and this suite still covers it
  cases/bin/lib/plans.test.mjs: reviewed-no-impact@bf5d1080c227b437ff5478376dbbc178ea04379000a3d9f449079f449c51eeca by tester: it gained the unit that holds the wall rule a refactor dropped; the case is the same case and this suite still covers it
---

# Test suite: units

## What it covers

the behaviour a module has that no seam mentions, written by the developer and sitting beside the code it reads.

## Cases

Every case this suite names lives outside `tests/`, in the lane of the seat that owns what it proves. They are named in the `cases` block above and nowhere else: this page points at them and never holds them.
