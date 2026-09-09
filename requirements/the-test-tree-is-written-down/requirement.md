---
traces:
  supersedes: nothing
---

# Requirement: the-test-tree-is-written-down

_Ask, from Kai, settling the shape of the league: "KAAL is the top root,
splitting into three trees (requirements, architecture, test) ... Test: Test
Strategy -> Test Plans -> Test Suites -> Test Cases. Given that Requirements,
Architecture and Code motivate Test I do assume those are (at least) three
distinct Test Plans, while the Test Strategy needs to capture that bit."
Followed by the rule beneath all three: "code answers tests, what's not
testable can't be coded (we never know if it's true without)." Two of the
three trees are documents already. This is the third, and the runs below say
it is entirely built and entirely unwritten._

## Goal

Anyone reading the league wants to know why it tests three ways and what each
way is for, without reading the board's configuration to find out; they will
know it by a strategy that says what motivates each plan, by one plan per
wall, and by the board reporting a wall with no plan or a plan with no wall.

## What the runs said

- The three plans already run and are named nowhere. `kaal.config.json`'s
  first three gates are `acceptance` over `requirements/*/acceptance.test.mjs`,
  `contracts` over `architecture/*/contracts.test.mjs`, and `units` over
  `tests/*.test.mjs skills/*/scripts/*.test.mjs`. That is exactly the ask's
  three: requirements motivate the first, architecture the second, code the
  third.
- The suites and cases exist in the numbers a plan would report: 57
  acceptance suites holding 266 numbered cases, 50 contract suites holding
  145, and 21 unit suites. 128 suites in all.
- Above them there is nothing. No strategy document and no plan document
  exists anywhere in the tree.
- What does exist is 50 per task `## Test strategy` sections, one inside each
  drawing, which are 50 local strategies about one task each and no statement
  about the league.
- The other two trees are documents with frontmatter: 57 requirements and 50
  drawings, each carrying a `traces` block the twelfth wall reads.
  `bin/lib/traces.mjs`'s `PLACES` holds two entries, `requirements` and
  `architecture`, so a third kind of document is a third entry.
- The rule the ask names beneath the trees is already half held and nowhere
  written. Every criterion arrives with a red test and the architect writes
  a contract test before any code exists, so a thing that cannot be tested
  is a thing no seat can take; nothing says so.

## Assumptions

- The strategy and the plans are documents, not configuration. The board
  already knows which walls exist; what nobody can read is why there are
  three and what each is for.
- One plan per wall, and the wall is what the plan names. A plan that names
  no wall is a plan about nothing, and a wall with no plan is a test kind
  nobody explained. The board holds both directions, which is the second
  both ways check in the league after the surface page's.
- The three plans are the ask's three and not a shape invented here:
  requirements motivate acceptance, architecture motivates contracts, code
  motivates units. The mapping was read off the board rather than proposed.
- The documents live under `tests/`, as `tests/strategy.md` and
  `tests/plans/<name>.md`, because that is where the test tree's other files
  already are and the unit glob reads `.mjs` rather than `.md`. It is a
  place, not a claim, and the asker may prefer another.
- They are artefacts like a requirement and a drawing, so they carry a
  `traces` block and the trace wall reads them. Without that the third tree
  is documents nothing checks, which is what the first two were before the
  trace landed.
- The parent edge is not this task's. `a-tree-has-one-root` gives every
  artefact a parent and this task gives the test tree the documents that
  edge needs; the strategy will be that tree's root when it lands.
- "What cannot be tested cannot be coded" is stated in the strategy and not
  walled. Whether a thing could have been tested is a judgement about work
  that was never done, and the league does not wall judgements.
- Suites and cases are not documents. A suite is a test file and a case is a
  numbered test inside it, both of which exist; the plans name where they
  live and count them rather than restating them.

## Constraints

- No new wall. The check belongs to `kaal traces`, which already reads
  artefacts and their frontmatter, or to the gates wall which already reads
  the config; a thirteenth wall for four documents is a wall per document.
- The three plans are the three walls that exist today. A fourth plan waits
  for a fourth wall.
- The 50 per task Test strategy sections inside drawings stay where they
  are. They answer a different question, which is how one task is tested.
- The skill rules apply: the standard's shape, MIT, under five hundred
  lines, no vendor or product named, no dash.

## Acceptance criteria

1. `tests/strategy.md` exists, names the three plans, and for each says what
   motivates it: requirements, architecture, code.
2. The strategy states that code answers tests, and that what cannot be
   tested cannot be built, because nobody would know whether it were true.
3. One plan document per wall under `tests/plans/`, each naming its wall by
   the name the board uses, where its suites live, and what a case is.
4. Every gate in `kaal.config.json` that runs tests has exactly one plan
   naming it, and every plan names a gate that exists; the board reports
   either way round, naming the wall or the plan.
5. The strategy and the plans carry a `traces` block, and `kaal traces`
   reads them as it reads a requirement and a drawing.
6. On this tree the board answers: three plans, three walls, and each plan's
   count of suites agreeing with what its glob matches.

## Open questions

- Is `tests/` the right home, or does the test tree want a directory of its
  own beside `requirements/` and `architecture/`? The first is where the
  files are; the second is what the shape says.
- Does a plan carry the count of its suites, which goes stale, or a glob,
  which does not? Criterion 6 asks the count to agree, which means a plan is
  a page the tool can check and also a page somebody must update.
- Should the per task `## Test strategy` sections trace to the plan that
  covers them? Fifty sections and three plans is the crowded document signal
  the asker described, and it may be the first place to look for it.
- Do `standard`, `runners`, `evals` and the other walls belong to a plan?
  They check the tree rather than the product, and a plan for them may be a
  fourth plan or may be no plan at all.
- Who owns the strategy? It is a document about testing that no seat writes:
  the analyst tests requirements, the architect seams, the developer units,
  and none of them owns the question of why there are three.

## Handoff

- Task: the-test-tree-is-written-down
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/the-test-tree-is-written-down/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file, with fixture roots for a
  wall with no plan and a plan naming no wall
- Green before the build: none expected
- Open questions: 5, listed above
- Status: open
- Blocked on: nothing. `a-tree-has-one-root` gives these documents a parent
  and does not gate their existence
- Unblocks: the third tree in `a-tree-has-one-root`, whose criterion 1
  cannot reach the test tree until the test tree has documents to reach
- Supersedes: nothing
- People: none
