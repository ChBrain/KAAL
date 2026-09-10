# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-fourth use of the architect skill, drawing
`a-diff-carries-one-seat` after its first drawing was closed unbuilt and its
criteria were re-specified and then amended, 10 September 2026.
Place: this repository

## Liked

- Five isolations, five seams, each break reddening exactly one, on the first
  pass. That has not happened before in this league: the last two drawings
  each had a break that reddened nothing and a seam that was passing on a
  neighbour's finding. The difference is that seam 4 takes its inputs rather
  than reading them, so a contract can hand it a lane and a declaration and
  no other seam is in the way.
- Three of the five decisions were settled by running something rather than
  by weighing. Whether CI has a branch, what git says about a rename, and
  what it says about half a rename are all facts, and each of them closed a
  door I would otherwise have argued about.
- Handing three clauses back before drawing cost one pull request and bought
  a drawing that does not have to apologise for anything. The alternative was
  a decision record explaining why the drawing widened a criterion, in the
  task whose whole purpose is that nobody may.

## Learned

- CI has no branch, and a guard that reads a lane off the branch reads
  nothing where the reviewer looks. `actions/checkout` leaves HEAD detached
  on a pull request, and `git rev-parse --abbrev-ref HEAD` answers `HEAD`. I
  found this by running it rather than by reasoning about it, and I would
  have shipped a wall that refused every pull request in the league.
- Half a rename is not a rename, and git says so plainly. An unstaged move
  reports a delete and lists the arrival as untracked, because git never
  reads untracked content and so cannot pair the two. Staged, the same move
  is one `R100` line. The guard is therefore sharp on a person mid move, and
  that is early rather than wrong.
- Two walls can share a git reader and must not share a definition of a
  diff. The class wall asks what a consumer notices moved and reads tracked
  files only, on purpose, with a comment saying why. This asks who may have
  moved it. The first drawing reused `changed` and then had to carve an
  exception out of it; this one shares `resolves` alone and says the two
  differ, which is shorter and truer.
- The weakest thing in a drawing is worth naming as the weakest thing. The
  plans are shared because a tool writes a count into the tester's directory,
  and a shared path is a path the guard does not defend. Writing "this is the
  weakest thing here" in the record made the reopens line write itself.

## Lacked

- Nothing in the skill asks where a wall runs. Every decision that mattered
  tonight was about the place: a detached HEAD, a base branch, a working tree
  mid move. The template asks what a seam promises and never asks who is
  standing there when it is kept.
- No name for a fact the tool cannot see. The guard cannot tell a tool's
  write from a person's, which is why the plans are shared, and "the guard is
  blind here" is not a kind of finding, a kind of seam, or a kind of
  decision. It is only prose.

## Longed for

- A fixture helper that builds a scratch repository, because three drawings
  and two requirements have now written the same twenty lines. The rename
  case needed `mkdir` before `git mv` and I found that by watching it fail,
  which is the third fixture defect this week that a shared helper would have
  carried.
- A `Weighed against:` line that could name a tension with no principle
  behind it. Two of tonight's records weigh the same thing: how much a guard
  may refuse before people route around it. That is not the-two-goods and it
  is not the-seat-owns-the-lens, and by the skill's own rule a tension
  weighed twice without a name is a principle waiting to be written.

Feeds: architect
Read: analyse
