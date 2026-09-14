---
traces:
  parent: a-seat-carries-its-own-backlog@b48dbab9fdfb47681cf42214bdcd4fb3f898da477c9c7a673dca301717d6dbdc
  supersedes: nothing
---

# Requirement: a-block-follows-a-declared-edge

_Ask, from Kai: "KAAL must define and enforce the allowed dependency flow
between seats: Analyst to Architect, Analyst to Tester, Architect to Tester,
Tester to Coder, Tester to Operator, Coder to Tester, Coder to Operator,
Operator to Tester. A to B means A produces something B may depend on, so B
may be blocked by A and by no seat without such an incoming edge. The edge
carries dependency, not authority to order B. The static seat topology may
contain feedback cycles, but a concrete live block graph must not contain a
simultaneous cycle."_

## Goal

A seat that writes a block naming a seat it may not be blocked by is refused
by the board rather than believed, and a reader of `AGENTS.md` can see which
seats may block which; they will know it by `kaal backlog` answering with a
finding on an edge nobody declared and staying silent on one that is
declared.

The asker has since answered the three questions this page put, and the
answers are constraints below rather than assumptions: there is no ninth
edge, architecture reaches the developer through the tester; every declared
edge must be writable as a live block; and the analyst has no incoming seat
edge because a person is not a seat.

This is the first of two tasks the ask contains. The second,
`a-live-block-graph-has-no-cycle`, is the last sentence of the ask: the
declared topology may feed back and the standing blocks may not, so a set of
blocks that closes a ring is a deadlock and a finding. It can fail on its own
(every edge legal and the graph still closed) and it is a different question,
one about the whole graph rather than one entry.

## What the runs said

- The live block graph exists and nothing constrains its edges. Six backlog
  pages stand, one per seat, and `kaal backlog` answers `read 6 of 6 declared
pages`, `nothing is clear yet`, `nothing is blocked`, exit 0. An entry is
  keyed `<seat>/<task>` under `blocks:`, where the key's seat is the one that
  owes what is waited on, so an entry on the analyst's page owed by the
  architect is exactly the edge `architect to analyst`.
- That edge is forbidden twice by the ask and the tree takes it. Writing
  `operator/some-task: no record` into `requirements/backlog.md` and running
  `kaal backlog` answers `blocked on the operator:` and
  `some-task: no record, from requirements/backlog.md`, exit 0. The analyst
  has no incoming edge in the ask at all, and there is no operator to analyst
  edge either, and no wall says a word.
- The only check on the key today is existence. `a-seat-carries-its-own-
backlog`'s criterion 2 says "an entry naming a seat or a kind the declaration
  does not hold is a finding", so a seat that does not exist is caught and a
  seat that exists but may not block is not. There is no `flow` key in
  `kaal.config.json`: it declares `seats`, `lanes`, `shared`, `gates` and
  `blocks`, and nothing else.
- `AGENTS.md` already carries the Manager model as doctrine, under "What a
  seat needs from a seat": six rows of "work exists when" and "blocked when",
  the sentence that the manager "cannot be blocked by a seat, only by proxy",
  and the four kinds. What it does not carry, in any column or sentence, is
  which seats may block which.
- One doctrine row looked like a disagreement and is not. `AGENTS.md` says
  the developer is blocked when "the red test needs a seam nobody drew",
  which reads as a block the architect owns; the ask gives the coder one
  incoming edge and it is the tester's. Put to the asker, the answer is that
  there is no ninth edge: architecture reaches the developer transitively,
  `architect to tester to developer`. The row describes why the developer's
  work stalls and never who owes the block, and the edge the developer writes
  is the tester's. The other five rows agree: the analyst is blocked only when "only a person can answer",
  and a person is not a seat; the architect only by the analyst's criterion;
  the tester by a reason outside `tests/`, which is every other working seat;
  the operator by "a control outside the tree", which is not a seat; and the
  manager "never on its own account".
- Three of the eight edges cannot be written down at all today, so enforcing
  them would be enforcing nothing. The four declared kinds resolve to four
  paths in `bin/lib/backlog.mjs`'s `WHERE` table, and each path sits in one
  seat's tree: `no requirement` and `no proof` under `requirements/`, which
  is the analyst's; `no drawing` under `architecture/`, the architect's; `no
record` under `tests/`, the tester's. So the owing seat of any block that can
  be written is the analyst, the architect or the tester. The ask's edges out
  of the coder (to tester, to operator) and out of the operator (to tester)
  have no kind that names them. Five of the eight are live, three are not.
- Nothing runs `kaal backlog`. The board declares fifteen walls,
  `acceptance, contracts, units, regression, rules, drawings, traces, ledger,
runners, boundary, reads, class, format, coverage, seats`, and `backlog` is
  not among them. So the finding this task asks for has no wall to be
  reported on until one is declared.
- A standing block does not redden the command. With one block written on a
  page, `kaal backlog` still exits 0 and reports it under
  `blocked on the <seat>:`. So this command can become a wall without a
  legitimate block turning the board red, which is what makes the enforcement
  possible here rather than in a new command.
- This page was first written against `main` and is wrong there. `main` is
  what a consumer installs and `release` is where the work happens, and
  `release` was twenty one merges ahead when this was written, carrying the
  backlog pages, `kaal backlog`, the kinds and the doctrine table. A reading
  of `main` says nothing records a block, which was true three days ago and
  is not true now.

## Assumptions

- `Coder` is this tree's `developer`. The ask names five seats, this tree
  declares six, and `developer` is the only one whose work is code.
- The manager is deliberately outside the flow. The ask names no edge
  touching it, and `AGENTS.md` agrees on the incoming half: "never on its own
  account", and blocked "only by proxy, carrying somebody else's block". The
  outgoing half follows from the manager writing none of the seats'
  artefacts. So the manager carries an entry with an empty list, and Kai can
  deny this by naming an edge. The analyst's empty list is no longer an
  assumption: the asker has settled it, and it is a constraint below.
- A seat's answer is written even when it is empty. "B may be blocked by A
  and by no seat without such an incoming edge" makes the empty set an
  answer, so a seat no seat may block carries an empty list and is not simply
  absent from the declaration.
- The surface is `kaal backlog` rather than a new command. It already reads
  the declaration and all six pages, it already has a findings channel, and
  the thing being judged is an entry on a page it already parses. A second
  command reading the same six pages would be two answers to one question.

## Constraints

- The eight edges are the ask's and not this task's to widen or narrow, and
  the asker has confirmed there is no ninth. `Architect to Coder` is not an
  edge: architecture reaches the developer transitively, through
  `architect to tester` and `tester to developer`. Transitive reach is not an
  edge, so nothing here adds one, and the lane guard's rule holds: never
  widen a declaration to let a block through.
- Every declared edge must be writable as a live block. The asker's words are
  that declaring an edge the block vocabulary cannot express is vacuous
  enforcement. So this is a capability the declaration owes, and it is stated
  as one: what must be true is that each edge's source seat can own a block.
  Which kinds make that true is the builder's, not this page's, and this page
  names none.
- The analyst has no incoming seat edge, and that is the answer rather than a
  question. A person is not a seat, so a human question sits outside the seat
  topology entirely; the analyst waits on people and never on a seat, and its
  backlog page carrying no entry is correct rather than suspicious.
- The declaration must allow cycles. `Tester to Coder` with `Coder to
Tester`, and `Tester to Operator` with `Operator to Tester`, are both in the
  ask, so a wall that refused a cycle in the topology would refuse the ask
  itself. What may not close a ring is the live graph, and that is the second
  task.
- An edge carries dependency and never authority, which `AGENTS.md` already
  says from the other end: "A block names one kind and never a fix", and the
  blocked seat, the owning seat and the manager each decide one thing and
  none of the three decides for another.
- A block still clears by itself. `a-seat-carries-its-own-backlog`'s
  criterion 4 holds: a block whose need the tree meets does not stand, and
  nobody edits a page to make that happen. This task adds a refusal and
  changes no clearing.
- `AGENTS.md` and `kaal.config.json` are the governance lane and this diff
  writes neither. It states what must be true of them.
- This task adds no new record, no new tree and no new page. The backlog
  pages, the kinds and `kaal backlog` are `a-seat-carries-its-own-backlog`'s
  and stay its.

## Acceptance criteria

1. `kaal.config.json` declares `flow` beside `seats`, `lanes` and `blocks`:
   one entry per seat, `{ "seat": <name>, "blockedBy": [<name>, ...] }`,
   keyed by the seat that may be blocked and valued by the seats that may
   block it, where an empty `blockedBy` is the answer that no seat may block
   that one. This tree's `flow` carries exactly the eight edges the ask names
   and no ninth: `architect` blocked by `analyst`; `tester` blocked by
   `analyst`, `architect`, `developer`, `operator`; `developer` blocked by
   `tester`; `operator` blocked by `tester`, `developer`; `analyst` and
   `manager` blocked by nothing.
2. `kaal backlog` is a finding when the declaration does not answer for every
   seat, or answers for something that is not one. A seat in `seats` with no
   entry is `<seat>: no flow entry; a seat blocked by nothing carries an
empty blockedBy`. A seat with two entries is `<seat>: two flow entries; a
seat answers once`. A name that `seats` does not declare, whether it is an
   entry's `seat` or sits in a `blockedBy`, is `<name>: no such seat`. Any of
   them exits 1. A tree carrying no `flow` at all is every seat missing and
   not a silence: the first finding stands once per seat, because a check
   that skips when its declaration is absent is the vacuous pass wearing a
   config, which is the reading `a-diff-carries-one-seat` already fixed for
   the lane guard.
3. A block along an edge nobody declared is a finding, for every such pair
   and not for a sampled one. A `blocks:` entry on the page of seat B, keyed
   `<A>/<task>`, where `flow` gives B no incoming edge from A, is
   `<page>: <A>/<task>: the <B> is not blocked by the <A>; no such edge is
declared`, and `kaal backlog` exits 1. With six seats there are thirty six
   ordered pairs and eight are declared, so all twenty eight others are
   findings: the twenty two that are the wrong way round or unrelated, and
   the six where a seat names itself. A seat blocking itself is not a cycle
   question and not a special case; it is an edge nobody declared.
4. A block along a declared edge is not a finding, for every one of the eight
   and not for a sampled one. For each edge `A to B`, a tree whose page for B
   carries `<A>/<task>` with a kind the declaration holds answers with that
   block under `blocked on the <A>:` and writes no finding naming its task.
   And in one run that also carries a block on an undeclared edge, the
   undeclared one is criterion 3's finding, the declared one is not, and the
   command exits 1 for the first alone: the wall tells the two apart rather
   than refusing every block, and the finding it does raise is the witness
   that it was reading the flow when it let the other through.
5. A cycle among the declared edges is not a finding. On a tree whose `flow`
   has `tester` blocked by `developer` and `developer` blocked by `tester`,
   and which carries one block on an edge nobody declared, `kaal backlog`
   raises that one finding, and nothing it writes anywhere names a cycle. The
   static topology feeds back on purpose, and the finding it does raise is
   the witness that it read the declaration rather than ignoring it. Only a
   live block graph may not close a ring, and that is the second task.
6. A `flow` entry carries `seat` and `blockedBy` and nothing else. Any other
   key is a finding, `<seat>: flow entry carries <key>; an edge carries
dependency and never an instruction`, and exits 1, because the edge says that
   B may wait on A and never what A may tell B to do.
7. `AGENTS.md` says the same flow. The table under "What a seat needs from a
   seat" carries a `blocked by` column, one row per declared seat, holding
   either the seats that may block it, comma and space separated, or
   `nothing`; and the page says in prose that the declared edges may feed
   back while the standing blocks may not. Where the page and the config
   disagree about a seat, `kaal backlog` is a finding naming the seat and
   both readings, `<seat>: AGENTS.md says blocked by <page>;
kaal.config.json says <config>`.
8. The board runs it, and the board is what says so. `kaal.config.json`
   carries a gate named `backlog` whose command is `node bin/kaal.mjs
backlog`, and running the board itself answers both ways: on a tree whose
   only block is along a declared edge the board's line is `ok   backlog` and
   the run exits 0, and on a tree carrying a block along an edge nobody
   declared the line is `FAIL backlog` with its fix and the run exits 1. The
   `fix` line says to drop the block or correct the declaration and never to
   add an edge to let a block through. A declaration that a gate exists is
   not enforcement; a red board is.
9. Every declared edge can be written down as a block, or the declaration is
   a finding. `kaal backlog` prints one line per declared kind naming the
   seat that owes it, `kind <kind>: owed by the <seat>`, read from where the
   kind resolves and who owns that tree. An edge whose source seat owes no
   kind is `<A> to <B>: no kind is owed by the <A>; the edge cannot be
written as a block`, and exits 1, because an edge that cannot be written is
   an edge the wall can never judge. This tree's own eight edges raise no
   such finding: the vocabulary covers every source the flow names. Which
   kinds make that true is the builder's and this criterion names none, and
   it is not a claim that a kind's owing seat and an entry's key must agree,
   which is the open question below.

## Open questions

- Should the kind and the owing seat be held to each other? Criterion 9 makes
  the mapping visible, and nothing yet refuses `operator/x: no record`, whose
  kind resolves into the tester's tree while the key names the operator. That
  is a second gap this task found and did not take, because it is about the
  kind and not about the edge, and closing it would change what a page may
  say rather than which edges exist.
- Does the representability finding belong on `kaal backlog` or on whatever
  declares the kinds? It is put here because this is where the flow and the
  kinds are read together, and a reader who sees the edge refused sees why in
  the same answer. A vocabulary wall of its own would say it earlier and to
  nobody in particular.

## Handoff

- Task: a-block-follows-a-declared-edge
- Criteria: 9; tests: 9 (equal)
- Red run: `node --test --test-timeout=120000 requirements/a-block-follows-a-declared-edge/acceptance.test.mjs`,
  0 passing, 9 failing, and 1 failing for each of the nine run alone. The
  acceptance wall reads the task as
  `ok not delivered a-block-follows-a-declared-edge (0 passing, 9 failing)`,
  which is an answer and not a failure
- The asker answered the three open questions and the page changed with them.
  There is no ninth edge, so `architect to developer` is transitive reach
  through the tester and not an edge, and the doctrine row that looked like a
  disagreement describes why the developer stalls rather than who owes the
  block. Every declared edge must be writable as a live block, which is now
  criterion 9 and is stated as a capability: it names no kind, and the three
  edges out of the coder and the operator are what it is for. The analyst has
  no incoming seat edge because a person is not a seat, so its page carrying
  nothing is correct rather than suspicious. Two open questions remain and
  neither was answered by that round
- Three criteria were strengthened on the asker's instruction, and the point
  of each is that a sampled proof is not a proof. Criterion 3 now exercises
  every ordered pair the flow does not declare: six seats make thirty six
  pairs, eight are declared, and all twenty eight others are asserted, the
  wrong way round and the unrelated and the six where a seat names itself.
  Criterion 4 exercises all eight declared edges rather than one. Criterion 8
  runs the board itself on two trees rather than reading the config: a gate
  named in a file is a declaration and a red board is enforcement
- Stand-in green: all nine. A throwaway flow reader inside `read()` in
  `bin/lib/backlog.mjs` with two more rows in its `WHERE` table so the
  vocabulary reaches the developer and the operator, the mapping line in
  `bin/kaal.mjs`, a throwaway `flow`, two more `blocks` and a `backlog` gate
  in `kaal.config.json`, and a throwaway fourth column in the `AGENTS.md`
  table. All discarded with `git checkout --`, and the red run above is the
  tree after that. The two kind names it invented are the stand-in's and
  appear nowhere in this page: which kinds satisfy criterion 9 is the
  builder's choice
- Seven mutations of the stand-in, and every one was caught by the test meant
  to catch it. Refusing only the one sampled pair (`analyst` blocked by
  `architect`) reds criteria 3 and 5, which is the hard coding the asker
  named. Letting a seat block itself reds 3. Dropping the representability
  check reds 9, and so does leaving the kind mapping unprinted. Removing the
  `backlog` gate reds 8. Refusing every block reds 4 and 8, the second
  because the board goes red on a tree whose only block is legal. Dropping
  one declared edge from the config reds 1 and 7
- A fixture that declared its own vocabulary was wrong, and the stand-in
  found it. The fixtures listed the four kinds by name, so every tree they
  built declared eight edges over a vocabulary too small for three of them
  and answered with criterion 9's finding while testing something else. A
  fixture obeys the rules it is not testing, so they now read `blocks` from
  this tree's own declaration; that also keeps this file from naming a kind
- Open questions: 2, listed above
- Blocked on: nothing
- Unblocks: `a-live-block-graph-has-no-cycle`, the last sentence of the ask,
  which needs the declaration this task states before it can ask whether the
  standing blocks close a ring
- Supersedes: nothing
- People: none
