---
traces:
  supersedes: nothing
---

# Requirement: a-trace-pins-what-it-read

_Ask, from Kai, following `an-artefact-traces-what-it-came-from`: "that allows
to check: is this requirement answered as well as, how many answer it and also
has the requirement changed. and all of that is scriptable. basically if a
requirement changes the tracing from architecture artifact to requirement
shows a former sha (I'm guessing that's what we use, if there is nothing
better)." The guess is right about the tool. A run over the tree's own history
says it is wrong about the scope, and that run is the first thing below._

## Goal

An architect returning to a task wants to know whether the requirement moved
under the drawing since it was written, so that a drawing answering criteria
that no longer exist is found by the board rather than by the developer who
builds it; they will know it by every trace carrying the sha of what it read,
by `kaal traces` reporting a pin that no longer matches, and by the sha being
written by the tool rather than typed.

## What the runs said

- Of the 48 tasks that have both a requirement and a drawing, **47 had their
  `requirement.md` edited after the drawing's first commit**. In only **2** of
  those did the `## Acceptance criteria` section change. So a pin over the
  whole file would report 45 times in 47 without a criterion having moved.
- The reason is the league's own workflow rather than carelessness: a
  requirement's `- Status:` flips from open to closed and its Handoff is
  filled in after the drawing lands, every time. A whole file pin fires on
  the normal path, which is how a wall becomes noise nobody reads.
- The two that did move are `push-v1` (8 criteria then, 8 now) and
  `security-v1` (5 then, 5 now). Both were amended in part by a later task
  and both kept their count while the text changed, which is the case a
  reader cannot see and a sha can.
- `bin/lib/drawings.mjs` already slices a requirement's
  `## Acceptance criteria` out of its text, to count the criteria the
  strategy table must name. The region this task pins is one the tree
  already knows how to cut.
- `bin/lib/sha.mjs` is `fileSha(path)`, the SHA-256 of a file's bytes as 64
  hex characters, and its own comment says why: "when the file changes, the
  record is stale and counts for nothing."
- `bin/lib/record.mjs` is that mechanism finished: an eval record's
  frontmatter carries `ask_sha`, `expect_sha` and `skill_sha`, each compared
  to the live file, and a record that lost one is stale, counts for nothing,
  and the reason is named. It is the only staleness check in the league and
  it serves one artefact with three hardcoded targets.
- Those three shas are not typed. `bin/lib/runner.mjs` generates the record's
  whole frontmatter block, `skill_sha` included, for a person to fill in and
  file.
- `bin/lib/frontmatter.mjs` reads one level of map and no more, so a trace
  cannot grow a nested `{name, sha}` without changing a module with five
  callers.

## Assumptions

- A sha is the right tool. It is exact, offline, needs no history and no
  network, and the league already uses it for the same question. Nothing
  cheaper distinguishes a changed sentence from an unchanged one, and a
  version number is a thing people forget to bump.
- What it hashes is the question, and the answer is a region rather than a
  file. The evidence is 45 false reports in 47.
- Which region is a property of the kind, not of the trace. The kind table
  from `an-artefact-traces-what-it-came-from` says where a kind lives; it
  gains a column saying which part of it counts. A requirement's is its
  `## Acceptance criteria`; a principle's is the whole file, because a
  principle is its claim and has no section that is not.
- The pin joins the name in the value, as `<name>@<sha>`, because the parser
  reads one level of map and a nested pair would change it. A comma still
  separates a list, so `principles: a@<sha>, b@<sha>` reads as it looks.
- Nobody types a sha. The tool writes the pins and a person reviews the diff,
  the way `kaal runner` writes a record's block today. A pin a human is asked
  to compute by hand is a pin that will be wrong.
- A stale pin is a finding and never a failure to resolve. The named thing
  still exists; what changed is what it says. The two are different findings
  because they need different fixes: one is a rename, the other is a reread.
- The board does not decide whether the change mattered. A sha says the text
  moved. Whether the drawing must change is the architect's, and the finding
  says so by naming the region rather than judging it.
- `nothing` carries no pin, because there is nothing to have read.

## Constraints

- No change to `bin/lib/frontmatter.mjs`.
- The trace's shape and the kind table come from
  `an-artefact-traces-what-it-came-from`; this task adds a column and a
  comparison and does not move what that one fixed.
- The writer never edits anything but the pin inside a trace value. A tool
  that rewrites a page is a tool nobody will run twice.
- The skill rules apply: the standard's shape, MIT, under five hundred
  lines, no vendor or product named, no dash.
- Every pin in the tree is written in the same change, by the writer, so the
  board is green on the day it lands.

## Acceptance criteria

1. A trace's value is `<name>` or `<name>@<sha>`, and a list separates them
   by comma; the kind table names, for each kind, the region whose sha is
   pinned.
2. `kaal traces` reports a trace whose pin no longer matches the region it
   names, naming the artefact, the kind, the name and the region, and says
   the text moved rather than that the name is missing.
3. That finding is distinct from the one for a name that resolves to
   nothing: a tree with both reports both, in different words.
4. A trace with no pin is not a finding, and a trace naming `nothing` never
   carries one.
5. `kaal traces --write` writes the pin of every trace it can resolve,
   changes nothing else on the page, and is idempotent: a second run on its
   own output writes nothing.
6. Every trace in this tree that can carry a pin carries a current one, and
   `kaal traces` answers.

## Open questions

- Does a stale pin fail the board or only report? A drawing whose criteria
  moved is not wrong until someone reads it, and the league has both kinds
  of wall.
- Who clears a stale pin: the architect who rereads and rewrites, or
  `--write` run by anyone? A tool that silences a finding without a person
  reading the change is a tool that makes the wall useless.
- Should the pin's region for a requirement be the acceptance criteria alone,
  or the criteria and the constraints? A drawing is bound by both; only the
  first was measured.
- A drawing traces its requirement by directory name today, and
  `an-artefact-traces-what-it-came-from` left open whether it declares one.
  If it does not, the pair the asker named is exactly the pair the map does
  not carry, and this task has nothing to pin for it.
- What happens when the named file is gone: is that the resolution finding,
  the pin finding, or both?

## Handoff

- Task: a-trace-pins-what-it-read
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-trace-pins-what-it-read/acceptance.test.mjs`
- Tests: `acceptance.test.mjs`, beside this file, with fixture roots for a
  pin that no longer matches, a tree carrying a stale pin and a dangling
  name at once, a trace with no pin, and a tree for the writer to write
- Green before the build: none expected
- Open questions: 5, listed above
- Blocked on: `an-artefact-traces-what-it-came-from`, which fixes the trace's
  shape, the kind table and the command this one extends
- Unblocks: the asker's other two questions, which are one task and not this
  one: whether a requirement is answered at all, and by how many artefacts.
  Both are computed over the whole trace set rather than read from one trace,
  they need no pin, and they are buildable the day the trace lands
- Supersedes: nothing
- People: none

## Build handoff

- Task: a-trace-pins-what-it-read
- Runs: unit 107, contract 145, acceptance 253, all green, run just now
- Scope: the kind table's rows become pairs of where and which region, a
  value splits into a name and a pin, a pin that no longer matches its
  region is a finding in its own words, `--write` puts the pin on every
  trace that resolves, and 59 artefacts are pinned
- Class: surface moved, tool moved (`kaal class . --against origin/main`,
  run after the last edit)
- Unproven: nothing that a run can prove. What no run can prove is whether a
  person read the change before clearing a pin, and that is the requirement's
  own open question
- Superseded: one the analyst did not name.
  `an-artefact-traces-what-it-came-from`'s criterion 6 reads a trace's names
  and compares them to the prose; the value grammar grew a pin, so it now
  splits the name off first. Recorded on that task's own page. The grammar
  change itself was declared in criterion 1; what was not declared is that a
  closed test read the old grammar
- Handed back: nothing

## What the loop does, shown

With the tree pinned, adding one sentence to `applies-here`'s acceptance
criteria and running `kaal traces` prints:

```
nothing-passes-vacuously: supersedes: applies-here moved: its Acceptance criteria no longer matches the pin
applies-here: requirement: applies-here moved: its Acceptance criteria no longer matches the pin
```

and exits 1. The drawing that answers that requirement and the requirement
that supersedes it are both found, both named, from one edit. That is the
chain the asker described: a requirement changes, the architecture that
answered it is no longer valid, and it is found rather than remembered.
