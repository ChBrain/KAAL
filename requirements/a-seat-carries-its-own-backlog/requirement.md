---
traces:
  parent: a-crossing-names-its-owner@255247aa0bdf5915273b74e250f30e29695d03f76026879573204ecc006a17a6
  supersedes: nothing
---

# Requirement: a-seat-carries-its-own-backlog

## Goal

A blocked seat writes its block in its own tree and the manager reads all six
without opening a seat's work, so two seats can be working at once and the
order across them is still somebody's to set.

## What the runs said

- A refusal now names an owner and a place, and the place does not exist.
  `kaal seats` answers `block: ask the developer, and record it in
requirement/*` on a crossing, and no page in this tree is where that goes:
  `find . -name backlog.md` outside `node_modules` finds nothing.
- There is no command to collect one. `node bin/kaal.mjs backlog` prints the
  usage line, which lists twenty six subcommands and none of them is this.
- Six seats own six trees, one glob each except one. `manager plan/**`,
  `analyst requirements/**`, `architect architecture/**`, `tester tests/**`,
  `developer bin/** SURFACE.md`, `operator deploy/**`. So a page beside what a
  seat owns has a path that is read off the declaration rather than written
  down a seventh time.
- One of those six trees ships. `package.json` carries `files: ["bin",
"skills", "agents", "!**/*.test.mjs"]`, and `the-engine-is-installable`
  criterion 2 accepts anything under `bin/`, so a developer's backlog at
  `bin/backlog.md` would reach every consumer of the package and no wall
  would say a word. The manifest already carries one exclusion of exactly
  this shape, which is why the criterion is about the manifest and not only
  about the tarball: a tarball carrying no backlog while no backlog exists
  proves nothing.
- The flat keyed block already has a parser and a precedent, and the
  precedent's key is compound. `reviews:` sits beside `traces:` in
  frontmatter with keys `<kind>/<name>` and values `<state>@<sha> by <who>:
<why>`, read by `parseFrontmatter`, which returns the block as a map.
  `bin/lib/frontmatter.mjs` says the slash in a sub key came with `reviews:`
  and was widened for it on purpose.
- A map keyed by the task alone cannot hold a task blocked by two seats. The
  parser returns one value per key, so a second entry under the same task
  replaces the first and the block is lost without a word. Measured on a
  page carrying two blocks on one task: the answer reported one. The plan's
  words are `flat and keyed by task, the shape the reviews: block already
proved`, and those two halves disagree; the precedent is the half that can
  hold what criterion 3 asks for.
- The table this rests on is in the plan and nowhere else. `plan/0.0.2.md`
  carries a row per seat saying when that seat's work exists and when it is
  blocked, under a heading saying the table is doctrine and belongs in
  `AGENTS.md`. `AGENTS.md` says a blocked seat names its block where it
  stands and never what the kinds of block are.

## Assumptions

- The page's path is derived and never declared. Every seat already declares
  what it owns, so a seventh declaration saying where its backlog lives is a
  second source of truth for a fact the first one settles.
- A block names a kind from the table and not free text. The table's rows are
  the only states one seat may be waiting on another for, so a block that
  names one can be checked against the tree, and a block that says anything
  it likes can only be cleared by a person remembering to.
- The manager's own backlog is one of the six. The manager cannot be blocked
  on its own account, by the table's last row, and a page that exists for
  five seats and not the sixth is a special case a reader has to learn.
- A backlog is not a plan. The plan says which release work belongs to and
  the backlog says what a seat has and cannot do; `tests/plans/` is a third
  thing again, which is why the word here is the asker's and not `plan`.
- What a seat can do is not in the page. The backlog carries blocks, and the
  clear set is what is left when the blocked entries are taken out, so a seat
  never writes down the work it is able to start.

## Constraints

- The command writes nothing. Collecting is reading, and a manager that
  edited a seat's page would be the reach across lanes this whole shape
  exists to remove.
- A block names the block and never the fix. `plan/0.0.2.md` fixes that the
  blocked seat says where, the manager says when and the owning seat says
  what, so no entry carries a field for a remedy.
- Nothing a consumer installs changes. A page inside a tree that ships is
  the league's working and not the tool.
- Deterministic and offline, like every wall. It reads the declaration and
  six files.

## Acceptance criteria

1. Each seat's backlog is one page inside that seat's own tree, at a path
   read off the declaration. The answer names one page per declared seat,
   each under a path that seat owns, and reads no file outside them.
2. An entry is keyed by the seat that owes what is waited on and the task,
   and names the kind of thing it waits for, and carries no remedy. The kinds
   are declared beside the seats, and an entry naming a seat or a kind the
   declaration does not hold is a finding naming the page and the key.
3. The answer is two sets: what is blocked, grouped by the seat that owes it,
   and what is clear. A task blocked by two seats is named under each.
4. A block whose need the tree already meets does not stand. The same page,
   against a tree where the thing it waits on is there, answers that it is
   clear, and nobody edits the page to make that happen.
5. The command writes nothing. After it runs and answers, every backlog page
   is byte for byte what it was.
6. `AGENTS.md` carries the table, one row per declared seat, saying when that
   seat's work exists and when it is blocked, with no column for a remedy,
   and naming every kind the declaration holds. The doctrine and the
   declaration say the same thing or one of them is wrong.
7. No backlog reaches a consumer. The manifest excludes a backlog from what
   is packed, and the packed tarball carries none.

These fix three shapes the tests read. A backlog page is a `blocks:` block in
frontmatter keyed `<seat>/<task>`, in the shape `reviews:` already proved
under the same parser, whose keys are compound for the same reason: one task
may be blocked on two seats at once and a map keyed by the task alone loses
the second. What the value holds beyond the kind is not fixed here.
The kinds are a list in `kaal.config.json` beside the seats and the lanes,
because a kind that lives only in prose is a vocabulary nothing can check,
and `a-diff-carries-one-seat` already holds that page and that file to the
same seats and the same lanes. The answer's two sets are lines a reader can
tell apart, one naming a seat it is grouped under and one not.

## Open questions

- Does a block ever name a person rather than a seat? Item 9 of the plan is
  waiting on the asker for four controls no seat can set, and by this page's
  rules that is the operator blocked on nobody. The table's `operator` row
  says `a control outside the tree`, which is a kind, so the answer here is
  that the person is the kind and not the name, and it is worth confirming.
- Should a block be refused where the seat could do the work? An analyst
  blocked on the architect is a direction the chain does not run in, and
  nothing here reads the direction. It is a wall somebody could want and it
  is not asked for.
- What happens to a block on a task nobody is working on? It stands for ever
  and reads as noise, and the self clearing rule does not reach it, because
  what it waits on is not coming.

## Handoff

- Task: a-seat-carries-its-own-backlog
- Criteria: 7; tests: 7 (equal)
- Red run: `node --test --test-timeout=60000
requirements/a-seat-carries-its-own-backlog/acceptance.test.mjs`, 13
  September 2026, all 7 failing, and each one failing on its own as well
- Tests: `requirements/a-seat-carries-its-own-backlog/acceptance.test.mjs`
- Stand-in green: all seven, on a throwaway that declared the kinds beside
  the seats, put the table in `AGENTS.md`, excluded a backlog from the
  manifest and answered the six pages from the declaration. Discarded from
  file copies
- What the stand-in found, and it is in this page rather than in the tree:
  the shape the asker named cannot hold what the asker asked for. `flat and
keyed by task` and `the shape the reviews: block already proved` are not the
  same shape, because the parser returns one value per key and `reviews:` is
  keyed `<kind>/<name>`. A page carrying two blocks on one task reported one,
  silently, which is criterion 3 failing for a reason no criterion could
  name. The key is `<seat>/<task>` and the precedent is what fixed it
- Open questions: 3, listed above
- Blocked on: nothing
- Unblocks: the asker's items 7 and 8, the manage skill and six seats writing
  their first backlog, neither of which has anywhere to write until this
  lands
- Supersedes: nothing
- People: none
