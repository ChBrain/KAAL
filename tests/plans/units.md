---
traces:
  parent: strategy@ff07a3182f02bd8f20a913c8022c91775f86a670675a436aca8d0dada9787144
---

# Test plan: units

## Wall

- Wall: units

What this plan proves is that the code does what its author meant, below every seam. It is written by the developer, who is the only seat that can see the behaviour a seam never mentions, and it is the one plan whose tests may know how a thing is built, because that is the whole of what they are for.

## Suites

Its suites live under `tests/*.test.mjs` and `skills/*/scripts/*.test.mjs`, and today that matches 23 suites.

## Cases

A case is a named test inside a suite. These are not numbered against anything, because there is no list above them to match: a unit answers to the code and not to a criterion or a seam.
