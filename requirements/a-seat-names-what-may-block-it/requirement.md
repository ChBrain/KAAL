---
traces:
  supersedes: nothing
---

# Requirement: a-seat-names-what-may-block-it

_Ask, from Kai: "KAAL must define and enforce the allowed dependency flow
between seats: Analyst to Architect, Analyst to Tester, Architect to Tester,
Tester to Coder, Tester to Operator, Coder to Tester, Coder to Operator,
Operator to Tester. A to B means A produces something B may depend on, so B
may be blocked by A and by no seat without such an incoming edge. The edge
carries dependency, not authority to order B. The static seat topology may
contain feedback cycles, but a concrete live block graph must not contain a
simultaneous cycle."_

## Goal

Whoever adds a seat, or argues about who is waiting on whom, wants the set of
seats that may block a given seat to be written down once and refused when it
is contradicted; they will know it by the board answering, per seat, which
seats may block it, and by a board that goes red when the declaration and the
doctrine page disagree.

This is the first of two tasks the ask contains. The second,
`a-block-follows-a-declared-edge`, judges a live block against this
declaration and refuses a simultaneous cycle among live blocks. It cannot be
stated yet: nothing in this tree records a block, and the manager's plan
orders that record behind two items that are not built. This task states the
flow; it does not enforce it against anything live.

## What the runs said

- Nothing declares a flow. `node -e` over `kaal.config.json` answers `flow`
  absent, and the seats it does declare, in this order, are `manager`,
  `analyst`, `architect`, `tester`, `developer`, `operator`. There is no
  seventh and there is no `Coder`.
- Nothing reads one. `node bin/kaal.mjs flow` prints the usage line and exits
  1, so the command does not exist. `grep -rniE "blocked|dependsOn|blockedBy"
bin/ --include=*.mjs` finds one hit and it is a comment in a unit test.
  `grep -c blocked AGENTS.md` answers 0, and `grep -c '^|' AGENTS.md` answers
  0: the contract page carries no table at all.
- Nothing records a live block. `ls tests/bugs` and `ls plan/seats` both
  answer no such directory, and the fourteen gate names in
  `kaal.config.json` carry no `flow`. So there is no block graph in this tree
  to be cyclic or acyclic, and the half of the ask about a live graph has
  nothing to read.
- The manager's plan already carries the table, in prose, and says where it
  belongs. `plan/0.0.2.md` lines 93 to 100 are a six row table of "work
  exists when" and "blocked when", and its own sentence above it reads "The
  table is doctrine and belongs in `AGENTS.md`". Its item 6, "The dependency
  table and the seats' own plans", names items 4 (`tests/bugs/`) and 5 (the
  refusal naming its block) as what it needs, and neither exists.
- The plan's table and the ask disagree on one row, and it is the developer's.
  The plan says the developer is blocked when "the red test needs a seam that
  does not exist", which is a block the architect owns; the ask gives the
  coder one incoming edge and it is the tester's. Read against the ask, the
  architect reaches the developer only through a red test, and there is no
  `Architect to Coder` edge to carry it directly. This page declares the eight
  edges the ask names and asks the question rather than adding a ninth.
- The other five rows agree with the ask. The plan says the analyst is blocked
  only when "only a person can answer", and a person is not a seat, so the
  analyst has no incoming edge; the architect only when "the criterion cannot
  be drawn as written", which is the analyst's; the tester when "a verify or
  validate fails for a reason outside `tests/`", which is every other working
  seat; the operator on "a control outside the tree", which is not a seat; and
  the manager "never on its own account", which is no incoming edge at all.
- The board is fourteen walls and thirteen were green when this was written.
  The fourteenth, `seats`, answered
  `claude/kaal-dependency-flow-c3og5e: matches no lane (plan/*, requirement/*,
architecture/*, build/*, test/*, operate/*, governance/*, skill/*, agent/*,
eval/*)`, which is the branch this session started on and not this diff;
  renamed to the lane, the board is fourteen green. Coverage reads analyst 65
  of 65, architect 59 of 65, tester 64 of 65.
- The precedent for a declaration plus a page that must agree with it is
  `a-diff-carries-one-seat`, whose criterion 1 fixes the shape of `seats`,
  `lanes` and `shared` in `kaal.config.json` and whose criterion 7 makes
  `AGENTS.md` disagreeing with that config a finding. Its acceptance test 7
  reads the league's own page and its own config directly rather than a
  fixture, which is what fixed ground means for a declaration that is not
  supposed to move.

## Assumptions

- `Coder` is this tree's `developer`. The ask names five seats and this tree
  declares six; `developer` is the only seat whose work is code, and the
  plan's table uses `developer` for the row the ask calls Coder.
- The manager is deliberately outside the flow. The ask names no edge touching
  it, and the plan agrees on the incoming half ("never on its own account").
  The outgoing half follows from the manager writing none of the seats'
  artefacts: it orders work, and an order is not a thing a seat depends on.
  So the manager's entry is present and empty, and this is an assumption Kai
  could deny by naming an edge.
- A seat's answer is written even when it is empty. "B may be blocked by A and
  by no seat without such an incoming edge" makes the empty set an answer
  rather than a silence, so a seat with no incoming edge carries an entry with
  an empty list and is not simply missing from the table.
- The surface is a `kaal` command and a wall on the board, because every other
  piece of doctrine in this league that a machine can read is one, and a
  declaration nothing reads is the ceremony the manager's plan warns about in
  its item 7.

## Constraints

- The eight edges are the ask's and not this task's to widen or narrow. A
  ninth edge is Kai's to add, and no diff may add one to let a block through.
- The declaration must allow cycles. `Tester to Coder` with `Coder to Tester`,
  and `Tester to Operator` with `Operator to Tester`, are both in the ask, so
  a wall that refused a cycle in the topology would refuse the ask itself.
- An edge carries dependency and never authority. The ask says so, and the
  manager's plan says the same thing from the other end: "A seat names the
  block and never the fix", and "neither a block nor the manager's pick-up
  carries a field for a remedy".
- The table is doctrine and belongs in `AGENTS.md`, per the manager's plan.
  `AGENTS.md` and `kaal.config.json` are the governance lane, so this task
  states what must be true of them and no analyst diff writes them.
- This task adds no new record and no new tree. `tests/bugs/` and
  `plan/seats/` are the manager's items 4 and 6 and stay theirs.

## Acceptance criteria

1. `kaal.config.json` declares `flow` once: a list whose entries are keyed by
   the seat that may be blocked and valued by the seats that may block it,
   `{ "seat": <name>, "blockedBy": [<name>, ...] }`, where an empty
   `blockedBy` is the answer that no seat may block that one. This tree's
   `flow` carries exactly the eight edges the ask names and no ninth:
   `architect` blocked by `analyst`; `tester` blocked by `analyst`,
   `architect`, `developer`, `operator`; `developer` blocked by `tester`;
   `operator` blocked by `tester`, `developer`; `analyst` and `manager`
   blocked by nothing.
2. `kaal flow` is a finding when the declaration does not answer for every
   seat, or answers for something that is not one. A seat in `seats` with no
   entry is `<seat>: no flow entry; a seat blocked by nothing carries an empty
blockedBy`. A seat with two entries is `<seat>: two flow entries; a seat
answers once`. A name that `seats` does not declare, whether it is an
   entry's `seat` or sits in a `blockedBy`, is `<name>: no such seat`. Any of
   them exits 1.
3. On a tree whose declaration is whole, `kaal flow` prints one line per seat
   on stdout, in the order `seats` declares them, reading
   `<seat>: blocked by <the seats that may block it, comma and space
separated, in that same order>`, or `<seat>: blocked by nothing` where the
   list is empty; it writes nothing to stderr and exits 0. Where the config
   carries no `flow` at all it writes one line on stderr,
   `flow: not applicable here: kaal.config.json declares no flow`, writes
   nothing to stdout, and exits 2.
4. A cycle among the declared edges is not a finding. On a tree whose `flow`
   has `tester` blocked by `developer` and `developer` blocked by `tester`,
   the command prints both of those seats' lines and exits 0, and no line it
   writes anywhere names a cycle: the static topology feeds back on purpose,
   and only a live block graph may not.
5. A `flow` entry carries `seat` and `blockedBy` and nothing else. Any other
   key is a finding, `<seat>: flow entry carries <key>; an edge carries
dependency and never an instruction`, and exits 1, because the edge says
   that B may wait on A and never what A may tell B to do.
6. `AGENTS.md` carries the same flow as a table, one row per seat, the seat in
   the first cell and in the second either the seats that may block it, comma
   and space separated, or `nothing`. Where the page and the config disagree
   about a seat, `kaal flow` is a finding naming the seat and both readings,
   `<seat>: AGENTS.md says blocked by <page>; kaal.config.json says <config>`,
   and a seat the page has no row for reads `<seat>: no row in AGENTS.md`.
7. The board runs it: `kaal.config.json` carries a gate named `flow` whose
   command is `node bin/kaal.mjs flow`, so `npm test` shows one line for it,
   and its `fix` line tells the reader to correct the declaration or the page
   and never to add an edge to let a block through.

## Open questions

- Is there a ninth edge, `Architect to Coder`? The plan's table says the
  developer is blocked when the red test needs a seam that does not exist,
  which is the architect's to draw. Under the eight edges the architect
  reaches the developer only through a red test, and the first time an
  architect blocks a developer the wall in `a-block-follows-a-declared-edge`
  will refuse it. Either the edge is missing from the ask or the plan's
  developer row is, and one of the two moves.
- Does the manager appear in the flow at all, or only in the table with two
  empty answers? This page assumes present and empty on both sides. If the
  manager is outside the graph entirely, `flow` names five seats and criterion
  2's "every seat has an entry" needs a clause for the one that does not.
- Is `flow` its own command, or a second section of `kaal seats`? The
  criteria here are written against `kaal flow` because the applicability
  answer differs: a tree may declare seats and no flow, and `kaal seats`
  already answers about a branch and a diff rather than about a declaration.
  Folding it in is one line of the architect's, not a criterion.
- Where does a live block get recorded, and does that answer belong to the
  manager's item 4, item 5, or item 6? `a-block-follows-a-declared-edge`
  cannot be stated until it is settled, and none of the three is built.
- Is a seat blocked by itself a finding? The ask does not name a self edge and
  this page does not add one, so today it would pass criterion 1's shape and
  be caught only as a one seat cycle in a live graph, which is the second
  task's.
- Thirty eight unconsumed `analyse` retros stand in `retros/`, which is nearly
  four times the ten that the contract makes the analyst's next ask. That is a
  standing backlog item this task did not take, and it is named here so that
  taking this ask first is a choice on the record rather than an oversight.

## Handoff

- Task: a-seat-names-what-may-block-it
- Criteria: 7; tests: 7 (equal), checked with
  `node skills/analyse/scripts/count.mjs 7 7`
- Red run: `node --test --test-timeout=60000 requirements/a-seat-names-what-may-block-it/acceptance.test.mjs`,
  0 passing, 7 failing. The acceptance wall reads it as
  `ok not delivered a-seat-names-what-may-block-it (0 passing, 7 failing)`,
  which is an answer and not a failure
- Seen red one at a time: each of the seven run alone as well as together, 0
  passing and 1 failing every time. It is not seven reasons. Tests 1 and 6 are
  red because `kaal.config.json` declares no `flow`, test 7 because no gate is
  named `flow`, and tests 2, 3, 4 and 5 share one red: `kaal flow` prints the
  usage line, so four proofs are being held up by one missing command. That
  shared red is the honest one here, four behaviours of a command that does
  not exist, and it is why the stand-in mattered more than usual
- Stand-in green: all seven. A throwaway `flow` command in `bin/kaal.mjs`, a
  throwaway `flow` list and `flow` gate in `kaal.config.json`, and a throwaway
  table under a new heading in `AGENTS.md`; all three discarded with
  `git checkout --` afterwards, and the red run above is the tree after that.
  It went green first time, so it found no test red for the wrong reason, and
  four mutations of the stand-in were run to check that no test was green for
  a coincidence: printing the seats in reverse order reds test 3, deleting the
  developer row from the page reds test 6, deleting the gate's `fix` line reds
  test 7, and adding a ninth edge (developer blocked by architect) reds test
  1. Four mutations, four reds
- Tests: `acceptance.test.mjs`, beside this file. Criteria 2 to 5 run the
  command on scratch trees; criteria 1, 6 and 7 read this league's own
  `kaal.config.json` and `AGENTS.md`, because a declaration that is not
  supposed to move is the one place the league's own tree is fixed ground
- Also in this diff: one line in `tests/suites/acceptance.md` naming this
  case, which `tests/suites/*.md` being a shared path lets this lane carry.
  Without it `kaal traces` answers
  `suites: suite: requirements/a-seat-names-what-may-block-it/acceptance.test.mjs: no suite names it`,
  and three closed acceptance suites go red on that one finding. With the line
  in, the board is fourteen green
- Open questions: 6, listed above
- Blocked on: nothing. Two of the open questions are Kai's and neither stops
  the chain: the ninth edge is a line in the declaration if the answer is yes,
  and the manager's presence is a clause in one criterion
- Unblocks: `a-block-follows-a-declared-edge`, which judges a live block
  against this declaration and refuses a simultaneous cycle among live blocks,
  and which is itself blocked until something in this tree records a block
- Supersedes: nothing. The manager's plan carries the table in prose and says
  it belongs in `AGENTS.md`; a plan is not a requirement and there is no
  closed claim to move. The plan's developer row and this page's edge set
  disagree, and that is the first open question rather than a supersede
- People: none
