---
traces:
  parent: a-diff-carries-one-seat@94929e3013fa24a1d998a05ed2e7026cc9181cc56083ae07fc2858daf937953a
  supersedes: a-seat-carries-its-own-backlog@11ddece8d1df62f6dfd8315f5d8d8db7e6c30c0052e7bc575705cd04c85d0816
---

# Requirement: a-seat-claims-its-work-before-doing-it

_Ask, from Kai: every seat works through Plan, Do, Check, Act, with a draft
pull request and its own backlog making the intended work visible before it
starts. Counted as two tasks. This is the first, the seat's common cycle. The
manager's derived view and its duplicate and abandoned claim findings are the
second, `the-manager-sees-every-live-lane`, which this task unblocks._

## Goal

Every seat wants its work to have one visible, reviewable lifecycle from
intent through human review, so another reader can tell what the seat claimed,
what it is doing, what it checked and whether it has honestly finished its
act without treating unmerged product content as repository truth.

The lifecycle is an enforced decision, not only wording. Given normalized,
repository-owned evidence about a pull request, its seat, its claims and the
reconciliation of each item, a provider-neutral decision surface says whether
that lane is valid or red.

## What the runs said

- `node bin/kaal.mjs backlog .` read all six declared backlog pages and
  answered `nothing is clear yet` and `nothing is blocked`; every page carries
  only an empty `blocks:` map, so none can state intended work or its pull
  request today.
- `rg` over the six seat skills found the four named steps only in
  `skills/manage/SKILL.md`. Its Plan says available work is never written, and
  its Act ends at pushed and open, rather than at the draft to ready transition
  in this ask.
- `kaal.config.json` declares six seats and eleven pull request lanes. The
  `a-diff-carries-one-seat` acceptance suite is green with seven passing cases,
  so one lane carrying no second seat is already held and is not a new task.
- The baseline `npm test` run on `release` at
  `2e836bd9574929ed0362f12cff18584f7cbd0b4e` reported 369 acceptance cases,
  234 contract cases and 196 units passing. It also reported three existing
  regressions and their trace findings; none names this ask.

## Assumptions

- `AGENTS.md`, the repository's contract for any runtime, is the surface where
  one common cycle can govern every declared seat. The ask did not choose
  whether the same words must also travel inside every seat skill.
- Plan is complete when the draft pull request and the claim in that seat's
  backlog both exist and agree, before Do begins. The order needed to obtain a
  pull request identifier inside that Plan step is free.
- A claim records intended work, not the derived set of work a seat could do.
  That distinction preserves the existing rule that availability is computed
  while moving the earlier requirement's claim that a backlog contains blocks
  and nothing else.
- Ready for human review is an execution state, not proof that a task is
  delivered. Delivery continues to be answered by merged repository evidence
  and the tester's run records.
- The acceptance fixtures use a normalized semantic vocabulary. They are not a
  proposed backlog serialization or provider payload. An adapter may obtain the
  same facts from any provider and repository representation.

## Constraints

- One pull request remains one declared lane and carries one seat or none
  (`a-diff-carries-one-seat`). Several claimed items may share it only when
  they belong to that same seat (ask).
- The claim is written in the claiming seat's own backlog. No manager or other
  seat edits it (`a-seat-carries-its-own-backlog`; ask).
- Check includes the seat's proof, board evidence for the target, a
  `retro-4ls` retro and reconciliation of every claim in the pull request
  (ask; `AGENTS.md`).
- A pull request is the execution container, its backlog entry is a
  repository-owned claim, and unmerged product content is not repository truth
  (ask). Ready means ready for a person's review, not accepted or delivered.
- This task fixes no claim serialization, provider query, workflow or separate
  project board. `kaal lifecycle <fixture>` is the deterministic conformance
  surface used by this requirement's proof, not a choice of which wall or
  workflow must enforce the decision. Provider adaptation, persistent claim
  shape and enforcement topology belong to architecture.
- Plan-before-Do can be established only when repository-owned evidence gives
  a durable order, such as commit ancestry, between the exact claim and the
  substantive work. Provider timestamps, observation time and prose assertions
  do not establish it. Where no durable order exists, the decision must say
  that Plan-before-Do was not established; it must not invent an order.

## Acceptance criteria

1. The operating contract says the same Plan, Do, Check, Act cycle applies to
   every declared seat and presents the four steps in that order. Plan creates
   the draft pull request and its exact own-backlog claim before Do performs the
   claimed work; Check completes proof, target board evidence, retro and claim
   reconciliation; Act moves draft to ready only after reconciliation. It also
   states that the pull request is the execution container, the seat backlog is
   the repository-owned claim, and only merged product content is repository
   truth.
2. `kaal lifecycle` exits 0 on each of `fixtures/draft-one.json` and
   `fixtures/draft-many.json`: a draft pull request with one or more exact
   claims in its own seat's backlog is valid in-flight work, including several
   items belonging to that same seat.
3. `kaal lifecycle` exits 1 on `fixtures/other-seat.json`, naming the pull
   request's seat and the foreign seat: one lane may not carry a claim that
   belongs to another seat.
4. `kaal lifecycle` exits 1 on `fixtures/ready-without-exact-claim.json`, naming
   the ready pull request and the absent exact claim. A claim for some other
   pull request does not satisfy Plan.
5. `kaal lifecycle` exits 1 on `fixtures/ready-unreconciled.json`, naming the
   unreconciled item: a ready pull request is red while any claimed item is
   neither completed, removed from scope nor truthfully recorded as blocked.
6. `kaal lifecycle` exits 0 on `fixtures/ready-reconciled.json`, whose claimed
   items respectively have repository-owned completed, removed-from-scope and
   matching block evidence; it exits 1 on `fixtures/ready-false-block.json`,
   naming the item whose blocked assertion has no matching block evidence.
   Ready may pass only when every claim is reconciled truthfully.
7. `kaal lifecycle` exits 0 on `fixtures/claim-before-work.json`, reports the
   lane as valid or in flight, and names the exact claim, the substantive work
   and the durable order that puts the claim first. It exits 1 on
   `fixtures/work-before-claim.json`, naming the substantive work and the later
   exact claim whose durable commit ancestry establishes the violation. On
   `fixtures/order-not-established.json` it also exits 1, reports that
   Plan-before-Do cannot be established and does not describe the work as
   before or after the claim.

## Open questions

- Must the common cycle be copied into every portable seat skill, or is the
  repository contract the one source with each skill pointing to it?
- What is the claim's serial form inside a backlog, including the stable
  identity of each item? The ask fixes its meaning and ownership, not its
  encoding.
- How does Plan obtain and then record the pull request identifier without
  making an empty or knowingly false claim visible between those two acts?
- When an item is blocked at Act, does the claim point to the existing
  `blocks:` entry, carry the same identity, or use another observable relation?
- Which wall or workflow consumes the lifecycle decision, and which adapter
  normalizes a provider and the chosen backlog serialization into its semantic
  evidence? This requirement deliberately fixes neither.

## Handoff

- Task: a-seat-claims-its-work-before-doing-it
- Criteria: 7; tests: 7 (equal)
- Red run: `node --test --test-timeout=60000
requirements/a-seat-claims-its-work-before-doing-it/acceptance.test.mjs`, 14
  September 2026, all 7 failing; each failed on its own missing observable when
  run alone
- Tests: `requirements/a-seat-claims-its-work-before-doing-it/acceptance.test.mjs`
- Fixtures: the ten normalized semantic cases under
  `requirements/a-seat-claims-its-work-before-doing-it/fixtures/`; no fixture is
  a provider payload or proposed backlog encoding
- Stand-in green: all seven on a disposable provider-neutral lifecycle judge
  and operating contract; the stand-in was discarded
- Open questions: 5, listed above
- Blocked on: nothing
- Unblocks: `the-manager-sees-every-live-lane`, the second task counted from
  this ask
- Supersedes: `a-seat-carries-its-own-backlog`, only its assumption that a
  backlog carries blocks and never work a seat may start. The moved claim is
  narrowed: available work remains derived, while intended work is a claim.
  The permitting principle is that a written claim and repository truth are
  different states, already held by `a-task-is-delivered-by-its-run`
- People: none
