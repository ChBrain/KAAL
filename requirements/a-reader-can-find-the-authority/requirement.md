---
traces:
  parent: none
---

# Requirement: a-reader-can-find-the-authority

_Written in analyse mode from a cold-read observation. The reader recovered
most of KAAL's machinery, but called it a repository operating system, met the
league's vocabulary before its practical job, joined current capability to
planned and speculative work, and inferred that backlogs are generated from
blocked work. The information was present. Its authority and route were not._

## Goal

A person opening KAAL for the first time wants to understand its practical job
and reach the one repository artefact that owns each answer, so they can explain
what exists, what comes next, how a change travels, and which nearby page to
trust without reading history or learning the league's vocabulary first.

## What the runs said

- `rg -n '\\[[^]]+\\]\\([^)]+\\)' README.md` found one local Markdown link:
  `README.md` points to `DESIGN.md` and to no other repository page.
- `node bin/kaal.mjs` offered 26 commands. `SURFACE.md` says it is the page that
  fixes those command promises, while `README.md` currently links only to the
  design.
- `npm pack --dry-run --json --ignore-scripts` described
  `@chbrain/kaal@0.0.1` and included `README.md`, `bin/`, `skills/`, and
  `agents/`. A reader can establish what is installable from the tree, but the
  entrance does not route them to the package declaration or the command
  promise.
- `node bin/kaal.mjs backlog` read three of six declared seat pages and said
  both `nothing is clear yet` and `nothing is blocked`. The existing backlog
  pages say they are written records of blocks; the command is the derived
  view and writes none.
- `kaal.config.json` assigns `requirements/**`, `architecture/**`, `tests/**`,
  `plan/**`, `bin/**` plus `SURFACE.md`, and `deploy/**` to the six seats. It
  permits `README.md`, `AGENTS.md`, `kaal/**`, `kaal.config.json`, and
  `waivers/**` in the governance lane, declares `retros/**` shared, and
  declares no owner or allowed lane for `DESIGN.md`.
- `tests/strategy.md` says verification is deterministic and may be a wall,
  while validation asks whether the work works for its reader and is never a
  wall. That is the existing distinction between the two proof claims in this
  ask.

## Assumptions

- A cold reader begins at `README.md`. They may follow visible local links but
  do not inspect commit history, search the whole tree, or consult an external
  source to discover the route.
- A route may pass through one or more explanatory pages. Its layout and the
  number of pages are free; its terminal authority, ownership, and information
  kind are not implied by proximity.
- "Current" means the installable package and the command promises the tree
  makes now. "Committed next" means work a current plan orders. "Projection"
  means intent or possibility that is neither of those.
- The information kinds are functional and may coexist in one page: wants say
  what must be true, decisions choose, evidence records an observation or act,
  derived views compute from other artefacts, and explanation helps a reader
  interpret an authority without replacing it.
- Where `kaal.config.json` names no seat or lane for an artefact, the reader is
  told that ownership is undeclared. This task does not silently appoint an
  owner.

## Constraints

- `README.md` remains the door, not a copy of every artefact. Explanatory text
  may summarize and link, but it does not become a second authority.
- The current roles named in the ask remain unless the tree disproves them:
  `DESIGN.md` says why, `AGENTS.md` says how work happens, `SURFACE.md` says
  what commands promise, requirements state wants, drawings state structure
  and seams, plans order work, seat backlogs record blocks, suites group cases,
  test plans select protection, runs record execution, bugs record failed
  cases and owners, releases record what shipped, waivers record exceptions,
  retros record learning, and `kaal.config.json` declares enforcement.
- The route and its acceptance proof are local, offline, deterministic, and do
  not call a model. They prove discoverability and consistency, not human
  comprehension.
- Comprehension is evaluated separately with the cold-reader fixture beside
  this requirement. Its result is advisory evidence and never a wall.
- This task is not assigned to a release. Ordering it is the manager's work.
- The architecture decides where navigation lives, how it is presented, and
  whether an existing page or a new explanatory page carries it.

## Acceptance criteria

1. Starting at `README.md` and following visible local links, a reader can
   reach an authority for what KAAL is, the problem it solves, who it is for,
   and both the package that can be installed and the command surface that can
   be used today.
2. The route answers current capability, committed next work, and longer-term
   projection as three labelled states whose authorities are respectively the
   current command promise, a current plan, and the design; none is presented
   as another's authority.
3. The route reaches `AGENTS.md` for how one ask becomes a released change and
   reaches the requirement, drawing, plan, test, code, evidence, and release
   homes needed to locate each answer along that journey.
4. A reader-reachable authority register covers every declared information
   family in this ask. Each entry names one authoritative home, the owning seat
   or the fact that none is declared, and whether the family is a want,
   decision, evidence, derived view, or explanation. Seat backlogs are records;
   `kaal backlog` is their derived view and is not described as their generator.

   The register is measured against these readings of the current tree:

   | family             | home                                 | owner       | kind         |
   | ------------------ | ------------------------------------ | ----------- | ------------ |
   | repository door    | `README.md`                          | governance  | explanation  |
   | design             | `DESIGN.md`                          | undeclared  | explanation  |
   | work contract      | `AGENTS.md`                          | governance  | explanation  |
   | command contract   | `SURFACE.md`                         | developer   | decision     |
   | package manifest   | `package.json`                       | governance  | decision     |
   | requirements       | `requirements/<task>/requirement.md` | analyst     | want         |
   | drawings           | `architecture/<task>/drawing.md`     | architect   | decision     |
   | release plans      | `plan/<release>.md`                  | manager     | decision     |
   | seat backlogs      | `<seat-tree>/backlog.md`             | owning seat | evidence     |
   | test strategy      | `tests/strategy.md`                  | tester      | explanation  |
   | test plans         | `tests/plans/<wall>.md`              | tester      | decision     |
   | test suites        | `tests/suites/<suite>.md`            | tester      | decision     |
   | run records        | `tests/runs/<task>.md`               | tester      | evidence     |
   | bugs               | `tests/bugs/<bug>.md`                | tester      | evidence     |
   | release records    | `deploy/releases/<version>.md`       | operator    | evidence     |
   | waivers            | `waivers/<wall>.md`                  | governance  | decision     |
   | retros             | `retros/<use>.md`                    | shared      | evidence     |
   | engine declaration | `kaal.config.json`                   | governance  | decision     |
   | command reports    | the commands in `SURFACE.md`         | developer   | derived view |

5. Every authority route required by criteria 1 through 4 is a visible local
   Markdown link whose target exists. No required answer depends on an external
   source or repository history, and no subject in the register names two
   authoritative homes.

## Open questions

- `DESIGN.md` has the declared role "says why" but no owner or allowed lane in
  `kaal.config.json`. Is "ownership undeclared" the intended answer, or is a
  governance change a separate ask?
- Is `kaal/league.md` the authority for KAAL's practical job, with `DESIGN.md`
  explaining why, or is it the root of the three work trees only? The route
  must choose one authority per fact; this requirement does not choose for the
  architect.
- Which current plan is the route to "committed next" after 0.0.2 ships? The
  criterion requires a current plan rather than fixing one filename forever.
- Who performs the advisory cold read, and what number of independent readers
  is enough evidence to close the comprehension claim?

## Advisory cold-read evidence

`fixtures/cold-reader/evaluation.md` asks the ten reader questions against a
clean checkout and names the misunderstandings the observed read exposed. It
does not prescribe wording and no acceptance case scores its answer. A future
evaluation record can say whether a person understood the explanation; the
five executable criteria say only whether the promised routes exist and are
unambiguous.

## Handoff

- Task: a-reader-can-find-the-authority
- Status: open
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-reader-can-find-the-authority/acceptance.test.mjs`, 13 September 2026; all five tests failed on the absent reader route, each also run alone and failing for its own criterion
- Tests: `acceptance.test.mjs`, beside this file
- Advisory fixture: `fixtures/cold-reader/evaluation.md`
- Green before the build: none expected
- Open questions: 4, listed above
- Blocked on: nothing
- Unblocks: nothing named; the manager decides whether and when this enters a
  release
- Supersedes: nothing
- People: none
- Root because: reader-facing information authority crosses the requirements,
  architecture, and test trees; no existing requirement owns that concern
