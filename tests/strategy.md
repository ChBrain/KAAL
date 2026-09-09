---
traces:
  parent: none
---

# Test strategy

This league tests in three places because three different things want
proving, and each of them can be wrong while the other two are right.

## The three plans

The **acceptance** plan is motivated by the requirements. A criterion is a
sentence somebody can disagree with, and its test is what settles the
disagreement, so every requirement carries one test per criterion, written
against the surface the ask names and blind to how anything is built.

The **contracts** plan is motivated by the architecture. A drawing fixes
seams, and a seam is a promise between two sides, so every drawing carries
one test per seam, driving one side and reading the other, blind to what is
behind either.

The **units** plan is motivated by the code. A function has behaviour its
seam never mentions, and the developer is the only seat that can see it, so
the code carries tests of its own that no other plan would ever write.

Those three are the walls the board already runs, and this page is the first
place that says why there are three rather than one.

## What cannot be tested cannot be built

Code answers tests. A thing that cannot be tested cannot be built here,
because nobody would ever know whether it were true: a claim with no way to
fail is a claim nobody has checked, and a green board that holds such a claim
is telling a reader something it does not know. So a seat that cannot say how
a thing would fail does not take the work; it hands the question back.

This is stated and not walled, on purpose. Whether a thing could have been
tested is a judgement about work nobody did, and this league does not turn a
judgement into a gate.

## The nine walls that run no tests

Nine of the board's twelve walls run a check over the tree rather than a
suite of tests, and none of them has a plan. That is not an exemption.
Everything in this league goes through the chain from requirements to
operations, so each of those nine arrived as an ask, became a requirement
with criteria, was drawn with seams, and was built. They are things the three
plans already hold, at all three layers, and a fourth plan for them would be
a plan about the same tests a second time.

A fourth plan waits for a fourth wall that runs tests.

## Below the plans

A suite is a file. A case is a numbered test inside one. Neither is a
document, so neither is written down here: the plans name where the suites
live and count them, and the cases are read where they run.

## Root

- Root because: it is the test tree's own root, and the trunk above all three
  trees is `kaal/league.md`. This page says why the league tests three ways;
  the trunk says what the league is.
