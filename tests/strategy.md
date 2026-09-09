---
traces:
  parent: none
---

# Test strategy

This league tests in three places because three different things want
proving, and each of them can be wrong while the other two are right.

## Two questions, and both of them are testing

The tester keeps two questions apart, and most arguments about quality are
really an argument about which one was meant.

**Verification** asks whether a thing is what it was specified to be. It is a
question with one right answer, so it can be settled the same way twice, and
a thing that can be settled the same way twice can be a wall. That is why the
board is deterministic and offline: every wall on it is verification, and the
three plans below are the three walls that run tests.

**Validation** asks whether a thing works for whoever asked. It is a question
about a reader, a model or a person meeting the work, and it cannot be
settled the same way twice. So it is never a wall, and the league does not
pretend otherwise. It lives in the eval records under `evals/`, where a
skill's move stands at the skill rung only with complete, passing, fresh
records from at least two distinct models.

What the ledger wall reads there is the record: every field present, the
verdict pass, the three shas of the ask, the expectation and the skill still
matching the files, and two distinct models rather than one. What it never
reads is the output those models judged. Whether a pass was deserved belongs
to whoever gave it, and a wall that graded that would be a wall consulting
the thing it judges, which this league has a name for.

So a non deterministic answer is held to account by a deterministic wall over
its evidence, and the wall's whole claim is that a judgement was made, freshly
and more than once, and written down.

Neither question outranks the other and a thing can pass one and fail the
other. A tool that does exactly what its criteria say and that nobody can use
has been verified and not validated; a tool everybody likes that nobody can
prove has been validated and not verified.

## The tester argues

The tester is a seat and not a service. It owns the method, and every other
seat owns what the method is pointed at in its own work, which is why the
cases live with what they test rather than here. But owning the method
carries standing: the tester argues with the analyst about a criterion nobody
could fail, with the architect about a seam nobody could drive, and with the
developer about a behaviour nobody could reach. If you cannot test it you
cannot have it, and the tester is the seat that gets to say so before the
work is taken rather than after it is built.

That is the same rule as the one below, read from the other end. The rule
says a seat that cannot name a failure hands the question back; this says
somebody is there to hand it back to, and to insist.

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

## What has no plan and is still tested

The eval records are validation and have no plan, because a plan names a wall
and validation is not a wall. They are named here so that the absence is a
statement rather than an oversight: the league tests in three places
deterministically and in one place it cannot, and the fourth is the one where
a person or a model reads the work and says whether it is any good.

## Below the plans

A suite is a file. A case is a numbered test inside one. Neither is a
document, so neither is written down here: the plans name where the suites
live and count them, and the cases are read where they run.

## Root

- Root because: it is the test tree's own root, and the trunk above all three
  trees is `kaal/league.md`. This page says why the league tests three ways;
  the trunk says what the league is.
