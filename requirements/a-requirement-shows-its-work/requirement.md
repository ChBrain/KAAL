# Requirement: a-requirement-shows-its-work

_Written in analyse mode, from a stack. Twelve unconsumed retros on the
analyse skill, which the league's rule makes the analyst's next ask at ten.
Kai: "go, analyst run on the retro stack." The stack is read as an ask like
any other: recurring Lacked items are criteria, single ones that name a
defect are criteria of their own, Longed for items are open questions, and
Liked items are what the next version must not lose._

## Goal

Whoever reads a requirement wants to see what it rests on, so that a claim
can be checked rather than trusted and a proof cannot be green for a reason
nobody looked at; they will know when a fact established by running
something has a place on the page, when the order a task sits in is on the
page rather than in a pull request, and when the skill says how a proof is
seen red and what a fixture owes even when a test builds it.

## What the runs said

This section is the thing criterion 1 asks for, written here first because a
requirement that asks for it and does not use it is an argument against
itself.

- The stack is twelve and the analyse count is zero after archiving:
  `node bin/kaal.mjs retros` answered `analyse: 12 unconsumed` before the
  move and `analyse: 0 unconsumed` after it, with `architect: 11` unchanged
  on both sides, which is what makes the architect stack a second ask rather
  than part of this one.
- The six-fold repetition is counted from the files and not from memory:
  the phrase about a fact established by running something appears in the
  thirty-eighth, thirty-ninth, fortieth, forty-third, forty-fourth and
  forty-fifth retros, and four of them number the streak themselves.
- Two of the five tests were green for the wrong reason and a run found
  each. Criterion 1 passed against the unchanged tree because the template
  folded to one line and any heading matched; criterion 1 passed again,
  after that was fixed, with the skill's new rule deleted, because section 2
  already says "run" and "assumption" for other reasons. The test now ties
  the two documents by the heading's own words.
- Criterion 3's first form demanded a rule and its reason in one sentence,
  which is a test about punctuation. It reads the whole rule now, found by
  matching the proof's bullets and filtering rather than by a pattern that
  expected the phrase twice.

## Assumptions

- The loudest item is not close. Six of the twelve say the requirement
  template has nowhere for a fact established by running something, and
  four of those count the streak out loud: third in a row, fifth, sixth,
  seventh, ninth. It is the most repeated finding this tree has produced.
- Two single Lacked items name defects rather than wishes, so they are
  criteria and not open questions: a fixture built inside a test tripped a
  rule it was not testing and made two cases red for the wrong reason and
  a passing case impossible; and a first red run where every test failed
  for one shared cause hid whether the tests test different things, which
  three partial stand-ins later found.
- What must not be lost is the stand-in. Liked items name it in five of the
  twelve, and twice for finding something: a criterion that was green on
  nothing and wrong on a stand-in, and a drawing whose decision the
  stand-in refused. Nothing in this task weakens it.
- Two items in this stack are not the analyse skill's and are named here so
  they are not lost by being out of scope: the retro name is a race, which
  cost three overwritten files and a merge conflict and belongs to a wall
  or to `retro-4ls`; and the board runs under one runtime while
  contributors run others, which is governance. Neither is a criterion
  below.
- The architect stack stands at eleven and is a second ask that can fail
  independently of this one. This run takes the first and says so.
- Nothing here gates. Every criterion is text a reader honours, which is
  the same shape `a-decision-balances-two-goods` took and for the same
  reason: the ask is about how a seat works.

## Constraints

- The skill's rules apply to its own text: MIT, the standard's shape, no
  vendor or product named, no en-dash or em-dash, under five hundred lines.
- The stand-in discipline is untouched, and so is the rule that one
  criterion has one test and the counts are equal.
- The change is text. No command changes behaviour and nothing under `bin/`
  moves.
- The words the tests read are fixed in the criteria below, so the tests can
  be written before the sentences exist.

## Acceptance criteria

1. The requirement template carries a section for what was established by
   running something, and the analyse skill's guidance for writing the want
   tells the analyst to put a run there rather than into an assumption.
2. The skill says, where it gives the rules for the proof, that a fixture a
   test builds while it runs obeys the rules it is not testing exactly as
   one checked into the tree does, and names what it costs: a test red for
   another rule's reason, and a passing case that cannot pass.
3. The skill says the tests are seen red one at a time as well as together,
   when more than one depends on the same precondition, and names what a
   single shared red hides.
4. The handoff names what the task unblocks beside what it is blocked on,
   and the template carries that line.
5. The twelve retros this run consumed are under `retros/archive/`, none of
   the twelve is still live under `retros/`, and `kaal retros` counts the
   analyse skill's unconsumed retros as the tree holds them.

   _Corrected during the build, 7 September 2026. It read "and `kaal retros`
   counts zero unconsumed for the analyse skill", which was true the hour it
   was written and false two retros later, because the stream does not stop
   when a stack is consumed. The criterion asserted a state the tree moves,
   which is the defect `a-drawing-shows-its-ground` names in its own fourth
   criterion and which this skill's own rule "On fixed ground" already
   forbids. What the criterion is about is the twelve, and it now says so._

## Open questions

- Where does a rule that belongs to every seat live? Three retros ask it:
  one lesson has been copied into three skills by hand, and the only thing
  that stopped a fourth being missed is that one reader was in the room for
  all of them. A shared page each skill points at is the obvious answer and
  it is a task, not a line.
- What does a run over a stack owe? Two retros ask how to split one, how
  many tasks it may produce, and what to do with a stack whose items belong
  to different subjects. This run split by hand again.
- The guest items are four and they are one subject: a shape for a scouting
  output, a list of what to look for in a pointed-at tree, a third place
  the retro format has no line for, and a proof that can only be read
  because running it would move the host's tree. Are they one task?
- Should an open question be markable as one that time answers rather than
  a person, so patience is not read as neglect?
- Should a Lacked item be markable as answered elsewhere, so the next run
  over a stack does not rediscover that it was?
- Does the analyse skill's own version move with this change? Each skill
  carries one now, only the patch place is this tree's to move, and nothing
  yet compares a changed skill against its version.

## Handoff

- Task: a-requirement-shows-its-work
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-requirement-shows-its-work/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file; they read the skill's text
  and its template with whitespace folded, because the formatter wraps where
  it likes
- Retros consumed, all twelve, which move to `retros/archive/` in this
  change: `2026-09-07-analyse-thirty-fourth-use.md`,
  `-thirty-fifth-`, `-thirty-sixth-`, `-thirty-seventh-`, `-thirty-eighth-`,
  `-thirty-ninth-`, `-fortieth-`, `-forty-first-`, `-forty-second-`,
  `-forty-third-`, `-forty-fourth-`, `-forty-fifth-use.md`
- Green before the build: criterion 5, and it is not a defect. The archive
  is this change's own act, so the count is zero the moment it lands; it is
  a criterion because a run that consumes a stack and leaves it unconsumed
  has read it twice
- Open questions: 6, listed above
- Status: closed
- Blocked on: nothing
- Unblocks: nothing yet; the architect stack of eleven is the next ask and
  is independent of this one
- Supersedes: nothing
