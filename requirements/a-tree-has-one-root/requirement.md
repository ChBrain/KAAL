# Requirement: a-tree-has-one-root

_Ask, from Kai: "requirements is a tree, not a forrest; architecture is a
tree, not a forrest; test is a tree, not a forrest. every 2nd tree in 1, 2 or
three needs a STRONG argument. right now you build a forrest and a forrest can
and will disagree with each other without us having any protection." The
analyst had argued for waiting on evidence that documents needed splitting.
That was an answer to a different question: which documents are too big is
local, and whether the set has a shape is not. The ask was restated and the
runs below say it is right._

## Goal

Anyone adding a requirement wants the set to have one shape rather than many,
so that two tasks cannot quietly claim the same ground and disagree with
nobody to reconcile them; they will know it by every requirement naming its
parent, by the board reporting a second root that carries no argument, by a
cycle being a finding, and by the tree having depth rather than being a star
with one trunk and fifty four leaves.

## What the runs said

- `requirements/` holds 55 nodes and 55 roots. `architecture/` holds 48 nodes
  and 48 roots. No parent is declared anywhere. Both are forests, and a
  forest has no invariant to break.
- The overlap is not hypothetical. Reading the Structure and Fixed and free
  sections of all 48 drawings for the files they name, **21 of 39 files are
  named by more than one drawing**: `bin/kaal.mjs` by 22 drawings,
  `bin/lib/gates.mjs` by 8, `bin/lib/rules.mjs` by 7,
  `skills/architect/SKILL.md` by 6, `bin/lib/acceptance.mjs` and
  `skills/analyse/SKILL.md` by 6 each. 124 pairs of file and drawing over 39
  files.
- It has already cost. `security-v1`'s rule lives in `bin/lib/rules.mjs`,
  which 7 drawings name. In this session alone that rule was narrowed by one
  task and widened again by another, and `security-v1` is superseded in part
  by three separate requirements. Nothing above those three reconciled them
  because there is nothing above them.
- The same two documents come top of three independent measurements:
  `security-v1` and `push-v1` lead on criteria that moved after a drawing
  landed, on how many tasks supersede them, and on how often their criteria
  changed. A forest cannot tell a document that is central from one that is
  contested.
- The other two trees are not a second mechanism. Every drawing answers
  exactly one requirement, which `an-artefact-traces-what-it-came-from` now
  requires it to declare, and acceptance tests sit beside requirements while
  contract tests sit beside drawings. 48 of the 55 requirements have a
  drawing and 7 do not. So architecture and test are the requirements' shape
  read from another artefact, and one tree makes three.
- The league already has a shape for a human's argument that the board reads
  and never judges: `bin/lib/gates.mjs` reads `waivers/<wall>.md` with
  `wall`, `who`, `why` and `until`, and its comment says "it never hides a
  red: the wall still runs and its line says waived, with who and why".
- `bin/lib/frontmatter.mjs` reads one level of map, so `parent` joins
  `traces` beside the kinds already there and needs no parser change.

## Assumptions

- A parent is a claim, not a folder. A task's parent is the task whose
  criteria this one makes more specific. If a task would sit as comfortably
  under a different parent, the parent is wrong, and that is the test a
  person applies when assigning one.
- One root needs no argument, because it is the trunk. Every root after the
  first carries a written argument, and the board reads that it argued and
  never whether the argument is good. Text is a wall; meaning is not, which
  is what the whole league already holds for the People line.
- The argument lives on the root that needs it, not in a central file, as a
  `- Root because:` line in the Handoff beside the lines already there. A
  waiver waives a wall for everyone; a second tree is one document's claim
  and belongs beside it.
- A second root does not expire the way a waiver does. A deliberate second
  tree is a decision, not a temporary excuse, and an expiry date on it would
  be a lie about what it is.
- One tree makes three. Architecture and test hang off requirements one to
  one, so this task shapes requirements and holds the other two by checking
  that the one to one is real. A drawing answering two requirements, or
  none, is where the three come apart, and that is a finding.
- A star is not a tree in any useful sense. Parenting all 54 remaining
  requirements to one trunk satisfies every invariant and protects nothing,
  because 54 siblings disagree exactly as 55 roots do. The shape has to have
  depth, and the board says so.
- Assigning 55 parents is judgement and cannot be written by a tool. It is
  the build's real work, done by a person against the test in the first
  assumption, and reviewed as a whole rather than a file at a time.
- `parent` is a kind in the trace map, so it resolves and reports through the
  machinery `an-artefact-traces-what-it-came-from` builds. Nothing new
  resolves names.

## Constraints

- No change to `bin/lib/frontmatter.mjs`.
- The trace's shape, the kind table and the command come from
  `an-artefact-traces-what-it-came-from`; this task adds a kind and three
  readings over the graph it makes, and moves nothing that one fixed.
- Every one of the 55 requirements is given a parent in the same change, or
  the board is red on the day it lands.
- The skill rules apply: the standard's shape, MIT, under five hundred
  lines, no vendor or product named, no dash.

## Acceptance criteria

1. Every `requirements/<task>/requirement.md` declares `parent` in its trace,
   whose value is a requirement's name or `none`, and the analyst's template
   offers it.
2. `kaal traces` reports every root beyond the first whose Handoff carries no
   `- Root because:` line, naming each such root; a root that carries the
   line is not a finding, and the board never judges what it says.
3. A cycle among parents is a finding naming every task in the ring.
4. A drawing that answers no requirement, or more than one, is a finding
   naming it; this is what holds architecture and test to the same shape.
5. The tree has depth: the board reports when the number of requirements
   whose parent is the root exceeds a stated share of the whole, so a star
   cannot pass as a tree.
6. On this tree `kaal traces` answers: one root, or each further root
   argued; no cycle; every drawing answering exactly one requirement; and
   the depth report silent.

## Open questions

- What is the root, and what does it claim? A root requirement states what
  the league is for, and every other requirement is a refinement of it.
  Nobody has written that document and the asker should name it.
- What share of requirements parented to the root is too many? Criterion 5
  needs a number and nobody has evidence for one. Half is a guess; the honest
  first version may report the share rather than judge it.
- Does a requirement's parent have to be closed before the child opens? A
  child refining an open parent is refining something that may still move.
- Where does a task that refines two parents go? It is either two tasks or
  the parents are wrong, and the board cannot tell which.
- Is `supersedes` ever the same edge as `parent`? A task that replaces
  another in part looks like a child and is not one, and the migration will
  meet the question 12 times.

## Handoff

- Task: a-tree-has-one-root
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-tree-has-one-root/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file, with fixture roots for two
  unargued roots, an argued second root, a cycle, a drawing answering two
  requirements, and a star
- Green before the build: none expected
- Open questions: 5, listed above
- Status: open
- Blocked on: `an-artefact-traces-what-it-came-from`, which fixes the trace
  and the command; and the asker, who names the root
- Unblocks: the report over the trace map that names a crowded document,
  which is a signal rather than a wall and is worth building once the tree
  gives it something to measure against
- Supersedes: nothing
- People: none
