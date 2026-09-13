---
traces:
  parent: a-diff-carries-one-seat@94929e3013fa24a1d998a05ed2e7026cc9181cc56083ae07fc2858daf937953a
  supersedes: nothing
---

# Requirement: a-crossing-names-its-owner

## Goal

A seat whose diff is refused learns from the refusal itself whose path it
reached and that asking that seat is a way through, so the next act is a
message rather than a widened declaration or a guess.

## What the runs said

- The owner is computed and thrown away. On a scratch tree on
  `requirement/alpha` changing `bin/kaal.mjs`, `kaal seats . --against
release` answers `lane requirement/* (analyst)`, `seat analyst`, `seat
developer`, `bin/kaal.mjs: outside the lane requirement/*`, and exits 1. The
  word `developer` is in the answer as a seat the diff touches and never as
  the owner of the path that was refused, and nothing in the answer says what
  to do next.
- The fix line is the board's and not the wall's. `kaal.config.json` carries
  `"fix": "split the diff or rename the branch to the lane it belongs to;
never widen the declaration to let a diff through"` on the seats gate, and
  `a-diff-carries-one-seat` criterion 6 holds it to `/split/i`, `/rename/i`
  and no `/add .*(seat|lane|glob|own|shared)/i`. A fix line is one string for
  every crossing and cannot name a seat, because which seat is owed the
  message depends on the path.
- Six seats own six trees and nothing else. `manager plan/**`, `analyst
requirements/**`, `architect architecture/**`, `tester tests/**`,
  `developer bin/** SURFACE.md`, `operator deploy/**`. So a crossing onto
  `AGENTS.md`, `kaal.config.json` or `.github/**` reaches a path no seat owns
  at all, and those are the paths a lane allows rather than a seat.
- There is nowhere in the tree a block is written today. `tests/bugs/` is one
  page per case carrying `Case`, `Wall`, `Seen` and `Lane`, which is a red
  case and the lane that can fix it, and a crossing is neither. `AGENTS.md`
  says a blocked seat names its block where it stands and the manager picks
  it up as it stands, and no page in this tree is that place.

## Assumptions

- The message is the whole task. The asker's item says this is the
  negotiation trigger and that it is a message, so what changes is what the
  wall answers and not where anything is stored.
- The wall's own answer carries the owner, and not the board's fix line. A
  fix line is one string for every crossing and the owner differs per path,
  so a wall that named the owner in the fix would be naming the wrong seat
  most of the time.
- A block is recorded by the seat that is blocked, in its own lane. That is
  what `AGENTS.md` already says about where a block stands, and it is why the
  answer can name a place before the page that holds it exists.
- Naming a path's owner is not permission to touch it. The declaration is
  unchanged by this task: the refusal still refuses, and what it gains is a
  name and a next act.

## Constraints

- The declaration does not widen. `a-diff-carries-one-seat` fixes that a
  finding is a refusal and that the fix never invites adding a seat, a lane
  or a glob, and this task adds words to a refusal rather than a way past it.
- The seat lines and the exit codes stay as they are. That output is the
  closed task's and this one moves none of it.
- Deterministic and offline, like every wall. The owner is read from the
  declaration in the tree and from nothing else.

## Acceptance criteria

1. A crossing names the seat that owns the path. On a branch in one lane
   carrying a path a different seat owns, the answer carries a finding that
   names the path and that seat.
2. A crossing onto a path no seat owns says so in words, and names no seat.
   The answer still refuses the path by name, the finding about it says no
   seat owns it, and it carries none of the six seat names.
3. The refusal says a block is the way through, naming the seat to ask. The
   answer carries a line about the block that names the owning seat.
4. That line says where the block is recorded: the lane of the branch that
   was refused, and never the owner's tree.
5. The owner and the block are said about the path that was refused and
   nothing else. A diff carrying both a crossing and a change inside its own
   lane names the owner in the finding about the crossing, says nothing about
   the path it was allowed, and carries one line about a block and not one
   per path in the diff.

These fix three shapes the tests read. A finding about a path a seat owns
names the path, the lane that refused it and that seat. A finding about a
path no seat owns names the path, the lane, and says no seat owns it. A line
about the block names the seat to ask and the lane the block is recorded in,
and there is one of them however many paths were refused.

## Open questions

- Which page holds a block once it is written? The answer names the lane, and
  the asker's item 6 gives every seat a `backlog.md` in its own tree. Until
  that lands the answer names a lane and not a file, which is a true sentence
  that will get more specific rather than a wrong one.
- Should the board's fix line gain the same clause? It cannot name a seat,
  but it could say a block is one of the ways out beside splitting and
  renaming. That is a governance diff and one line, and it is not in this
  task because a reader who sees the findings already has the specific answer.
- Does a crossing onto a shared path deserve the same sentence? It is not a
  crossing today, because `retros/**` and the plan and suite pages are open to
  every lane, and the asker's item 6 notes that what shared means is its own
  question.

## Handoff

- Task: a-crossing-names-its-owner
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test --test-timeout=60000
requirements/a-crossing-names-its-owner/acceptance.test.mjs`, 13 September
  2026, all 5 failing, and each one failing on its own as well
- Tests: `requirements/a-crossing-names-its-owner/acceptance.test.mjs`
- Stand-in green: all five, on a throwaway answer that named the owner in the
  finding and printed one block line, discarded from file copies. It ran the
  closed tasks above it as well, `a-diff-carries-one-seat`,
  `a-dependency-update-lands-on-main` and the seat rule's units, nineteen
  green, because this task widens a string three closed criteria read
- What the stand-in and the first red run found, both in this page and not in
  the tree: two criteria passed before anything was built. The one about a
  path no seat owns asked only that no seat be named, which is what silence
  does; it now asks the finding to say so in words. The one about saying
  nothing where nothing was refused could not fail at all, because nothing
  said anything yet; it is now about the refused path getting the owner and
  the allowed path getting nothing, which is the same guard with a subject
- Open questions: 3, listed above
- Blocked on: nothing
- Unblocks: the asker's item 6, the dependency table and a backlog in every
  lane, which is where a block stops being a sentence and becomes a page
- Supersedes: nothing
- People: none
