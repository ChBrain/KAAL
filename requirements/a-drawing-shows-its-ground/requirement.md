# Requirement: a-drawing-shows-its-ground

_Written in analyse mode, from a stack. Eleven unconsumed retros on the
architect skill, over the league's rule of ten, read the same way the
analyse stack was read an hour ago: recurring Lacked items are criteria,
a single one that names a defect is a criterion of its own, Longed for items
are open questions, and Liked items are what the next version must not
lose. Kai: "run it."_

## Goal

Whoever reads a drawing wants to see the ground it stands on and the ground
it does not, so that a decision can be checked rather than trusted and an
empty layer reads as a choice rather than an omission; they will know when a
fact established by running something has a place on the page, when a seam
or a layer with nothing below it says so in the table's own shape, when a
far side nobody has built yet is drawn as the guess it is, and when a
contract may not carry a number the tree will move.

## What the runs said

- The counts are read from the files: eleven unconsumed architect retros,
  `node bin/kaal.mjs retros` answering `architect: 11 unconsumed` before the
  archive below and `architect: 0 unconsumed` after it.
- The dominant item is counted, not remembered: the drawing template's
  missing place for a fact established by running something appears in the
  thirty-seventh, thirty-eighth, fortieth and forty-first retros as a
  Lacked, and in the thirty-sixth as a Longed for, and three of them number
  the streak: fourth in a row, sixth, eighth, tenth.
- The thirty-sixth says the analyst hit the same gap on the same task an
  hour earlier and draws the conclusion this requirement acts on: twice in
  one chain makes it the template rather than the seat. The analyse stack's
  own run reached the same verdict independently, which is why the two
  templates gain the same section rather than two different ones.

## Assumptions

- The two stacks agree and that agreement is evidence. `a-requirement-shows-its-work`
  adds the section to the requirement template on the strength of six
  retros; this adds it to the drawing template on the strength of five. The
  wording should match so a reader of either page meets one convention, so
  criterion 1 fixes the words `What the runs said` here rather than pointing
  at the other template. Pointing would make this task wait on that one's
  build for a heading that does not exist yet, and two criteria naming the
  same three words agree without an ordering between them.
- The count rule names a defect and is therefore a criterion on one retro
  rather than an open question. A contract asserting a carried count turned
  main red on its own schedule this week, which is the thirty-first retro's
  subject and the reason the fix was to compute the count from the tree.
- Three subjects are one shape: a seam that serves no criterion, a layer
  with nothing in it, and a far side nobody has built. Each is a drawing
  saying "there is nothing here", and today each was written as a paragraph
  under the table or a sentence in the handoff, where a reader meets it
  last or not at all.
- The stand-in is what must not be lost. The fortieth retro's drawing was
  refused by its own stand-in and changed because of it, and the
  thirty-seventh's price line changed two records the day it arrived.
  Nothing here weakens either.
- Nothing here gates. Every criterion is text a reader honours, the same
  shape `a-decision-balances-two-goods` took, because the ask is about how
  a seat works and a wall is a bigger step than the ask.

## Constraints

- The skill's rules apply to its own text: MIT, the standard's shape, no
  vendor or product named, no en-dash or em-dash, under five hundred lines.
- The template's six sections keep their names and their order, which
  `bin/lib/drawings.mjs` reads and `a-drawing-fixes-more-than-structure`
  fixed.
- The change is text. No command changes behaviour and nothing under `bin/`
  moves.
- The words the tests read are fixed in the criteria below.

## Acceptance criteria

1. The drawing template carries a section headed `What the runs said`, for
   what was established by running something, and the skill's guidance for
   drawing the want tells the architect to put a run there rather than into
   a decision's reasoning.
2. The skill says a seam that serves no criterion, and a layer with nothing
   below it, are written in the test strategy table with the reason, rather
   than in prose beneath it.
3. The skill says a seam whose far side is not built yet is drawn as a
   guess and names the task that will answer it, and that a decision which
   opens a gap names the task that closes it.
4. The skill says a contract may assert a count only when it computes that
   count from the same tree it asserts about, and names what that prevents:
   a test that goes red on the league's own schedule rather than on a
   change.
5. The eleven retros this run consumed are under `retros/archive/`, none of
   the eleven is still live under `retros/`, and `kaal retros` counts the
   architect skill's unconsumed retros as the tree holds them.

   _Corrected during the build, 7 September 2026, for the reason
   `a-requirement-shows-its-work` was corrected an hour earlier: a count of
   zero is true the hour a stack is consumed and false the next time anyone
   uses the skill. Asserting a state the tree moves is the defect this
   task's own fourth criterion forbids a contract to commit, so a criterion
   committing it could not stand. It now names the eleven._

## Open questions

- Where a wall bites and where it is quiet is two promises and the template
  has one word for both. Two retros reach it from different sides, and this
  evening's release found the third: a wall silent in CI and loud at push
  time was drawn as one thing and was not.
- A drawing whose product is a document a machine will parse has no
  guidance, and neither does a command that spawns another program. Both
  were decided from precedent this week.
- How far may a constraint stretch? One drawing refused four kinds of wrong
  version where the ask asked for one, tracing to a constraint rather than
  a criterion, and the skill does not say where that stops.
- A run that produces three drawings at once leaves the architect deciding
  alone what may be shared and what must be repeated. Two retros ask for
  the same answer: one promise, one wording, one test, referenced by every
  drawing that holds it.
- Given a file about to be edited, which closed tests read it? Three seats
  have now asked for this and twice this week the answer was found only by
  running.
- Does the architect skill's own version move with this change? The same
  question the analyse task left open, and the answer should be one answer.

## Handoff

- Task: a-drawing-shows-its-ground
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-drawing-shows-its-ground/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file; they read the skill's text
  and its drawing template with whitespace folded, because the formatter
  wraps where it likes
- Retros consumed, all eleven, which move to `retros/archive/` in this
  change: `2026-09-07-architect-thirty-first-use.md` through
  `-thirty-ninth-`, `-fortieth-` and `-forty-first-use.md`
- Green before the build: criterion 5, and it is not a defect. The archive
  is this change's own act, so the count is zero the moment it lands
- Open questions: 6, listed above
- Status: closed
- Blocked on: nothing
- Unblocks: nothing
- Supersedes: nothing
- People: none
