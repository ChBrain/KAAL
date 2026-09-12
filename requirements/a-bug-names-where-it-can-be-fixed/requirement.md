---
traces:
  parent: a-suite-names-its-cases@26e53d7fea7a4b49cc4bfff85796fff717741026e66dd3a58500cea0fd9b9a18
  supersedes: nothing
---

# Requirement: a-bug-names-where-it-can-be-fixed

## Goal

A red case has a written owner, and a reader of the board can see what is
broken and whose it is without opening a test file.

## What the runs said

- The tree holds four kinds and the strategy states five. `ls tests/` answers
  `fixtures plans runs strategy.md suites`. The strategy's own list names the
  strategy, the plans, the suites, the runs and the bugs, and the bugs are the
  only one of the five written without a path: the other four say `under
tests/plans/` and so on, and that paragraph says only `The bugs`.
- A red case is reported and never recorded. `kaal acceptance
tests/fixtures/a-suite-that-fails.test.mjs` answers `FAIL ... (0 passing, 1
failing)`, `not ok 1 - 1. this suite is red, which is the whole of what it is
for` and `red: 1 requirement(s), 1 failing`. The tree gains nothing from that
  run: the next run says the same thing and nobody is named by either.
- A pass is recorded and a failure is not. `tests/runs/` holds 67 pages, one
  per task, each carrying the task, the suite, the date, the suite's sha and
  its counts, and `kaal runs --write` records the suites that are green and
  records nothing else. The asymmetry is stated on the surface page: a record
  is evidence of a pass and a red suite made none.
- The way past a red wall is two things today and neither is this. `AGENTS.md`
  says fix it or file a waiver, `waivers/<wall>.md` with wall, who, why and
  until, which the board shows as `waived` and never as `ok`. The same
  paragraph says never skip, disable or quarantine a test.
- Four words judge a task and none of them is about a case. The verdicts are
  `delivered`, `not delivered`, `regressed` and `nothing ran`, and each is
  about a suite against a record. A suite of nine where one case is red and
  eight are green is `regressed` whole, and nothing anywhere says which one.
- A red case that is somebody else's is a live problem and not a hypothetical.
  Eight cases across six files stood red in CI for days because the board
  reports a red wall on `release` and the check goes green; they were found by
  a wall re-running the same files a second way, and the only reason anyone
  could act on them was that a person happened to read a log.

## Assumptions

- A bug is the tester's record and not a licence. The tester is the seat that
  proves, so the seat that writes down a failure is the same one that writes
  down a pass, and the record changes who is named rather than what is red.
- One bug is about one case. The run record is one per task and the suite
  layer already names cases by path, so the thing a bug points at is a case
  and the path is how it says which.
- A bug names a lane and not a person. The league's lanes are how work is
  owned here and a lane outlives whoever is in it, so the earliest place a
  failure can be fixed is named the way every other ownership in this tree is.
- The earliest lane is the answer, not the nearest. A case red because the
  criterion behind it is wrong is the analyst's however far down the stack the
  symptom shows, and naming the lane where the symptom appears would put the
  work on the seat least able to do it.
- Nothing about this narrows what a wall refuses. The promotion into `main`
  refuses every red wall, and a bug that let one through would contradict
  `a-promotion-names-what-it-refuses` criterion 5. What a bug moves is who is
  named and what a reader can see, never how much a wall demands.

## Constraints

- The bugs live in the tester's tree. `tests/**` is the tester's seat and the
  strategy that declares the five kinds is the tester's page, so a bug that
  needed a diff anywhere else would be the selection problem this league has
  just finished moving out of the governance lane.
- Deterministic and offline, like every wall.
- A bug never names the fix. From the ask: it names the earliest lane where
  the work can happen and stops there. A record that proposed a fix would be a
  design written by the seat that found the symptom.
- No case is written, edited or moved for this. A bug points at a case that
  exists, and a task that reached into a case file to mark it would be editing
  another seat's test.

## Acceptance criteria

1. A bug is a page under `tests/bugs/`, one per case, carrying the case by
   path, the wall that ran it, the date it was seen and the lane that owns the
   earliest place it can be fixed. A page missing any of those four is a
   finding naming the page and the field it lacks.
2. A bug naming a lane `kaal.config.json` does not hold is a finding naming
   the page and the lane, in the same shape a plan naming a wall no gate holds
   already answers.
3. A bug about a case that now passes is a finding saying so, so a bug is
   cleared by the case going green and never by anyone deciding it has.
4. A bug about a case no suite names is a finding naming the page and the
   path. A bug points at a case the tree already knows, the way a suite does.
5. A standing bug is never a licence: a board carrying one does not answer
   green, whatever every wall on it says.
6. The board names each standing bug, its case and its lane, on its own line,
   so a reader sees what is broken and whose it is without opening
   `tests/bugs/` or any test file.
7. A case a standing bug is about is not re-run by the wall that owns it, and
   the answer says which cases were not run and why, so a wall that skipped
   work says so rather than counting it as done.

## Open questions

- Does criterion 7 survive contact with `AGENTS.md`? That page says never
  skip, disable or quarantine a test, in the same paragraph as the waiver, and
  a case a wall stops running is a case a wall stopped running however it is
  described. Criterion 5 is what I think keeps the two apart, because a
  quarantine buys a green and this buys nothing: the board is red either way
  and the only thing that changed is that a name is attached and the work is
  not done twice. If the asker reads it the other way, criterion 7 is the one
  to drop and the other six stand without it.
- Is a bug the tester's to write, or the seat that owns the lane it names? The
  tester finds it and the named seat fixes it, and a record written by one and
  cleared by the other has two authors. Every other record in this tree has
  one.
- What happens to a bug whose case is deleted? A run record goes stale when
  its suite moves, which is a sha comparison; a bug about a case that no
  longer exists is neither standing nor cleared, and criterion 4 makes it a
  finding without saying which.
- Should a bug carry the failure it saw? The ask says it names where the work
  can happen and never the fix, which leaves the symptom itself unmentioned. A
  bug that quoted the assertion would be readable without a rerun and would
  also go stale the first time the message is reworded.
- Does a bug reach the promotion? A red wall already stops it, so a standing
  bug stops it too by criterion 5. Whether the refusal should name the bug and
  its lane, rather than the wall, is a question about what a person sees at the
  moment they are stopped.

## Handoff

- Task: a-bug-names-where-it-can-be-fixed
- Criteria: 7; tests: 7 (equal)
- Red run: `node --test --test-timeout=60000
requirements/a-bug-names-where-it-can-be-fixed/acceptance.test.mjs`, 12
  September 2026, all 7 failing, and each one failing on its own as well
- Tests: `acceptance.test.mjs`, beside this file, on scratch trees, because
  the league's own `tests/` is where this kind would live and a case reading it
  would be reading the answer it is asking for
- Open questions: 5, listed above
- Blocked on: nothing. The first open question is the asker's and it does not
  block this page; if it is answered the other way, criterion 7 and its test
  come out together
- Unblocks: item 5 of `plan/0.0.2.md`, the refusal that names its block, and
  item 6, the dependency table
- Supersedes: nothing. The strategy already states this kind and this task
  builds what it states, which is a claim being met rather than moved
- People: none
- Stand-in green: all seven, discarded from file copies. It found four things
  the architect will meet. Criterion 3 needs the blocked case to be run to
  know it passes, so whatever reads a bug spawns a process per bug, and
  `kaal traces` runs no test today. Criterion 7 needs the judged wall's own
  `ok` and its counts to learn about an entry that was not judged, or a
  blocked case turns the wall red for being absent. The reader of what is
  blocked was reached from the wall through `process.cwd()` because the
  judged runner is handed files and never a root. And criteria 3 and 7
  together mean the case is run exactly once, by the thing that reads the
  bug and not by the wall that owns it, which is the whole of what keeps
  this from being a quarantine
