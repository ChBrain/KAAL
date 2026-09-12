---
traces:
  parent: strategy@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1
cases:
  bin/lib/acceptance.test.mjs: dad6cb7a571aa219ca2bc5d1ecbfaed81fd8cac23e99573e7213e04bc6c5dfae
  bin/lib/agents.test.mjs: e44a7e5ae36f023e4f72fceea82c514279c6d5185f74e34b3155eaf13acddc4c
  bin/lib/boundary.test.mjs: 21805bb1235da8291a6d7b90202d9521a962c648ee5d3729bd540ce577bd303b
  bin/lib/drawings.test.mjs: 079777f6386638984bc3e7a0bfe17d3be96996b81bf0f9c766c4c5bfb7702b59
  bin/lib/fixtures.test.mjs: 2a8ea7a93a27bad4b899367c69769b0edb626cd14bc068b3ef587ba4aa42fb32
  bin/lib/gates.test.mjs: f20722f234a1d0aea854fc1ba5600b7d8a17189c637587b0969f2d2c38fa0ccf
  bin/lib/judged.test.mjs: ea777763ffd7e7b2f2eb8c7cf277406a5c901e6f7783100f1db2655603b8f7f7
  bin/lib/ledger.test.mjs: 48e25762907d1efb6aca7894edb8be6ef6e024e9c12f798ce7ae9c78e307f000
  bin/lib/record.test.mjs: 94c65431a35229599623306a9a8f969c46c49b32a73e8e6cd742ccabb7c03d8d
  bin/lib/release.test.mjs: ae645e5d014b94a0f11bab63bea7c9800b12f8afdd38ec7e9a13ee935713d50d
  bin/lib/retros.test.mjs: 0006a3a14d03a31ea1c3cb2fe0085c145149aecff99128d5d4485ce814a0fafe
  bin/lib/rules.test.mjs: 552bf7dec00fa183bc720cfbfcdc4adda4edbfcb294ce2973866160e11bed194
  bin/lib/runner.test.mjs: 85f0c6809846e36b0c75600d8c5e2cdfd6b5896f9f53066152f3e67f5d408288
  bin/lib/sha.test.mjs: 1ecd45936c4654c00f5c273faa881eb1059cf13f8f0f499d3ae44ed3073afc6a
  bin/lib/standard.test.mjs: 0f337bd94fe96a951fbec100634045830c4aa6e3ebf412b251d96a85d3bbeb1a
  bin/lib/promote.test.mjs: 554a18dbf817385ea43d23af1a298c7e1b2f28eba3767d92a4e554d3ff291c4c
  bin/lib/class.test.mjs: ff1fa58ceee2c20195804a66a926aac3db75a37ea7750d5eade3097cb99b2b0a
  bin/lib/applies.test.mjs: e1af6a2dde4b07ee7b85a2b1c8c06da3adf71f4a33b591460fcb3a65aa45ae9d
  bin/lib/frontmatter.test.mjs: a07fbaa3c06ef21461d7d54bd2589246bdeb92f50dc55ffb84216a0459036db2
  bin/lib/plans.test.mjs: 1ab584c4d087f66be7ca5c13e5308c6a73ea2a2ffd711be2ed88481d18432452
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
