---
traces:
  parent: a-promotion-names-what-it-refuses@298ad0e059d4c1d07644275c2c7ad046b4700c252a205f5f6bfeda9ed0371eb1
  supersedes: nothing
---

# Requirement: an-open-finding-blocks-every-target

## Goal

A security finding reported against this repository cannot sit open while
work proceeds, because one wall reads the evidence held in the tree and an
open finding stops every target, including `release`.

## What the runs said

- The board has fourteen walls that may stand red on `release`. That is the
  licence work in progress needs: `kaal gates` reports their colour and exits
  0 there, while promotion to `main` refuses them.
- That licence is wrong for a security finding. A finding may belong to code
  written by any seat, and letting its wall stand below the promotion lets
  more work accumulate on top of code already reported unsafe.
- The scanner cannot be the wall. It is outside the tree, while every wall in
  this league is deterministic, offline and able to answer from a checkout.
  Whatever was gathered must therefore be evidence inside the tree before
  the wall judges it.
- `bin/lib/reviews.mjs` says why time is not evidence here: `a bound in days
would make a tree go red while nobody touched it, which is a wall failing
on a schedule rather than on a change`. The same rule applies to findings
  and to the acts that accept them.
- An absent input and an empty input are different facts. The first says
  nobody gathered what the wall needs; the second says the gathered evidence
  held no open finding. Answering both as clean would ship the vacuous pass
  this tree has already met three times this week.

## Assumptions

- This is one exception to the ordinary target rule, not a change to what
  `release` means. Every other red wall may stand there exactly as it does
  today.
- The finding is already reported. Gathering it is an act outside the wall,
  and the wall judges only the evidence that act left in the tree.
- A clean gathered result is evidence, not an absence. It must be possible to
  tell which of those two trees was read without consulting the scanner.
- Accepting risk does not close a finding. It records a governance decision
  that permits the named finding to stand, visibly, while that decision still
  applies.
- The code a waiver excuses is part of the decision. Once that code changes,
  the old decision says nothing about the new code and the finding is open
  again until governance acts again.

## Constraints

- Deterministic and offline, like every wall. The wall reaches no network,
  reads no token and consults no clock. Two runs over the same files give the
  same answer.
- Absent and clean never answer the same. Missing gathered evidence is a red
  finding in its own words, not an empty collection and not not-applicable.
- An open finding stops both `release` and `main`. The exception is limited to
  this wall; it does not tighten any other wall on `release`.
- A risk is accepted only by a waiver under `waivers/**`, the path the
  governance lane owns. A finding owner cannot accept the risk in the
  finding's own record or from that owner's seated lane.
- A waiver applies only while the code it names is unchanged. Its validity is
  bound to files in the tree and never to elapsed time.
- How findings enter the tree, their record and location, how a code change is
  detected, and how a waiver identifies its finding are decisions for the
  drawing, not this requirement.

## Acceptance criteria

1. On a tree with one open security finding, the security wall is red and
   `kaal gates` exits 1 for both a target of `release` and a target of `main`,
   naming the security wall in each answer. The same tree with every other
   wall green is enough to prove the exception.
2. A tree with no gathered security evidence makes the security wall red and
   says that the evidence is absent. A tree carrying gathered evidence with
   no open finding makes it green. The two answers are observably different
   by reading only their files.
3. With network and clock access refused and no token in its environment, the
   security wall answers a clean tree. Running it twice over the same files
   gives the same exit code, stdout and stderr.
4. An open finding is accepted only when the applicable waiver is under
   `waivers/**`, which only the governance lane may carry. With that
   governance waiver `kaal gates` reports the security wall as waived and
   exits 0; it never reports the wall as clean, and no seated lane owns or
   allows the waiver path.
5. Given the same finding and waiver, changing the code the waiver excuses
   makes the security wall red again. The answer differs from the unchanged
   waived tree without consulting a clock.

## Open questions

- What gathers scanner findings into the tree, and at which point in the
  work does that act happen?
- What is the finding record's shape and where does it live?
- How does the wall bind a finding or waiver to the code it concerns?
- How does a waiver identify the finding it accepts?

## Handoff

- Task: an-open-finding-blocks-every-target
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test
requirements/an-open-finding-blocks-every-target/acceptance.test.mjs`; all
  five red because the architect-owned semantic trees and the wall do not
  exist yet, with each test stopped by an assertion naming its missing tree
- Tests: `acceptance.test.mjs`, beside this file; it asks only `kaal gates`
  and the gate each semantic tree declares
- Fixture contract: the drawing owns trees named `absent`, `clean`, `open`,
  `waived` and `changed` under
  `architecture/an-open-finding-blocks-every-target/fixtures/`; their contents
  are the architect's decision
- Open questions: 4, listed above
- Blocked on: nothing
- Unblocks: the drawing that chooses the evidence and waiver contracts, then
  the wall that keeps an open finding off both targets
- Supersedes: nothing; it makes one security exception to
  `a-promotion-names-what-it-refuses` criterion 9 without changing the other
  walls' licence on `release`
- People: none
