---
traces:
  parent: strategy@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1
suites:
  acceptance: b53068623fd4ee2fd3f4696d3356a69add5c9ca71a9d16f64753a2622be58962
reviews:
  suites/acceptance: reviewed-no-impact@b53068623fd4ee2fd3f4696d3356a69add5c9ca71a9d16f64753a2622be58962 by analyst: the suite recorded a read of a case that gained a criterion, which changes the suite's page and never which suites this plan uses; `--write` advancing that pin is the same page moving again
  parent/strategy: updated@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1 by tester: the strategy gained the section naming the five kinds `tests/` holds, and a plan is one of them
---

# Test plan: acceptance

## Wall

- Wall: acceptance

What this plan proves is that every criterion a requirement states is true of this tree. It is written by the analyst, who is blind below their own layer: a test here speaks to a command, a file or a page, and a test that reaches behind that surface has stopped being an acceptance test.

## Suites

It uses the `acceptance` suite, which names its cases by path. A plan picks suites; it owns neither the place they live nor how many there are, and both were once written here.

## Cases

A case is a numbered test inside a suite, named for the criterion it settles, so a reader moving between the requirement and its suite meets the same numbers in the same order. A requirement with more criteria than cases is a requirement whose proof is short, and the wall says so.
