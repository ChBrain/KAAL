---
traces:
  supersedes: a-tree-has-one-root@323bc075203c247758a23d6e9fb6a8ec99b2516c57d3a7a805ed4c6d10fd4b65
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
- Open questions: 5, listed above; the fourth and the fifth are answered.
  The other walls belong to no fourth plan, because everything goes through
  the chain from requirements to operations and each of them is therefore
  already held by all three; the strategy is the tester's, which is the seat
  the trunk names as owning the method
- Status: closed
- Blocked on: nothing
- Unblocks: the third tree in `a-tree-has-one-root`, whose criterion 1 could
  not reach the test tree until the test tree had documents to reach
- Supersedes: `a-tree-has-one-root`. Two of its acceptance tests were
  stricter than the criteria they prove, and neither had ever been
  exercised, because until this task no artefact in the league declared a
  parent at all. Its first test read a parent's raw value against the
  directory names of a tree, so the first pinned parent read as a name that
  is in no tree; the pin is stripped now, and every kind may carry one. Its
  sixth counted every artefact in the league declaring `none` and expected
  exactly one, which is that criterion's first sentence; its second sentence
  says a further root is allowed and argues, which is what `checkShape` has
  always done and what criterion 2 makes the board report. It now asks for
  one trunk under `kaal/` and an argument on every other root, which is the
  whole criterion rather than half of it
- People: none

## Build

- Built: all six criteria, on
  `requirement/the-test-tree-is-written-down-build`
- Landed: `tests/strategy.md` and three plans under `tests/plans/`;
  `bin/lib/plans.mjs`, new; `tests` as a place in `bin/lib/traces.mjs`, with
  the parent row taught the loose page shape and `entries` taught to list a
  place through its subdirectories; the third call in `bin/kaal.mjs`;
  `tests/plans.test.mjs`; `SURFACE.md`
- Proved: `node bin/kaal.mjs gates` green on twelve walls. Six criteria,
  five seams, nine unit tests
- Fixed on the way, and it is why nothing worked: `writePins` never passed
  the declaring artefact to `regionSha`, so every `parent` pin was taken
  from `requirements/<name>/requirement.md` whatever tree declared it. A
  name that resolved there was pinned to the wrong file and read back as
  moved for ever; a name that did not was silently left bare. No artefact
  had a parent until now, so nothing had ever asked
- The drawing was wrong twice and the build put it back both times. It had
  the pages flat under `tests/` where criterion 3 says `tests/plans/`, and
  it invented a `<glob>@<n>` pin grammar where criterion 6's own test reads
  a backticked glob and a number before the word suites. The drawing had
  read the requirement's Assumptions and Open questions and not its
  acceptance tests, which is where a criterion's meaning is actually
  pinned. Its decision records now say so rather than reading as though the
  layout had always been that
- And the analyst's own fixtures settled two more: a wall is named `Wall:`
  in a sentence and not only as a field, and a plan that states no number
  states no count and is not a finding. I had overwritten three of those
  fixtures with my own grammar before reading them, and restored them
- Found by a unit test: both directions of criterion 4 printed under one
  kind, and a plan is usually named for its wall, so `acceptance` the page
  and `acceptance` the wall printed the same prefix meaning different
  things. The wall side has its own kind now
- Fixtures brought up to date: the three acceptance fixtures predate the
  trunk rule and the `tests` place, so each gained a `kaal/league.md` and
  each page gained the traces block a page of a place owes. A fixture made
  wrong by a rule it never met catches up; it is not corrected
- Carried in the diff and not chosen: `kaal traces --write` pins every
  artefact it can resolve, so it pinned two drawings of other tasks that
  had none. Reverting them leaves a tree where running the tree's own tool
  produces a diff, so they stay
- Added after the first green, from the asker: the strategy said three plans
  and said nothing about the other half of testing. The tester keeps
  verification and validation apart, verification has one right answer and
  can therefore be a wall, validation has a reader and therefore cannot, and
  both are testing. The league already does both and only one of them was
  written down: twelve deterministic walls, and eval records under `evals/`
  where a skill's move stands only with fresh passing records from two
  distinct models. What the ledger wall checks there is the record and never
  the judgement, which is the distinction made mechanical. And the tester
  argues: it owns the method, every seat owns what the method is pointed at,
  and owning the method carries standing to refuse a criterion, a seam or a
  behaviour nobody could fail
- Corrected, and it was mine: this task's drawing recorded a disagreement
  between the test skill and the trunk, and there is none. The skill is the
  discipline of the proof and every seat loads it and none owns it; the
  tester is a seat and what a seat owns is the method. Two nouns, not one.
  The skill already draws the line this whole task needed, that its output
  lands in the lane of whoever loaded it, so the seat decides where a result
  goes and never the skill. The drawing says so now and the strategy carries
  the distinction
- The trace wall caught the edit. Changing the strategy moved the file its
  three plans pin, and all three reported it before anything else did
- Class: surface moved, tool moved (`kaal class . --against origin/main`,
  run last, after the final edit)
