---
traces:
  supersedes: the-engine-is-installable@b13b54f1bb81f410bb870315d32de8eae315b6f8b64dbe050fee8ab9d771e202, the-engine-installs-by-name@7f42be034c0b78b7ebce3c72260082bbb12c3c7040a116a2359a5b22c55d62f7, the-tag-installs-offline@b5f31020fa42f845097460a3158e9a430e4c59196ef44d92b23433f23ff98c31
---

# Requirement: an-install-carries-the-method

_Ask, from Kai: "given a project of mine wants to use kaal, as is, embedded,
what does it need? not just kaal, also skills and agents. that's the primary
package kaal. sub packages make sense when pieces start to travel
independently. then we carve them out of kaal but add a dependency to the
subpackage, so a kaal consumer still gets them but has the option to only use
a subpackage."_

## Goal

Whoever installs this package into a project of their own wants the league,
not half of it; they will know it by the skills and the agent arriving with
the tool, by every command that refuses an empty tree answering when it is
pointed at what was installed, and by one documented step that puts a skill
where their runtime discovers it.

## What the runs said

- The package ships the tool and nothing else. `npm pack --dry-run` lists 33
  files across `bin`, `README.md`, `LICENSE` and `package.json`, because
  `files` is `["bin"]`. The tree holds six `skills/<name>/SKILL.md` and one
  `agents/<name>/AGENT.md` and none of them is in the tarball.
- So the tool refuses most of itself in a consumer's tree. Run from an empty
  project, five of the fourteen commands answer that the question is not this
  tree's, each naming what it looked for: `check` wants `<name>/SKILL.md`
  under `<proj>/skills`, `ledger` wants `skills/<name>/moves.json`, `agents`
  wants an `agents/` directory, `retros` wants `skills/<name>/`, and `runner`
  wants `skills/<name>/fixtures/`. Every one of those refusals is correct and
  every one of them is the package's fault.
- Being pointed elsewhere is already how these commands work. Every guarded
  command takes a root, and `check` takes a directory outright: `kaal check
skills` answers on this tree today. So a command aimed at an installed
  package is not a new mechanism, it is the mechanism that exists.
- The page already tells a consumer to copy. `README.md` says "Copy a skill
  directory into the place your runtime discovers skills from, or load it by
  path where your runtime allows it", and then "A wiring script that keeps
  consumers' copies equal to the league's is a later job; until then, the copy
  is by hand and so is the drift". The instruction is written and it points at
  something the package does not deliver.
- A skill needs nothing from the tool. The same page says "Everything the
  skill needs is inside the directory; nothing in KAAL is required at the
  consumer's side", which is why the skills will one day be their own package:
  they already travel alone by design. They cannot travel at all today.
- Two unit suites now ship by accident. `bin/lib/applies.test.mjs` and
  `bin/lib/seats.test.mjs` are in the tarball, because `files: ["bin"]`
  carries everything under `bin/` and the seat rule moved the first units
  there. Twenty more suites are queued to make the same move.
- The sibling repository composes rather than copies: `khai-skills` builds
  `src/` into `dist/<skill>/` with a manifest, and ships `bin/`, `lib/`,
  `src/` and `standards/`. This league's skills are already plain directories
  that pass the standard's own validator, so there is nothing to compose.

## Assumptions

- `kaal` is the primary package and carries everything an embedded consumer
  needs. The ask settles this: a sub-package is carved out only when a piece
  demonstrably travels on its own, and when it is, `kaal` depends on it, so a
  consumer of `kaal` still gets all of it. A sub-package is an option to take
  less and never an obligation to assemble more.
- What ships is the method and the tool, and nothing of the league's own
  working. A consumer wants the skills, the agent and the walls; they do not
  want this league's requirements, drawings, test plans, retros, release
  pages or eval records, and shipping them would make every consumer's tree
  carry another repository's history.
- A test never ships. It is nobody's method and it is the developer's proof,
  and it is in the tarball today only because a seat rule moved two files.
- Placing the method is the consumer's act and never the tool's. Nothing here
  writes into a tree that did not ask, which is the guest rule this league
  already holds its own assessor to. So there is a step, and a person or a
  script they run takes it.
- The step brings all of it by default. This page's own goal is that a
  consumer wants the league and not half of it, and its first assumption is
  that a sub-package is an option to take less and never an obligation to
  assemble more. A step that placed one member at a time would be that
  obligation with a command in front of it, so the default is everything and
  naming less is the narrowing.
- Where a skill lands is the consumer's runtime's business and not this
  package's. The standard this league pins says what a skill is; it does not
  say where a given runtime discovers one. So the step names a destination
  the consumer gives it rather than one this package chose.
- A finding against a consumer's copy is not a defect in the package. The
  ledger reads eval records to say whether a rung is evidenced, and those
  records are this league's proof that its own skills work; they are not the
  method and they do not ship. So `kaal ledger` against an installed package
  reports unevidenced rungs, correctly, and criterion 3 asks for an answer
  rather than for green.
- Drift is not this task. Once a consumer holds a copy, what tells them the
  league's has moved is the other half of the wiring script the page names,
  and it is a task of its own.

## Constraints

- The exit vocabulary holds: 0 an answer, 1 findings, 2 the question is not
  this tree's.
- Nothing here reaches a network or a model. The package is read from what
  `npm pack` produces, offline.
- The package name does not change. `@chbrain/kaal` is the tool's name and
  the release lineage that `deploy/releases/0.0.1.md` records, and the later
  carve-outs take the `kaal-` suffix instead.
- The skill rules hold for what ships: what lands in a consumer's tree obeys
  the standard's shape, MIT, no vendor or product named, no dash.
- Nothing this task does may write into a consumer's tree unbidden.

## Acceptance criteria

1. What the package ships carries the method: every `skills/<name>/SKILL.md`
   and every `agents/<name>/AGENT.md` this tree holds is in what `npm pack`
   produces, with the files each of them names beside it.
2. What the package ships carries nothing of the league's own working:
   nothing under `requirements/`, `architecture/`, `tests/`, `retros/`,
   `deploy/` or `evals/`, and no file whose name ends `.test.mjs`.
3. Every command that refuses an empty tree today answers when it is pointed
   at what was installed: `check`, `ledger`, `agents`, `retros` and `runner`
   each exit 0 or 1 against the unpacked package and never 2. Findings are an
   answer: a consumer's copy carries the method and not this league's
   evidence, so a wall that reads for evidence and reports its absence has
   answered the question it was asked.
4. A consumer places the method in one documented step: the page names it,
   and following it in an empty project puts every skill the package ships
   where the consumer said, each byte for byte the same as the package's. A
   consumer who wants less names what they want; a consumer who says nothing
   gets the league, because being made to fetch it a member at a time is the
   assembly this package exists not to ask for.
5. The step writes nowhere the consumer did not name, and nothing writes
   without it: an empty project that installs the package and runs every
   command is unchanged except for what a package manager put in place.
6. What ships obeys the skill rules where it lands: `kaal check` over the
   unpacked package's skills exits 0.

## Open questions

- Is the step a command of this tool or an instruction on a page? A command
  is checkable and is one more thing the tool does; an instruction is free
  and drifts. The criteria hold either.
- Where does an agent go in a consumer's tree? A skill has a place its
  runtime discovers; an agent definition has no such convention here, and
  criterion 4 names only a skill for that reason.
- Does the tool need to know it was installed rather than cloned? Every
  command takes a root today, so a consumer can point at
  `node_modules/@chbrain/kaal`, and whether that is good enough or whether
  the tool should find its own package is a question the drawing can hold.
- What tells a consumer their copy has gone stale? The page calls the wiring
  script's other half a later job and it still is.
- When do the skills carry their own package? They already need nothing from
  the tool, so they are the first carve-out whenever they start travelling.
  This task is what makes travelling possible at all.

## Handoff

- Task: an-install-carries-the-method
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/an-install-carries-the-method/acceptance.test.mjs`,
  all six failing, each on its own missing thing: one and six on the skills
  not shipping, two on the tests that do, three and five on the commands
  refusing what was installed, four on the page naming no step
- Seen red one at a time: each of the six run alone as well as together
- Stand-in green: all six, on a widened `files`, a throwaway `install`
  command and one sentence in the page, then discarded from file copies
- Found by the stand-in, twice, and both are mine. A skill carries a unit of
  its own under `scripts/`, so excluding tests from the package is tree wide
  and not a rule about `bin/`. And criterion 3 first asked these commands for
  exit 0, which the ledger cannot give against a copy that carries no eval
  records; the exit vocabulary says 0 and 1 are both answers and only 2 is a
  refusal, and the criterion says that now
- Tests: `acceptance.test.mjs`, beside this file, reading what `npm pack`
  produces, unpacked into a scratch directory, offline
- Open questions: 5, listed above
- Blocked on: nothing
- Unblocks: the 0.0.2 release, which without this cuts a tag on a package
  that cannot do its job; and the `kaal-` carve-outs after it, which need
  something to carve out of
- Supersedes: one clause each in `the-engine-is-installable`, `the-engine-installs-by-name` and `the-tag-installs-offline`, the clause in each that lists `skills/` among the directories the package must not carry
  All three were written when the skills were part of the league's own
  working, and this task settles that they are the method a consumer installs
  this for. So `skills/` leaves all three lists and every other name in them
  stays: no requirements, no architecture, no retros, no evals, no tests, and
  now no `plan/` or `deploy/` either. What those three tasks were protecting
  is untouched, which is that a consumer's tree does not gain another
  repository's history. The third was found by running the whole board
  against the whole chain before pushing any of it, rather than by reading:
  two were visible from the manifest change alone and the third needed a git
  install in a scratch tree, which only the board does
- People: none
