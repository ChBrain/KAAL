# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the sixty-seventh use of the analyse skill, amending
`a-diff-carries-one-seat` on three clauses the architect handed back an hour
after the criteria merged, 10 September 2026.
Place: this repository

## Liked

- Every one of the three was found by trying to draw against the criteria
  rather than by rereading them. A lane with no seat could change nothing, a
  push to `main` turned the board red, and both are facts about this tree
  that no amount of careful writing would have surfaced. The method put the
  architect in front of them before a single line of the guard existed.
- The handback stayed a handback. All three are clauses, none is a widening,
  and the criteria still refuse everything they refused yesterday. The
  temptation to fix them from inside the drawing was real and it would have
  been this task cheating at the thing this task exists to stop.
- The stand-in caught a fixture that could not build itself. One case has to
  branch to `main` to prove the clause it exists for, and the helper always
  created a branch, so `-b main` was fatal. That is the skill's own rule
  about a fixture obeying every rule it is not testing, met head on.

## Learned

- A criterion can be complete and still leave a lane with nothing to change.
  The requirement's own assumption says governance, a skill, an agent and an
  eval carry no seat, and the criteria then gave those lanes only the shared
  paths. The assumption and the criterion were each right and together they
  were a tree nobody could edit. Nothing I know how to do reads two sections
  against each other like that.
- Deny by default has a second edge nobody names: the thing it denies first
  is the base branch. `main` matches no lane, the board runs on every push to
  it, and a guard that refuses an unknown branch refuses the branch every
  merge lands on. The fix is one clause, and I would have shipped the red.
- Declaring `main` a lane looked like the cheap way out and cost two other
  criteria: a lane that deliberately allows nothing fails the clause that a
  seatless lane allows something, and `AGENTS.md` would have had to name a
  lane nobody works in. Two criteria disagreeing about one config entry is
  how a design tells you the entry is wrong.
- Seven of the last thirty commits touching `kaal.config.json` are builds,
  the most recent four hours old and mine. That is the habit the guard is
  pointed at, and it is why the paths a lane allows are per lane and not
  pooled into `shared`: a list every lane may change is a list the guard
  cannot defend.

## Lacked

- No name for a handback that is only clauses. The skill has the architect
  handing a criterion back with what is wrong with it, and nothing says what
  comes back: a new criterion, a reworded one, or three added clauses that
  refuse nothing new. I wrote a Handoff line and invented the shape twice in
  one night.
- Nothing makes an analyst try their own criteria against the tree they will
  run on. Both real defects here are about where the wall runs, not about
  what it decides, and the acceptance tests never asked.

## Longed for

- A cheap way to ask "which lane would this tree's own last twenty diffs fall
  in". Every fact I needed was a `git log` away and I wrote the loop by hand
  twice tonight.
- A criterion that says a wall runs on the board should have to say what it
  answers on `main`. That is the second time a rule was written for a branch
  and met the base first.

Feeds: analyse
Read: architect
