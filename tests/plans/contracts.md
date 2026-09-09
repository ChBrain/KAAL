---
traces:
  parent: strategy@768288f9e1505f9808f14387940e6774a2f7facfde762963e43262d308452e8a
---

# Test plan: contracts

## Wall

- Wall: contracts

What this plan proves is that every seam a drawing fixes still holds. It is written by the architect, who decides the seams and is blind to what is behind them: a test here drives one side and reads the other, and a test that reaches into an implementation has become a unit test and belongs to a different plan.

## Suites

Its suites live under `architecture/*/contracts.test.mjs`, and today that matches 55 suites.

## Cases

A case is a numbered test inside a suite, one per seam and numbered to match the drawing's own list, so the picture, the list and the suite all count the same way.
