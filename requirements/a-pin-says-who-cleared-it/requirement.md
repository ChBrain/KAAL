---
traces:
  supersedes: a-trace-pins-what-it-read@577516cded2a3421163205bcbc0983492b45926d30c6d669e1f7822e971bb3b7
---

# Requirement: a-pin-says-who-cleared-it

_Ask, from Kai, carried since the trace machinery landed and chosen over two
faster answers when the league blocked on it: pin review state, `current`,
`review-needed`, `reviewed-no-impact` and `updated`, with who and why. His
own open question was who may clear a pin._

## Goal

Whoever reads a tree wants to know which pins have been read since the text
under them moved and by whom, and whoever moves a text wants to land it
without waiting for another seat; they will know it by a moved pin becoming a
state with an owner rather than a failure, by the name and the reason of
whoever cleared it, and by the report that judges a task counting an unread
pin against it.

## What the runs said

- Nobody clears a pin. `kaal traces --write` walks every artefact and rewrites
  every pin from the file it names, whatever moved and whoever is looking. It
  is the only way to clear one, it asks nothing, and it records nothing.
- There are 422 traces to clear, across four kinds: 154 `supersedes`, 117
  `parent`, 86 `requirement` and 65 `principles`. A rule that costs a reader
  one act per pin has to be a rule the reader can afford.
- A moved pin is a failure today, and the failure is in the wrong seat's
  hands. `a-trace-pins-what-it-read` criterion 6 says every trace that can
  carry a pin carries a current one, so amending a criterion turns the board
  red until the architect re-pins, and the architect's file is one the analyst
  may not touch. Run today: amending criterion 5 of `a-diff-carries-one-seat`
  answered `a-diff-carries-one-seat: requirement: a-diff-carries-one-seat
moved: its Acceptance criteria no longer matches the pin`, two walls red, and
  the diff has not been landable since.
- That is the third instance of one shape this week. The suite count in
  `tests/plans/*.md` moves when any seat adds a suite and the tool writes it,
  which the lane guard's drawing answered by making the plans shared and
  calling it the weakest thing in the design. A proof written by the seat that
  owns it read as another seat's, which took a build to fix. And now a pin.
  Each time, one seat's legitimate act put another seat's artefact in a state
  only that other seat could fix, with the board red in between.
- Three of this league's rules cannot all hold: main is always green, one pull
  request is one lane, and one seat's act invalidates another seat's artefact.
  The board being red is the tree telling the truth; the tree having nowhere
  to put a truthful inconsistency is the defect.
- The machinery for a state that is not a failure already exists twice. A run
  record whose suite sha no longer matches counts as no record and the
  delivery report says `not delivered` with the reason, which is an answer
  rather than a red. The coverage rows report how far each seat has got and
  cannot refuse at all. Neither needed a new idea and neither needs a clock.
- Freshness is already read this way elsewhere: `bin/lib/runs.mjs` answers
  whether a record still speaks for the suite it names, and the wall reads
  that answer rather than deciding for itself.

## Assumptions

- A moved pin is a fact about a tree mid handoff and not a defect. The
  architect has genuinely not re-read the criterion that moved, and saying so
  is more useful than refusing to record it.
- Clearing a pin is an act with a name on it. The ask says who and why, and
  the reason a pin exists at all is that somebody read something; a pin
  cleared by a tool records that nobody did.
- Two ways out of a review, because they are different claims. Reading the
  moved text and finding nothing that touches this artefact is
  `reviewed-no-impact`; reading it and changing this artefact is `updated`.
  Collapsing them would lose the case a reader most wants to see later.
- A state nobody ever leaves is the vacuous pass wearing a state, so
  `review-needed` has to cost something. It costs the task: an unread pin
  belongs where the work is judged, beside the run that has not happened and
  the drawing that does not exist.
- It costs the task and not the board, because a red board stops the seat that
  cannot fix it. That is the whole reason this task exists.
- No clock. A bound in days would make a tree go red while nobody touched it,
  which is the league's own rule about a wall that fails on a schedule rather
  than on a change.
- The four states are the ask's four. `current` is the pin matching what it
  names; the other three are the life of a pin that stopped matching.

## Constraints

- The exit vocabulary holds: 0 an answer, 1 findings, 2 the question is not
  this tree's.
- A name that resolves to nothing stays a finding. This task is about a text
  that moved, never about a trace that points at nothing.
- Nothing here reaches a network or a model, and nothing writes a state on
  anyone's behalf.
- 422 pins carry no state today and none of them may become a finding on the
  day this lands: a pin with no state written is `current`.
- `a-trace-pins-what-it-read` keeps everything else it says: the grammar, the
  kind table, the two distinct findings, and that `--write` is idempotent.

## Acceptance criteria

1. A pin carries a review state, one of `current`, `review-needed`,
   `reviewed-no-impact` or `updated`, and a pin written without one reads
   `current`.
2. A pin whose region moved is `review-needed` and is not a failure: `kaal
traces` names the artefact, the kind and the name, and exits 0 where that is
   the only thing it found. A name resolving to nothing still exits 1, and a
   tree with both reports both and exits 1.
3. Leaving `review-needed` names who and why: a pin recorded
   `reviewed-no-impact` or `updated` carries a person and a reason, and one
   recorded without either is a finding naming which is missing.
4. `kaal traces --write` never clears a review. It writes a pin that has none,
   leaves a `review-needed` pin as it found it, and says how many it left.
5. A task carrying an unreviewed pin is not delivered: the report that judges
   a task reads `review-needed` the way it reads a stale run record, so an
   unread pin is counted where the work is judged and not only where the pin
   is.
6. The board says how many pins are in each state, so a reader sees what is
   owed without asking a second question.

## Open questions

- Who is a person here? The retros and the release pages name Kai; a pin
  cleared by a seat is cleared by whoever ran that seat, and this league has
  no register of people. The criteria ask for a name and not for a known one.
- Does `updated` mean this artefact changed in the same diff, or only that
  somebody says it did? Reading the diff would make the claim checkable and
  would tie a pin's state to a commit, which no other state in this tree does.
- Should `reviewed-no-impact` expire when the region moves again? A second
  move is a second question, so probably yes, and saying so is a criterion
  this task did not need.
- What clears the 422 pins that exist? They read `current` and none of them
  has been reviewed under this rule; whether that is a debt to work off or a
  line to draw is a judgement rather than a criterion.
- Does the same shape want answering for the plans count? A tool writing into
  a seat's directory is the first instance of this and the lane guard's
  drawing called it the weakest thing there. It is a different fix and it is
  the task after this one.

## Handoff

- Task: a-pin-says-who-cleared-it
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-pin-says-who-cleared-it/acceptance.test.mjs`,
  all six failing on the states not existing
- Seen red one at a time: each of the six run alone as well as together
- Stand-in green: all six, on a throwaway state parsed off a pin, a moved pin
  reported rather than found, `--write` leaving a review where it found one,
  the runs report reading it, and the four counts on the traces line, then
  discarded from file copies
- Found by the fixtures, three times, and all three mine. A sha computed in a
  test is a second opinion about what a region is: the first fixture pinned a
  criteria region by hand and got the trailing newline wrong, so `--write`
  writes every pin now and the text moves under it afterwards. A scratch tree
  with no trunk is red for a rule this task is not about, so every fixture
  carries one. And criterion 6 first read the league's own tree, whose 422
  pins are all one state and whose counts move whenever anything else lands
- Tests: `acceptance.test.mjs`, beside this file, on scratch trees carrying
  pins in each state, because the league's own 422 are all `current` and a
  test that read them would be reading one state forever
- Open questions: 5, listed above
- Blocked on: nothing
- Unblocks: `requirement/a-diff-carries-one-seat-proof-owner`, written and
  held since the pin under it moved; and every future amendment of any
  criterion any drawing has read
- Supersedes: `a-trace-pins-what-it-read`, whose sixth criterion says every
  trace that can carry a pin carries a current one. That was right while a
  pin had one state and it is what makes a tree mid handoff unlandable. The
  grammar, the kind table, the two distinct findings and the idempotent
  `--write` all stand
- People: none
