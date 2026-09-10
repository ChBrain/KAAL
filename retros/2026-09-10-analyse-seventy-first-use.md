# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy first use of the analyse skill, landing the amendment to
`a-diff-carries-one-seat` criterion 5 that had been written and held for a
day, 10 September 2026.
Place: this repository

## Liked

- The diff needed nothing rewritten to land. It was written a day ago against
  a tree that refused it, and the only thing that changed is that the tree
  stopped refusing. A held diff that still applies is a held diff that was
  right.
- The clause's two cases went in here rather than in a fourth diff. The
  Handoff said they could not, and it was correct on the day it was written
  and stale by the time the build landed; reading it again rather than
  trusting it is what caught that.
- Both halves seen red one at a time. Taking out the seat check reddens the
  case, taking out the task check reddens it too, so neither half is riding
  on the other.

## Learned

- A pin's review state is worth exactly what it claimed. `kaal traces` reports
  the moved criteria region, says `review-needed`, exits 0, and `kaal runs`
  counts it against this task and not against the board. Fourteen walls green
  on a tree that is genuinely mid handoff. That is the first live use of the
  thing and this page is the case it was built for, which is a tidier ending
  than most.
- A Handoff written under a constraint outlives the constraint. Three of this
  page's bullets describe a tree that no longer exists, and only one of them
  said something a reader would act on. A held diff needs its Handoff read
  again before it lands, not just its criteria.
- The thing that unblocked this was not a rule about pins. It was a rule about
  where a truthful inconsistency is allowed to sit: the task, not the board.
  Every instance of this shape so far has been the same fix wearing different
  clothes, and naming that is probably worth a principle.

## Lacked

- Nothing marks a diff as held, or says what it is waiting on. This one lived
  in a branch name and in my memory of a conversation, and a week of that
  would have lost it.
- No wall reads a Handoff against the tree it describes. The criteria are
  pinned by sha and the prose beside them is not, so a Handoff can go stale
  silently while every wall stays green.

## Longed for

- The principle behind the three instances. The plans count, the proof owner
  and the pin are one shape: a seat's legitimate act leaves another seat's
  artefact in a state only that seat can fix. Two of the three now answer it
  by moving the cost off the board and onto the task. The third, the plans
  count, still answers it by making the path shared, which is the weakest
  answer of the three and the one the tree still runs on.

Feeds: analyse
Read: architect
