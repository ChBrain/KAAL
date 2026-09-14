---
traces:
  parent: a-promotion-names-what-it-refuses@eeb479d0f62f43d0a33c38d0d15df8ee03308182302daceb7a0dde21f59108cb
  supersedes: a-promotion-names-what-it-refuses@abc146c1a3a4584d63eee64a43202e4b4570b3f024382a7c552fd3e8eb8e947b
reviews:
  parent/a-promotion-names-what-it-refuses: updated@eeb479d0f62f43d0a33c38d0d15df8ee03308182302daceb7a0dde21f59108cb by analyst: criterion 9 now keeps an ordinary red wall below release and names the all-target wall as the exception this task requires, so the parent and the supersede move together in this diff
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
- The five acceptance cases and the implementation from PR #301 prove those
  distinctions only inside each finding's named bindings. They do not prove
  that a gathered result, especially an empty one, belongs to the candidate
  the board is judging.
- The CodeQL producer currently runs on pushes and pull requests for `main`
  and on the default branch schedule. It does not analyze `release` or a pull
  request into `release`, so it cannot produce a same-candidate answer before
  that candidate merges.
- The gathered shape carries a scanner and findings, but no completed
  analysis identity or candidate binding. A copied or manually authored
  empty array therefore stays green after unrelated files are added, deleted,
  renamed or modified.
- Scanner retrieval has more failure states than absent and gathered. A
  wrong-candidate analysis, an unfinished or errored analysis, unavailable or
  unauthorized retrieval, and incomplete result collection are all unknown
  answers. None is a clean analysis.

## Assumptions

- This is one exception to the ordinary target rule, not a change to what
  `release` means. Every other red wall may stand there exactly as it does
  today.
- The finding is already reported. Gathering it is an act outside the wall,
  and the wall judges only the evidence that act left in the tree.
- A clean gathered result is evidence, not an absence. It must name enough
  repository-checkable provenance to prove a completed analysis of the exact
  candidate the board judges, even when it contains zero findings.
- Candidate means the complete repository content being admitted by this
  board judgment. A pull-request head, a provider-created merge ref and the
  commit that would result from merging are not assumed to be the same
  candidate.
- Applicable findings means the complete set of findings the selected
  scanner analysis says apply to that exact candidate, not one response page,
  one primary location or whatever a partial retrieval happened to return.
- Accepting risk does not close a finding. It records a governance decision
  that permits the named finding to stand, visibly, while that decision still
  applies.
- The code a waiver excuses is part of the decision. Once that code changes,
  the old decision says nothing about the new code and the finding is open
  again until governance acts again.

## Constraints

- Deterministic and offline, like every wall. The wall reaches no network,
  reads no token and consults no clock. Two runs over the same files give the
  same answer. An external producer may use those things before the wall runs.
- Absent and clean never answer the same. Missing gathered evidence is a red
  finding in its own words, not an empty collection and not not-applicable.
- Only completed, complete evidence for the exact candidate is clean. No
  analysis, a wrong candidate, an incomplete or errored analysis, unavailable
  or unauthorized retrieval, incomplete collection, stale evidence and open
  findings are distinct red facts.
- The evidence binds the whole candidate, not only paths named by findings.
  Adding, deleting, renaming or modifying candidate content after gathering
  makes even an empty clean result stale and red.
- Scan, complete gathering and board judgment happen in that order for one
  candidate. A board may not race an independent producer and consume older
  evidence while current gathering is incomplete.
- A pull request into `release` is scanned and gathered soon enough for a
  finding first produced there to block that same candidate before merge.
- Evidence provenance is checkable from repository-owned files. A person
  writing the legacy empty JSON shape cannot assert that an external analysis
  completed or that all of its applicable results were gathered.
- An open finding stops both `release` and `main`. The exception is limited to
  this wall; it does not tighten any other wall on `release`.
- A risk is accepted only by a waiver under `waivers/**`, the path the
  governance lane owns. A finding owner cannot accept the risk in the
  finding's own record or from that owner's seated lane.
- A waiver applies only while the code it names is unchanged. Its validity is
  bound to files in the tree and never to elapsed time.
- The exact candidate binding, evidence lifetime and location, producer and
  workflow topology, scanner translation and identity, merge-ref handling,
  self-reference avoidance, and how a waiver identifies its finding are
  decisions for the drawing, not this requirement.

## Acceptance criteria

1. On a tree with one open security finding, the security wall is red and
   `kaal gates` exits 1 for both a target of `release` and a target of `main`,
   naming the security wall in each answer. The same tree with every other
   wall green is enough to prove the exception.
2. A tree with no gathered security evidence makes the security wall red and
   says that the evidence is absent. A tree carrying completed and complete
   evidence for the exact candidate, with no open finding, makes it green.
   The two answers are observably different by reading only their files.
3. With no token in its environment, the security wall answers a clean tree.
   Running it twice over the same files gives the same exit code, stdout and
   stderr.
4. An open finding is accepted only when the applicable waiver is under
   `waivers/**`, which only the governance lane may carry. With that
   governance waiver `kaal gates` reports the security wall as waived and
   exits 0; it never reports the wall as clean, and no seated lane owns or
   allows the waiver path.
5. Given the same finding and waiver, changing the code the waiver excuses
   makes the security wall red again. The answer differs from the unchanged
   waived tree without consulting a clock.
6. Starting from a completed clean result for one candidate, modifying,
   deleting or renaming candidate content makes the security wall red as
   stale. This holds even though no finding named the changed file.
7. Adding candidate content after that clean result was gathered makes the
   security wall red as stale, including when all previously present files
   remain byte-for-byte unchanged.
8. The wall gives distinguishable red answers for no analysis, analysis of a
   different candidate, incomplete analysis, errored analysis, unavailable
   retrieval, unauthorized retrieval, incomplete collection, stale evidence
   and completed analysis with open findings. Only completed, complete clean
   analysis for the exact candidate is green.
9. Evidence is green only when it represents every applicable open finding
   from the exact completed analysis. A truncated collection and a
   primary-location-only collection are red; a complete multi-finding result
   reports every open finding rather than silently dropping one.
10. When current gathering has not completed, board judgment is red and does
    not reuse older clean evidence. Once gathering completes for that same
    candidate, the board may judge that current result.
11. A finding first discovered by the evaluation of a pull request targeting
    `release` makes `kaal gates` red for that same candidate before it merges.
12. When evidence identifies a pull-request head, merge ref or prospective
    merge result other than the candidate the board judges, the wall is red
    for the mismatch. Those identities are never silently substituted for
    one another.
13. The legacy empty snapshot, including a manually authored copy, is red
    because it cannot prove a completed analysis, exact candidate or complete
    collection. Provenance sufficient to establish those facts is checkable
    from the repository-owned evidence alone.
14. The repository does not activate the security gate until the amended
    drawing is current, criteria 1 through 13 pass, and a current zero-failure
    run records that proof. Activation remains a later governance act.

## Open questions

- Does exact binding use a commit SHA, tree digest, content manifest or
  another identity?
- Is pre-board evidence committed or ephemeral, and where does it live?
- What workflow or job topology orders scan, complete gathering and the
  board without a race?
- Does gathering translate GitHub API responses, SARIF or another CodeQL
  result surface?
- Which CodeQL tool and category identities define the applicable set?
- Which pull-request candidate is analyzed and judged, and how are head,
  merge-ref and prospective merge-result identities handled?
- How does a candidate-wide binding avoid self-reference or commit recursion
  if evidence is committed?
- How does a waiver identify the finding it accepts?

## Handoff

- Task: an-open-finding-blocks-every-target
- Criteria: 14; tests: 14 (equal)
- Red run: `node --test
requirements/an-open-finding-blocks-every-target/acceptance.test.mjs`; the
  original five remain green, activation remains safely inactive, and eight
  current-evidence cases are red against PR #301, with full failure details
  recorded in the pull request
- Tests: `acceptance.test.mjs`, beside this file; it asks only `kaal gates`
  and the gate each semantic tree declares
- Fixture contract: the original drawing still owns `absent`, `clean`,
  `open`, `waived` and `changed` under
  `architecture/an-open-finding-blocks-every-target/fixtures/`; their contents
  remain its decision. The amendment adds candidate-content and rejected
  legacy fixtures beside this test, plus semantic names under
  `architecture/an-open-finding-blocks-every-target/fixtures/current-evidence/`
  for the next drawing to answer without fixing its evidence schema, path or
  workflow topology here
- Open questions: 8, listed above
- Blocked on: nothing
- Unblocks: a reviewed drawing for current evidence, then implementation and
  proof, then the governance act that may activate the security gate
- Makes review-needed: the existing drawing and its contracts, because their
  finding-local bindings and independent producer order no longer answer this
  requirement's candidate-wide currentness and completeness guarantees
- Supersedes: the clause in `a-promotion-names-what-it-refuses` criterion 9
  saying that a red wall on `release` exits 0. That criterion is amended in
  this diff so the clause still holds for an ordinary red wall and not for a
  wall whose own requirement binds `release`; its `main` clause is untouched
- People: none
