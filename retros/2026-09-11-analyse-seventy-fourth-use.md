# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy fourth use of the analyse skill, reading the four
`supersedes` pins that shipping the method moved, 11 September 2026.
Place: this repository

## Liked

- One of four moved, and the other three cleared in a sentence each. The
  question a supersede pin asks turns out to be narrow and answerable: this
  task superseded a clause of that one, and a clause of that one moved, so
  are they the same clause. Three times they plainly were not.
- The one that moved was a sentence claiming something that had stopped being
  true. `the-engine-installs-by-name` says of the task it supersedes that
  "its criterion, that the install brings nothing with it, is unchanged", and
  the install now brings the method. Nothing about the supersede itself moved;
  the prose beside it had gone stale, and only a reader comparing two pages
  would ever have seen it.
- Seven readings across two seats and two diffs, and the counter went from
  seven `review-needed` to zero without a single one being cleared by a tool.

## Learned

- A `supersedes` pin guards prose and not a claim. What it protects is a
  sentence in a Handoff explaining which clause moved and why, and that
  sentence can rot while every criterion around it stays true. No wall reads
  prose against the tree; the pin is the only thing that even asks.
- So the pin is doing more work than the task that built it claimed. It was
  specified to stop a tool clearing a reading nobody did. What it actually
  caught here is a page describing another page inaccurately, which is a
  different and quieter failure.
- The four states earn their separation only when a batch disagrees. Two
  batches today, seven readings, three outcomes: two drawings `updated`, one
  `reviewed-no-impact`, one supersede `updated`, three
  `reviewed-no-impact`. A tool that collapsed the last two into cleared would
  have lost which of the seven anybody actually had to change.

## Lacked

- Nothing pins prose to the thing it describes. The `supersedes` trace pins a
  criteria region, and the sentence that rotted is in a Handoff that pins
  nothing. It was caught because the criteria moved, not because the sentence
  did, so a sentence that goes stale on its own is invisible.
- No way to record that seven readings were one sitting against one change.
  Seven blocks, seven reasons, two diffs, and the fact that they answer one
  question is only in a plan and two commit messages.

## Longed for

- A supersede that names a criterion, fourth record in two days asking. Every
  one of these four readings was the same act: find which clause this
  supersede was about, find which clause moved, compare. Three of four were
  no-impact for the same structural reason, and a machine could have said so
  if the trace carried the criterion.
- The manage skill, tenth record. The narrow question today: which of the
  things I am about to move is described in prose somewhere else.

Feeds: analyse
Read: architect
