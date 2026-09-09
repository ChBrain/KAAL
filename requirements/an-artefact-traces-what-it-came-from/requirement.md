---
traces:
  supersedes: nothing
---

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
- Forty-seven requirements carry a `- Supersedes:` line. Thirty-four say
  `nothing` and three more say `nothing` followed by a sentence. Ten name
  something, nine of which are a task in this tree and one a pull request,
  and none of the ten is a name a script can read: every one is a sentence
  and eight wrap onto a second line. Verbatim:
  _Corrected during the build. This paragraph first read "forty-four ...
  thirty-two say nothing ... twelve name something", counted by grepping for
  the line rather than reading its value, so three lines that say `nothing`
  and then explain why were counted as naming a task. The migration found it,
  which is the defect this task exists to catch, met on its own page._
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
- A drawing's requirement is found today by the directory's name, and that
  convention forces the relation to be one to one: across all 48 pairs the
  greatest number of drawings pointing at one requirement is 1, and it cannot
  be otherwise. A trace that is derived from a name can never be many to one,
  so a count over derived traces can never signal anything.
- The same count over a trace that **is** written by hand does signal:
  `security-v1` is superseded by three requirements, and it is the document
  this session broke twice and amended twice.
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
- A drawing declares `requirement:` even though its directory name says the
  same thing. It reads as one home too many, and the run above is why it is
  not: a trace derived from a name is one to one by construction, so how many
  artefacts answer one requirement is a question the tree cannot ask until
  the trace is written down. The duplication buys a relation that can be
  counted, and the `orphan` rule keeps its own job of finding a drawing with
  no requirement at all.
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
   `traces` map, and both templates do; every drawing's map names the
   requirement it was drawn from.
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
- A trace names and does not yet pin. The asker has named the next step,
  a sha so that "is this requirement answered, how many answer it, and has
  the requirement changed" are all scriptable, and a run over the tree's own
  history settled what to hash: of 48 drawings, 47 had their requirement
  edited afterwards and only 2 had the acceptance criteria change, so a whole
  file pin cries wolf 45 times in 47. Does the value grammar therefore become
  `<name>@<sha>`, which this parser reads and which a list still separates by
  comma? Nothing here forbids it, the migration would be written by the tool
  that computes the shas rather than by hand, and the task is named in the
  handoff.
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
- Status: closed
- Blocked on: nothing
- Unblocks: `a-trace-pins-what-it-read`, which adds the sha and the three
  questions it answers; `unblocks` computed from everyone else's
  `blocked_on` rather than written; a trace for retros and for the standing pages; and
  `a-skill-names-the-principles-it-cites`, which is the hole
  `architecture/an-architect-names-its-principles` priced and left open.
  That drawing named its closing task `an-artefact-names-what-it-describes`;
  the runs above retired the name, because the artefacts do name what they
  describe and what they lacked was a reader
- Supersedes: nothing. The three closed contracts that read the Handoff's
  line order are honoured rather than superseded: every body line keeps its
  name, its place and its prose, and the frontmatter is added beside them
- People: none
- Superseded by: `a-tree-has-one-root`, in part. The kind table grew a
  fourth row, `parent`, and this task's contract fixed the rows at three by
  name. Moved to four, still named rather than counted. `parent` is also the
  first row whose target depends on the artefact that declared it, so the
  claim that a row says where a kind lives no longer holds for every row
- Superseded by: `a-trace-pins-what-it-read`, in part. A trace's value grew
  from `<name>` to `<name>` or `<name>@<sha>`, so this task's criterion 6
  reads the name without its pin. Nothing else moved: the prose still carries
  the name and never the sha, because nobody types one

## Build handoff

- Task: an-artefact-traces-what-it-came-from
- Runs: unit 107, contract 141, acceptance 249, all green, run just now
- Scope: a trace module with a table of three kinds, a `traces` command, an
  eleventh guarded case, a twelfth wall, a surface entry, a block on both
  templates, and 106 artefacts migrated from what their own pages already
  said
- Class: surface moved, tool moved (`kaal class . --against origin/main`, run last, after the final edit)
- Unproven: nothing. Every criterion is a wall or text and both run here
- Superseded: one the analyst did not name. `applies-here`'s unit fixes the
  guarded commands as exactly ten by name, and the drawing put `traces`
  among them. Moved to eleven, named rather than counted, so a command added
  by accident is still a red. Found by running the closed tests the change
  touches
- Handed back: nothing

## What the build corrected in this record

- The count in What the runs said was wrong and this task is the reason it
  was found. It read "forty-four ... thirty-two say nothing ... twelve name
  something", counted by grepping for the line rather than reading its value.
  The truth is forty-seven lines, thirty-four saying `nothing`, three more
  saying `nothing` and then explaining why, nine naming a task in this tree,
  and one naming a pull request. Criterion 6's test moved from twelve to
  nine with the reason beside it.
- The `silent-prose` fixture could not fire. Its task was `t` and its prose
  says "something-else", which contains the letter t, so the check it exists
  to drive passed on a letter. Renamed to `dropped`. This is the second time
  in two days a one letter fixture name has hidden a case, and the first
  time was in this task's own contract fixtures.
- Criterion 6's test stripped every lowercase token before asking whether
  prose remained, which erased the prose it was looking for: `evals-v2`'s
  nine word line read as bare names. It now strips only the declared names.
- `agent-v1` answers the requirement's open question by example. Its line
  says "PR #1, which closes when this lands", which is not a task, so its
  trace is `nothing` and the prose keeps the fact. A pull request is not a
  kind and the league did not gain one.
