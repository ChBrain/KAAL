---
traces:
  parent: strategy@ff07a3182f02bd8f20a913c8022c91775f86a670675a436aca8d0dada9787144
---

# Test plan: acceptance

## Wall

- Wall: acceptance

What this plan proves is that every criterion a requirement states is true of this tree. It is written by the analyst, who is blind below their own layer: a test here speaks to a command, a file or a page, and a test that reaches behind that surface has stopped being an acceptance test.

## Suites

Its suites live under `requirements/*/acceptance.test.mjs`, and today that matches 58 suites.

## Cases

A case is a numbered test inside a suite, named for the criterion it settles, so a reader moving between the requirement and its suite meets the same numbers in the same order. A requirement with more criteria than cases is a requirement whose proof is short, and the wall says so.
