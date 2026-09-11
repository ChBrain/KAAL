---
traces:
  parent: strategy@768288f9e1505f9808f14387940e6774a2f7facfde762963e43262d308452e8a
---

# Test plan: acceptance

## Wall

- Wall: acceptance

What this plan proves is that every criterion a requirement states is true of this tree. It is written by the analyst, who is blind below their own layer: a test here speaks to a command, a file or a page, and a test that reaches behind that surface has stopped being an acceptance test.

## Suites

Its suites live under `requirements/*/acceptance.test.mjs`, and today that matches 65 suites.

## Cases

A case is a numbered test inside a suite, named for the criterion it settles, so a reader moving between the requirement and its suite meets the same numbers in the same order. A requirement with more criteria than cases is a requirement whose proof is short, and the wall says so.
