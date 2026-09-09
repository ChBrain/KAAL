# Requirement: a-requirement-names-what-it-supersedes

_Ask, from Kai: the dependencies between requirements, architecture, tests
and code go stale, "so no file is standing alone without its storyline", and
"out of the hip: YAML frontmatter so its computable? for linking i mean?"
Then, after a run that counted what the league writes against what it reads:
"we go for frontmatter now". The ask names six pairs of link; this is the
first of them, and the analyst says so rather than taking all six._

## Goal

An architect reading the closed requirements that touch their path wants to
know which of those claims have already moved, so that nothing is designed
against a constraint the league has retired; they will know it by every
requirement declaring the tasks it supersedes as names a script can read, by
the board reporting a name that resolves to no requirement, and by the
declaration and the prose beside it never naming different tasks.

## What the runs said

- Forty-four requirements carry a `- Supersedes:` line. Thirty-two say
  `nothing`. Twelve name something, and **none of the twelve is a name a
  script can read**: every one is a sentence. Verbatim, four of them:
  `` `security-v1`, in part, and the supersede is declared in that ``,
  `eval-record-v1, on the field list (one field added)`,
  `two, both in `security-v1`and`operate`. `security-v1`'s`, and
  `PR #1, which closes when this lands`. Eight of the twelve wrap onto a
  second line. One names a pull request rather than a task.
- Forty-two requirements carry `- Blocked on:` and ten carry `- Unblocks:`.
  Nothing reads the value of any of the three.
- What is walled about those lines is that they exist and where they sit:
  `requirements/analyse-v2/acceptance.test.mjs` asserts the template's
  Handoff carries `Status:`, `Blocked on:` and `Supersedes:`;
  `architecture/analyse-v2/contracts.test.mjs` asserts
  `at("Supersedes:") > at("Blocked on:")`; and
  `architecture/a-task-names-its-people/contracts.test.mjs` lists all four in
  order. Presence and order, never the value.
- Two lines in the league do have their values read, and both are read from
  the body rather than from frontmatter: `- People:` by
  `bin/lib/acceptance.mjs`, and `Feeds:` and `Read:` by `bin/lib/retros.mjs`.
  `readPeople` matches `/^- People: (.+)$/m` over the whole page.
- That scan is not ambiguous today: no requirement carries two of any of the
  four lines, and none of them appears outside a Handoff section. The hazard
  is real and the defect is not here yet.
- No requirement and no drawing carries frontmatter: 0 of 54 and 0 of 48.
  All six skills do, and so do eval records, waivers, agent bindings and
  personas, through `bin/lib/frontmatter.mjs` at five call sites.
- That parser reads `key: value` and one level of map. It has no list, so a
  comma separated value arrives as one string and the reader splits it, which
  is what `bin/lib/retros.mjs` already does for `Feeds:` and `Read:`.
- `bin/lib/acceptance.mjs` states the league's rule for the People line in
  its own words: "the wall reads that it answered, never what it said:
  presence is a wall, meaning is not."
- The merged drawing `architecture/an-architect-names-its-principles` states
  the counterpart for a reference: "That a decision names a principle which
  exists is text, and text is." Its wall resolves a cited name against a
  directory and never reads the file it finds.

## Assumptions

- A task name is not meaning. Whether a supersede was justified is meaning
  and stays the analyst's; that the named task exists is text, and text is a
  wall. This task reads the reference and never the claim.
- The frontmatter carries names and nothing else: one or more task names,
  comma separated, or the word `nothing`. The qualifying prose that twelve
  requirements carry today ("in part", "on the field list", "the claim that
  moves is where the two goods lives") is what a human needs and a script
  cannot use, and it stays in the Handoff.
- So the Handoff line stays and cites what the frontmatter declares, the way
  the architect skill's Decisions bullet now cites `the-two-goods` rather
  than restating it. The name in both places is a citation and not a second
  home, on the condition that the board makes the two agree; without that
  condition it is two homes for one claim and the defect
  `an-architect-names-its-principles` exists to prevent.
- The agreement between the two is read one way only. Every name the
  frontmatter declares must appear in the Handoff's prose, so a reader
  following the sentence meets the same tasks a script does. The other
  direction cannot be read: finding a task name inside "two, both in
  `security-v1` and `operate`" is parsing English, and that is the whole
  reason the frontmatter exists. The requirement says so rather than
  claiming a link the board cannot hold.
- The value grammar is the one the league already accepts on `Feeds:` and
  `Read:`: comma separated, a name optionally in backticks, a trailing
  period tolerated. No change to `bin/lib/frontmatter.mjs`, whose five
  callers are not this task's to disturb.
- The finding surfaces through the acceptance wall, which is where a
  requirement's own defects already surface: `a-task-names-its-people` put
  the People check there rather than inventing a command, and this is the
  same page read for the same kind of fact.
- Requirements only. Drawings, retros and the standing pages carry links
  too, and each is a task that can fail on its own; naming them all here
  would be enlarging the ask rather than splitting it.
- `nothing` is an ordinary answer and the common one. Thirty-two of
  forty-four say it today.

## Constraints

- The Handoff keeps its ten lines, their names and their order. Three closed
  contracts read that order and none of them is this task's to break.
- The frontmatter block is the standard's shape as
  `bin/lib/frontmatter.mjs` reads it, fenced by `---` at the top of the file.
- No change to `bin/lib/frontmatter.mjs`.
- The skill rules apply: the standard's shape, MIT, under five hundred
  lines, no vendor or product named, no dash.
- Every one of the 54 requirements is migrated in the same change, because a
  wall that reports 54 findings on the day it lands is a wall nobody reads.

## Acceptance criteria

1. Every file at `requirements/<task>/requirement.md` opens with a
   frontmatter block, and the analyst's template does, carrying a
   `supersedes` key.
2. The value of `supersedes` is `nothing`, or task names separated by
   commas, in the grammar `Feeds:` accepts; no requirement's value carries a
   sentence.
3. The board reports a requirement whose `supersedes` names a task that has
   no requirement of that name beside it, naming both the requirement and
   the name, and ends on the code a finding ends on.
4. The board reports a requirement whose `Supersedes:` line does not mention
   every task its frontmatter declares, naming the requirement and the name
   the prose does not carry.
5. A requirement with no frontmatter, or with no `supersedes` key, is
   reported and named.
6. The Handoff's `Supersedes:` line still carries the prose: for each of the
   twelve requirements that name a task, the line says which claim moved and
   whether the supersede is partial.

## Open questions

- Does `nothing` belong in the frontmatter at all, or is an absent key the
  same statement? An absent key cannot be told from a forgotten one, which
  is why the People line is required rather than optional; the same argument
  probably decides this, and the asker may disagree.
- Should a supersede resolve to a **closed** requirement rather than any
  requirement? Superseding an open task is either a mistake or a race, and
  nothing today can tell which.
- `PR #1, which closes when this lands` names a pull request, not a task.
  Does that become `nothing` with the prose kept, or does the league admit a
  second kind of reference?
- Do `blocked_on` and `unblocks` join in this change or in their own? They
  are a pair that should agree both ways, which is a different and larger
  reading than resolving a name.
- Who removes a supersede when the superseded task is deleted, and does
  anything notice?

## Handoff

- Task: a-requirement-names-what-it-supersedes
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-requirement-names-what-it-supersedes/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file, with fixture roots for a
  name that resolves to nothing, a frontmatter and a Handoff that disagree,
  and a requirement with no block at all
- Green before the build: none expected
- Open questions: 5, listed above
- Status: open
- Blocked on: nothing
- Unblocks: the same reading for the league's other links, one task each:
  `blocked_on` and `unblocks` as a pair, a drawing's own frontmatter, and
  `a-skill-names-the-principles-it-cites`, which is the hole
  `architecture/an-architect-names-its-principles` priced and left open. That
  drawing named its closing task `an-artefact-names-what-it-describes`; the
  runs above retired that name, because the artefacts do name what they
  describe and what they lacked was a reader
- Supersedes: nothing. The three closed contracts that read the Handoff's
  line order are honoured rather than superseded: the `Supersedes:` line
  keeps its name, its place and its prose, and the frontmatter is added
  beside it
- People: none
