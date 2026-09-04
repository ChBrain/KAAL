---
name: test
description: "In test mode you carry the discipline of the proof, the one skill every seat loads and no seat owns. You take a want at your own layer (a criterion, a seam, a unit, a release) and produce the pair: the want restated as a test that can fail, and its proof that the test fails for the right reason and passes for the right reason, blind to every layer below yours, declared as a wall or a rubric or a manual step. You never write another seat's tests, never skip or disable one, and never turn a judgement into a gate. Use whenever any seat writes, runs, or declares a test."
license: MIT
---

# Test

In test mode you are whichever seat you already are, holding the discipline
of the proof. Every seat owes a pair, _I want this_ and _this is how I test
that it is true_, and this skill is the second half done properly. It is not
a seat. The analyst loads it to write acceptance tests, the architect for
contract tests, the developer for unit tests, the operator for deploy tests.
The layer changes; the discipline does not.

- **the want**: a want you already hold at your layer, restated as a test
  that can fail on a specific run;
- **the proof**: evidence that the test fails when the want is unmet and
  passes when it is met, and nothing else moves it.

## 1. Know your layer, and stay blind below it

Each layer is driven by the stage above it and blind to the stages below it:

| layer      | driven by    | written by | blind to                   |
| ---------- | ------------ | ---------- | -------------------------- |
| acceptance | requirements | analyst    | the architecture, the code |
| contract   | architecture | architect  | the code                   |
| unit       | code         | developer  | nothing: protect yourself  |
| deploy     | deployment   | operator   | nothing: protect yourself  |

A test that reaches below its layer (an acceptance test importing a module,
a contract test reading behind a seam) has changed layer and owner. Blindness
is an import boundary, and where the repository can check imports it is a
wall; until then you check it by reading.

## 2. Restate the want as a test

One want, one test. The test names one observable and one expected value at
the surface of your layer. Ask the two questions before writing it: could
this fail on a specific run, and would the owner of the want agree that
failing it means the want is unmet? If either answer is no, it is not a test
yet; it is a wish or a description.

Declare the kind while you write it, never after:

- **deterministic**: code decides, no model in the verdict; it gates;
- **harnessed**: a model reads a rubric, N times with a skeptic, and the
  verdict rule is code; it reports and never gates, because what it judges is
  meaning;
- **manual**: exact steps and an exact expected result, walked by a person,
  marked `manual`.

Forcing a judgement into a deterministic gate is worse than leaving it out;
paying a model to decide what equality decides is waste. Pick the kind by
what decides the verdict.

## 3. Prove the proof

- **Seen red.** Run it before the want is met. It must fail, and for the
  stated reason: read the failure, do not count it. A test that passes on
  nothing tests nothing.
- **Seen green on a stand-in.** Write a throwaway that meets the want, in
  scratch, see the test pass on it, discard it. This is where the tests that
  are red for the wrong reason are found, and the first real use of the
  analyse skill found three that way.
- **Moves for one reason.** If the test could turn green by a change that
  does not meet the want, or red by one that does not break it, it is
  measuring the wrong thing; tighten it.
- **Counts equal.** One want, one test, numbered to match, on both sides.
  Check the count; do not trust it.

## 4. Scope

Allowed: write, run, and declare tests for your own want at your own layer;
read the failure and the pass; hand a test you cannot make honest back to the
owner of the want; declare a harness rubric where meaning decides.

Not allowed: write a test for another seat's want; edit another seat's test;
skip, disable, or quarantine any test to get green; test below your layer;
turn a harnessed or manual verdict into a gate; report a count or a verdict
from a run you did not just make.

## 5. Hand off

There is no handoff of this skill on its own: its output is the proof half of
whichever seat loaded it, and lands in that seat's lane, proof first. What
every receiving seat may expect from a proof written under this discipline:
each test declared by kind, seen red for the stated reason, seen green on a
stand-in, one per want, and the run recorded as a run just made.

When the seat's use ends, its `retro-4ls` covers this discipline too; a
Lacked item about the proof goes to the analyst against this skill.
