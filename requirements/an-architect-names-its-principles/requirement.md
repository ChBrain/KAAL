---
traces:
  supersedes: a-decision-balances-two-goods@1dbf075ca9966dafd1254f9b145b8ecc90cc0ec6bb7a6d3f02d9e495e24efea2
---

# Requirement: an-architect-names-its-principles

_Ask, from Kai: architecture principles, tested with DRY, and "how do we
manage and run it?" The discussion settled three things. Principles are the
architect's instrument, because architecture principles are created by
architects to govern decisions by architects. They are found rather than
declared: the architect's own retro carries a lens for them, and "the seat
owns the lens of both 4L and Test, that's the whole point". And DRY stays
out of this task until that lens nominates it._

## Goal

An architect deciding between options wants the tensions the league has
already weighed to have names, so that a decision is read against something
older than the task and a reader can see which pull it took; they will know
it by a principle being a file the architect keeps, by a decision record
naming what it was weighed against, by the board refusing a name that
resolves to nothing, and by the architect's retro asking which tensions this
drawing weighed without a name.

## What the runs said

- `skills/architect/references/` holds one file, `drawing.md`. There is no
  place for a principle today.
- The league already has one principle and it is a pair in tension, not a
  rule: the two goods, eleven lines inside the Decisions bullet of the
  architect skill, placed there by the closed task
  `a-decision-balances-two-goods`.
- The decision record's shape is `Chosen`, `Not taken`, `Because`, `Bought`,
  `Reopens if`. `Bought` already names which of the two goods a choice took,
  so the record already cites a principle, by prose, once, for the only
  principle there is.
- The same unweighed tension appears in the Decisions of at least six merged
  drawings, never named: `a-drawing-fixes-more-than-structure` ("the
  duplication the thirtieth architect retro named; it is not fixed"),
  `a-green-contract-is-declared` ("known duplication"), `what-proves-a-build`
  ("duplication"), `status-v2` ("not duplicated"), `asks-when-not-told`
  ("two tests that read the same file are one test written twice"),
  `nothing-passes-vacuously` ("that list grew from one place to two four
  hours ago"), and `the-board-counts-the-reads`, whose decision is titled
  "The argument rule is written again, not hoisted" and whose price reads
  "the same rule is now written twice in `applies.mjs` and once in
  `bin/kaal.mjs`". That is the tension DRY names, weighed seven times by
  hand, and it is the evidence that a principle is found rather than
  declared.
- Forty-five architect retros exist and thirty-three mention a decision, all
  of them about the record's shape rather than the tension weighed: "the
  decision record only had to say what the choice spent", "the decision
  shape". No retro asks which tension a drawing weighed.
- `retro-4ls` already reads "decisions made" among what self-diagnosis
  takes as context, so the lens is a question over input the skill already
  has rather than new input.
- The `test` skill describes itself as "the one skill every seat loads and
  no seat owns", where a seat takes "a want at your own layer (a criterion,
  a seam, a unit, a release)". The shape this task generalises is already
  half built there.
- `bin/lib/drawings.mjs` reads a drawing as text and holds five rules:
  `sections`, `edges`, `tests`, `strategy`, `orphan`. A sixth that resolves
  a cited name against a directory is the same kind of reading.

## Assumptions

- A principle is the architect's, in the architect's references, beside the
  drawing template. Not a top-level artefact and not shared text across
  skills: a principle reaches the developer through the drawing, because the
  architect weighs it, the record prices it and Fixed and free carries the
  consequence. The developer builds to the drawing and never reads the
  principle.
- A principle is a pair in tension and never one side. The one the league
  has is a pair, and the pulls are what make it usable: a principle written
  as one side is a stick, and DRY written as "say it once" is the stick
  most often swung. Each file states both pulls, what each buys and costs,
  and how to tell which side a case is on.
- The wall reads the citation and never the application. Whether a decision
  honoured a principle is meaning, and meaning is not a wall. That a
  decision names a principle which exists is text, and text is.
- `Weighed against: none` is an ordinary answer. If every decision cites
  three principles the citations are noise and the wall is theatre.
- The lens belongs to the architect skill and not to `retro-4ls`, because
  the seat owns the lens. `retro-4ls` has no retros of its own and is the
  least evidenced skill in the league; the architect skill has forty-five.
- The lens records in prose, in the retro's Lacked, and gains no line of its
  own. Nobody has yet written down what a weighed tension looks like, and
  fixing a format before five exist is the abstraction the second principle
  in this task warns about.
- The two goods moves rather than being copied. Two homes for one principle
  is the defect this task exists to prevent, met on its first day.
- DRY is not written here. The evidence for it is in What the runs said and
  it is strong; writing it now would be declaring a principle rather than
  finding one, which is the thing this shape refuses. The lens will nominate
  it or it will not.

## Constraints

- The skill rules apply: the standard's shape, MIT, under five hundred
  lines, no vendor or product named, no dash.
- The drawing template's six sections keep their names and their order, and
  the decision record's five lines keep theirs. The new line joins them.
- `a-decision-balances-two-goods` is closed and its claim moves; the
  supersede is declared in this requirement's handoff and beside its
  criterion.
- Nothing under `bin/` changes except the drawings wall's reading.

## Acceptance criteria

1. `skills/architect/references/principles/` holds one file per principle,
   and the architect skill says what a file contains: the two pulls, what
   each buys and what it costs, and how to tell which side a case is on.
2. The drawing template's decision record carries a `Weighed against:` line,
   whose value is `none` or the principles the choice was read against.
3. The drawings wall gains a rule that a principle named in a decision
   resolves to a file under the architect skill's principles, and reports a
   finding naming the drawing and the name when it does not. It reads the
   citation only.
4. The architect skill's closing instruction carries the lens: the retro on
   a use names which tensions the drawing weighed and whether any of them
   had no name, and says a tension weighed without a name more than once is
   a principle waiting to be written.
5. `the-two-goods` is a principle file with both pulls, and the architect
   skill's Decisions bullet cites it rather than restating it, so the
   principle has one home.
6. `the-seat-owns-the-lens` is a principle file with both pulls: a
   cross-cutting skill owns the method so every seat works the same way,
   and the seat owns what the method is pointed at because only the seat
   knows what its own work is made of.

## Open questions

- How many namings make a principle? The lens says more than once; the
  league's other number is ten. Nobody has evidence for either.
- Does a principle carry a retro of its own, so a principle that never
  changes a decision can be retired? Today nothing would notice.
- Should `Bought:` and `Weighed against:` be one line? `Bought` already
  names a good, which is one principle's side, and two lines about the same
  weighing may be one line written twice.
- Does a principle bind a consumer's architect, or only this league's? The
  file lives in a skill a consumer installs, so it arrives whether or not
  they asked for it.
- What happens to a principle nobody cites for a year, and who decides?

## Handoff

- Task: an-architect-names-its-principles
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/an-architect-names-its-principles/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file, with a fixture drawing
  that cites a principle which does not exist
- Green before the build: none expected
- Open questions: 5, listed above
- Blocked on: nothing
- Unblocks: nothing
- Supersedes: `a-decision-balances-two-goods`. The claim that moves is where
  the two goods lives, from the architect skill's Decisions bullet to a
  principle file the bullet cites. The principle's words do not change and
  neither does the obligation to price the trade. The principle that permits
  it is the one this task writes as its second file: the seat owns the lens,
  and a principle with two homes is the tension it exists to name
- People: none

## Build handoff

- Task: an-architect-names-its-principles
- Runs: unit 107, contract 137, acceptance 241, all green, run just now
- Scope: two principle files under the architect's references, a sixth line
  on the decision record, a citation where the skill used to restate, the
  lens at the close of a use, and a sixth rule in the drawings wall that
  resolves a cited principle before the orphan return
- Class: tool moved, skills moved (`kaal class . --against origin/main`)
- Unproven: nothing. Every criterion is text or a wall and both run here
- Superseded: one the analyst did not name. `a-decision-balances-two-goods`
  was named for where the two goods lives, and its contract also fixed the
  decision record as exactly five labels in order. Criterion 2 adds a sixth,
  so that contract moved too, from five labels to six. Found by running the
  closed tests the change touches, and recorded on that task's own page
  beside the move the analyst did name
- Handed back: nothing

## What the build met that the drawing did not say

- The skills wall's `depth` rule forbids a markdown link whose target has
  more than two path segments, so the skill cannot link into
  `references/principles/` at all. The drawing fixed where a principle
  lives and never asked whether the skill could point at it. The build names
  the path in prose instead. It is worth knowing that the rule counts a
  trailing slash as a segment, so the directory reads as deeper than it is,
  and that no link to a principle file itself could ever pass.
- Changing `skills/architect/SKILL.md` invalidated three runner pages, which
  carry the skill's sha. Regenerated with `kaal runner architect <fixture>
--write`, never by hand, which is the sweep the code skill names.
