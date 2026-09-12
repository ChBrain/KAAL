---
traces:
  parent: strategy@dd629223ed7ee3c94796be1079303dc17a42d0093b334566b15bfa4c5d1dabc1
suites:
  acceptance: f15391c2e75dfd4571b1af2387646694668f5f18ea70432039bccf3f07dd12e4
reviews:
  suites/acceptance: reviewed-no-impact@f15391c2e75dfd4571b1af2387646694668f5f18ea70432039bccf3f07dd12e4 by analyst: the suite recorded a read of a case that moved onto fixed ground, which changes the suite's page and never which suites this plan uses; `--write` advancing that pin moves the same page again
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
