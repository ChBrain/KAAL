# Requirement: an-artefact-traces-what-it-came-from

_Ask, from Kai, in three steps. First the problem: the dependencies between
requirements, architecture, tests and code go stale, "so no file is standing
alone without its storyline". Then the mechanism: "we go for frontmatter
now". Then the shape, which is what this requirement is for: "an architecture
artifact traces back to requirements and principles (maybe other things).
that tracing is frontmatter structure. General concept of tracing needed.
that's also checkable." So the task is the general one, and a link kind is an
entry in it rather than a task of its own._

## Goal

Anyone reading an artefact wants to know what it was made from without
reading the whole tree to find out, so that nothing stands alone and a name
that no longer resolves is found by the board rather than by a person; they
will know it by every requirement and every drawing declaring its trace in
frontmatter, by one table saying where each kind of thing lives, and by
`kaal traces` reporting a name that resolves to nothing and a kind the table
does not know.

## What the runs said

- `bin/lib/frontmatter.mjs` reads a key with no value followed by indented
  `sub: value` lines, which is how the standard's `metadata` works. Run on a
  block holding `traces:` with `requirement`, `principles` and `supersedes`
  beneath it, it returns
  `{"traces":{"requirement":"...","principles":"the-two-goods, the-seat-owns-the-lens","supersedes":"..."}}`.
  The map this task needs already parses, with no change to a module that
  has five callers.
- No requirement and no drawing carries frontmatter: 0 of 54 and 0 of 48.
  All six skills do, and so do eval records, waivers, agent bindings and
  personas.
- Forty-four requirements carry a `- Supersedes:` line. Thirty-two say
  `nothing`. Twelve name something, and none of the twelve is a name a
  script can read: every one is a sentence, eight wrap onto a second line,
  and one names a pull request rather than a task. Verbatim:
  `` `security-v1`, in part, and the supersede is declared in that ``, and
  `two, both in `security-v1`and`operate`. `security-v1`'s`.
- Forty-two requirements carry `- Blocked on:` and only ten carry
  `- Unblocks:`. The two are the same fact from either end, written twice
  and unevenly, which is why one of them is nearly always missing.
- What the board holds about those lines is that they exist and where they
  sit: `requirements/analyse-v2/acceptance.test.mjs` asserts the template's
  Handoff carries them, and `architecture/analyse-v2/contracts.test.mjs`
  asserts `at("Supersedes:") > at("Blocked on:")`. Presence and order, never
  the value.
- Two lines do have their values read: `- People:` by
  `bin/lib/acceptance.mjs` and `Feeds:` and `Read:` by
  `bin/lib/retros.mjs`. Both read a body line, and `readPeople` matches
  `/^- People: (.+)$/m` over the whole page.
- Not every trace is unwalled. `bin/lib/drawings.mjs`'s `orphan` rule
  already resolves a drawing to `requirements/<task>/requirement.md`, by the
  directory's name rather than by anything the drawing declares.
- `bin/lib/acceptance.mjs` states the league's rule for a body line in its
  own words: "the wall reads that it answered, never what it said: presence
  is a wall, meaning is not." The merged drawing
  `architecture/an-architect-names-its-principles` states the counterpart
  for a reference: "That a decision names a principle which exists is text,
  and text is."
- `GUARDED` in `bin/lib/applies.mjs` holds ten commands and `RULES` in each
  wall holds a rule list. A table from a name to what the league does with
  it is the shape this tree already uses.

## Assumptions

- A trace is backward looking: what this artefact was made from. A
  requirement traces what it supersedes; a drawing traces its requirement
  and the principles its decisions weighed. `Unblocks:` is forward looking
  and does not belong in a trace; on the evidence above it is `Blocked on:`
  read from the other end and should be computed rather than written, which
  is a task of its own and not this one.
- A kind is a name in one table and the table says where that kind lives.
  Adding a kind is adding a row, which is what makes the concept general
  rather than one rule per link.
- The trace names and never explains. The qualifying prose twelve
  requirements carry today ("in part", "on the field list", "the claim that
  moves is where the two goods lives") is what a human needs and a script
  cannot use, and it stays in the Handoff.
- So the body line stays and cites what the frontmatter declares, the way
  the architect skill's Decisions bullet now cites `the-two-goods` rather
  than restating it. The name in both places is a citation and not a second
  home, on the condition that the board makes the two agree.
- That agreement is read one way only. Every name the frontmatter declares
  must appear in the prose, so a reader following the sentence meets the
  same tasks a script does. The other direction cannot be read: finding a
  task name inside "two, both in `security-v1` and `operate`" is parsing
  English, and that is the whole reason the block exists. The requirement
  says so rather than claiming a link the board cannot hold.
- A kind the table does not know is a finding and never a silence. A trace
  that is ignored because its key was mistyped is the vacuous pass
  `nothing-passes-vacuously` closed for tests, met again in a wall.
- The value grammar is the one `Feeds:` and `Read:` already accept: comma
  separated, a name optionally in backticks, a trailing period tolerated.
  No change to `bin/lib/frontmatter.mjs`.
- One command, because the concept is one concept. A requirement's trace and
  a drawing's trace are the same question asked of two artefacts, and asking
  it through the acceptance wall for one and the drawings wall for the other
  would make a general thing read as two special ones.
- `nothing` is an ordinary value and the common one. Thirty-two of
  forty-four supersedes say it today, and most drawings weigh no named
  principle.

## Constraints

- The Handoff keeps its ten lines, their names and their order, and the
  drawing keeps its six sections. Three closed contracts read that order and
  none of them is this task's to break.
- No change to `bin/lib/frontmatter.mjs`.
- The block is the standard's shape as that parser reads it, fenced by `---`
  at the top of the file.
- Every one of the 54 requirements and 48 drawings is migrated in the same
  change. A wall that reports a hundred findings on the day it lands is a
  wall nobody reads.
- The skill rules apply: the standard's shape, MIT, under five hundred
  lines, no vendor or product named, no dash.
- `kaal traces` joins the guarded commands and the board, and answers,
  refuses or says the question is not this tree's, like the ten before it.

## Acceptance criteria

1. Every `requirements/<task>/requirement.md` and every
   `architecture/<task>/drawing.md` opens with a frontmatter block holding a
   `traces` map, and both templates do.
2. `kaal traces [root]` answers on a tree whose every trace resolves, and
   the surface page names it with what it answers, what it reads and its
   exit codes.
3. A name that resolves to nothing is a finding naming the artefact, the
   kind and the name; the command ends on the code a finding ends on.
4. A kind the table does not know is a finding naming the artefact and the
   kind. A trace is never ignored for being unrecognised.
5. An artefact with no block, or with no `traces` map, is a finding naming
   it; and `nothing` is accepted as a kind's value without one.
6. The board reports a requirement whose `Supersedes:` line does not mention
   a name its trace declares, naming the requirement and the name; and for
   every requirement in this tree whose trace names a task, that line still
   carries the prose as well as the name.

## Open questions

- Does a drawing declare `requirement:` when its directory name already
  says so, and `bin/lib/drawings.mjs`'s `orphan` rule already resolves it?
  Declaring it is one home too many; leaving it out means the most obvious
  trace in the league is the one the map does not carry.
- Once a drawing declares its principles, should the `Weighed against:` line
  that `architecture/an-architect-names-its-principles` drew resolve against
  the declaration rather than against the directory? That would make the
  per decision line a citation of the per drawing trace, which is the same
  pattern as the Handoff's, and it changes a drawing that is merged but not
  yet built.
- Should a supersede resolve to a **closed** requirement rather than any
  requirement? Superseding an open task is either a mistake or a race and
  nothing today can tell which.
- `PR #1, which closes when this lands` names a pull request, not a task.
  Does that become `nothing` with the prose kept, or does the league admit a
  kind whose things do not live in this tree?
- Which kinds does the table hold on the first day, beyond `supersedes` and
  `principles`? Tests, code and operations were all in the ask and none of
  them has a name a trace could resolve yet.

## Handoff

- Task: an-artefact-traces-what-it-came-from
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/an-artefact-traces-what-it-came-from/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file, with fixture roots for a
  name that resolves to nothing, a kind the table does not know, a trace the
  prose does not carry, and an artefact with no block
- Green before the build: none expected
- Open questions: 5, listed above
- Status: open
- Blocked on: nothing
- Unblocks: `unblocks` computed from everyone else's `blocked_on` rather
  than written; a trace for retros and for the standing pages; and
  `a-skill-names-the-principles-it-cites`, which is the hole
  `architecture/an-architect-names-its-principles` priced and left open.
  That drawing named its closing task `an-artefact-names-what-it-describes`;
  the runs above retired the name, because the artefacts do name what they
  describe and what they lacked was a reader
- Supersedes: nothing. The three closed contracts that read the Handoff's
  line order are honoured rather than superseded: every body line keeps its
  name, its place and its prose, and the frontmatter is added beside them
- People: none
