---
traces:
  parent: strategy@ff07a3182f02bd8f20a913c8022c91775f86a670675a436aca8d0dada9787144
---

# Test plan: contracts

## Wall

- Wall: contracts

What this plan proves is that every seam a drawing fixes still holds. It is written by the architect, who decides the seams and is blind to what is behind them: a test here drives one side and reads the other, and a test that reaches into an implementation has become a unit test and belongs to a different plan.

## Suites

Its suites live under `architecture/*/contracts.test.mjs`, and today that matches 53 suites.

## Cases

A case is a numbered test inside a suite, one per seam and numbered to match the drawing's own list, so the picture, the list and the suite all count the same way.
