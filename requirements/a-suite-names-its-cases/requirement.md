---
traces:
  supersedes: the-test-tree-is-written-down@ac8c1dd740ac54d37b21875f28d113278f099a6487c8d3249287ec00b393ffe1
---

# Requirement: a-suite-names-its-cases

_Ask, from Kai, arrived while the manage skill was being planned and changed
its order: `tests/` holds a test strategy, test plans, test suites, test runs
and bugs. A suite is not a file of tests, it is a document that points at
cases, and "Test Cases are not written / changed in tests/, but they are
pointed at from there in Test Suites". His reason for taking it before the
dependency table: "it forces the test cases to sit in the correct lanes"._

## Goal

Whoever owns a seat wants every test case to sit in the lane of the seat that
owns what the case proves, and whoever opens `tests/` wants to find the
method there rather than half of it; they will know it by a suite being a
document that names its cases by path, by a case under `tests/` being a
finding, and by the twenty-one case files sitting in the tester's own tree
today having nowhere valid to be named.

## What the runs said

- `tests/` holds four of the five kinds and one thing that is none of them:
  one strategy, three plans, sixty-three runs, and twenty-one `.test.mjs`
  files. There are no suite documents and no bugs.
- Those twenty-one are the developer's subject in the tester's lane. Twenty
  import `../bin/lib/` directly and the twenty-first drives `bin/kaal.mjs`.
  The units plan is what permits it: it says its suites live under
  `tests/*.test.mjs`, `bin/lib/*.test.mjs` and `skills/*/scripts/*.test.mjs`,
  and today those match 21, 3 and 1.
- `tests/strategy.md` already refuses this in prose. It says "the seat decides
  where a result goes, never the skill", and that an acceptance case sits with
  its requirement, a contract case with its drawing, a unit case with its
  code. Twenty-one of twenty-five units do not.
- The seats wall cannot catch it. Its proof table holds three entries and
  every one is shaped `<tree>/<task>/<proof>`, because the harm it was written
  for was a seat touching another seat's task. A unit belongs to a module and
  has no task, so there is no row to add.
- A plan names a glob, not suites. `tests/plans/acceptance.md` says its suites
  live under `requirements/*/acceptance.test.mjs` and that today that matches 64. Every glob belongs to exactly one plan, so no suite is reached by two
  plans and the layer that would let one be reached twice does not exist.
- What CI runs is not in `tests/`. Three of the four jobs in
  `.github/workflows/ci.yml` run `npm test`, which is `node bin/kaal.mjs
gates`, and the selection lives in `kaal.config.json` as globs inside gate
  commands: `acceptance` over `requirements/*/acceptance.test.mjs`,
  `contracts` over `architecture/*/contracts.test.mjs`, `units` over the three
  above. That file is the governance lane, so the tester cannot change what is
  re-run without a diff in somebody else's lane.
- Counting what a suite layer would have to reach: 64 acceptance files, 58
  contract files and 25 unit files, 147 in all.
- The trace wall already treats anything under `tests/` as an artefact. A
  suite page written without a frontmatter block answered `suites/alpha:
traces: no frontmatter block in tests/suites/alpha`, so a suite carries a
  `traces` block whether or not this task asks for one. And a `parent:` there
  resolves against `tests/` rather than against the file's own directory: a
  suite at `tests/suites/alpha.md` declaring `parent: acceptance` answered
  `acceptance is not at tests/acceptance.md`, so a suite can only parent to a
  page sitting directly in `tests/`.

## Assumptions

- A suite document is written by the tester, because selecting and grouping
  what is re-run is the method and the method is the tester's. The cases it
  names stay the property of the seat whose tree they sit in, which is the
  same split `tests/strategy.md` already draws between the seat and the skill.
- No test case belongs in `tests/` at all. The asker said cases are pointed at
  from there and never written there, and the tester writes no cases of its
  own, so the rule is the whole directory rather than a list of exceptions.
- A case path belongs to the seat whose tree holds it, read from the seats
  declared in `kaal.config.json`. This task adds no new notion of ownership.
- The twenty-one moving is a separate task. It is two lanes in one change and
  the guard refuses that, so it cannot be part of this diff and is named in
  the handoff instead.

## Constraints

- `tests/` holds five kinds and no sixth: strategy, plans, suites, runs, bugs.
  From the ask, and bugs are their own task.
- A case is a reference and never a copy. A suite names where a case is; it
  does not hold the case, restate it, or wrap it.
- The three walls that run tests keep running the same cases. This task moves
  who declares the selection and where a case may live, and it does not
  change what is proved or make any suite run less.
- Verification only, and for a reason that is not permanent. The strategy page
  says validation is never a wall because it cannot be settled the same way
  twice, so an eval record is not a case and no suite names one. The asker
  adds that validation could be run where the walls run if model use on
  GitHub Actions is solved or the API calls are worth spending; `evals.yml`
  already runs it on `/eval` or a dispatch. So the line this task draws is
  between what a wall may read and what it may not, and never between what is
  worth testing.

## Acceptance criteria

1. `tests/strategy.md` says `tests/` holds five kinds and names all five,
   each with a sentence saying what it is: the strategy, the plans under
   `tests/plans`, the suites under `tests/suites`, the runs under
   `tests/runs`, and the bugs. A reader who has only this page can say what
   belongs there and what does not.
2. A suite is a document under `tests/suites/`, and it names its cases, each
   as a path. `kaal` reads a suite as it reads a plan, and a suite naming no
   case is a finding saying so.
3. A case path under `tests/` is a finding naming the path and saying that
   `tests/` points at cases and does not hold them. This holds whatever else
   is true of the path.
4. A case path in no seat's tree is a finding naming the path and saying no
   seat owns it. The seats are read from `kaal.config.json` and this task
   declares no new ones.
5. A plan names the suites it uses and no longer a glob, and one suite named
   by two plans is not a finding: the layer carries the many to one that a
   plan over a selection needs.
6. Every case a suite names exists, and every test file in the trees the
   suites reach is named by some suite; the board reports either way round,
   naming the case that is not there or the file no suite reaches.
7. The board says how many suites and how many cases each plan reaches, so a
   reader sees what is covered without asking a second question.

## Open questions

- Is a suite's list of cases written by a person or by the tool? 147 cases is
  more than anyone maintains by hand, and `kaal plans --write` already writes
  a count into a plan, so the machinery for the second exists. A list a tool
  writes is a list nobody reads, which is the argument for the first.
- One suite per plan, or one suite per grouping a person would re-run? The ask
  says a plan uses 1..n suites, so more than one, and the count is what
  decides whether a suite is a document or a directory listing.
- A suite must carry a trace, because the wall already demands one, and it
  can only parent to a page directly under `tests/`. So its parent is the
  strategy today and cannot be its plan without the `parent` kind learning a
  second place. Which of those two is right is the question, and it is the
  architect's.
- Do `standard`, `runners` and the other checks that run no tests belong to a
  suite? They belong to no plan today and that was left open when the plans
  were written.
- Where does the units plan's third glob go? `skills/*/scripts/*.test.mjs`
  matches one file, and whether a skill's script is the developer's tree or
  the skill lane's is a question this task's criterion 4 will ask out loud.

## Handoff

- Task: a-suite-names-its-cases
- Criteria: 7; tests: 7 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-suite-names-its-cases/acceptance.test.mjs`,
  all seven failing, each on its own reason: the strategy never says bugs, and
  six findings that no wall produces
- Seen red one at a time: each of the seven run alone as well as together, and
  the first two attempts were a shared red rather than seven proofs. The
  fixtures had no requirement, so `kaal traces` answered "not applicable here"
  six times, and then the fixture's own strategy page carried no root line
- Stand-in green: all seven, on a throwaway suite reader in
  `bin/lib/plans.mjs`, a per plan count line on `kaal traces`, and a five
  kinds section in the strategy page, then discarded from file copies
- Found by the stand-in, once, and mine: criterion 1's test read the five
  kinds as substrings and `re-runs` matched before `suites`, so it was red for
  the wrong reason and would have stayed red however the page was written. The
  criterion now reads the three kinds that have a place by their place
- Tests: `acceptance.test.mjs`, beside this file, on scratch trees, because
  the tests directory is the thing this task changes and a case that read it
  would be reading the answer it is asking for
- Open questions: 5, listed above
- Blocked on: nothing
- Unblocks: the twenty-one moving beside the modules they import, which is
  two lanes and its own pair of diffs; `a-plan-picks-its-suites`, the
  regression plan CI runs, which needs a suite before it can pick one; and
  `a-bug-names-who-owns-the-fix`, the fifth kind
- Supersedes: `the-test-tree-is-written-down`, whose criterion 3 says a plan
  names where its suites live and whose criterion 6 asks each plan's count to
  agree with its glob. Both were right while a plan owned a place; a plan that
  picks a selection owns neither. Its criteria 1, 2, 4 and 5 stand, and its
  own open question, whether a plan carries a count that goes stale or a glob
  that does not, is answered by neither
- People: none
