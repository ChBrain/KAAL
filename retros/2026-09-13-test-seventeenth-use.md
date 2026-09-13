# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventeenth use of the test skill, recording what the refusal
that names its owner proved, 13 September 2026.
Place: this repository

## Liked

- One file, and the diff is the record. The last use of this skill paid a
  full suite run and then reverted sixty-eight files whose only change was a
  date over an unmoved sha; this one ran the suite it owed, read the counts
  and the sha off that run, and wrote the page. Same evidence, same act, and
  nothing to revert.
- Item 5 closed in four pull requests in four lanes with no supersede. Both
  times a closed task's proof had something to say it was read rather than
  rewritten, which is now twice in a row across two tasks.

## Learned

- **The command is a convenience and the act is the seat's.** `runs --write`
  is how a record usually gets written and it is not what a record is: the
  page says a suite passed against a sha on a date, and a tester who ran that
  suite has all three. Reaching for the command out of habit is what made the
  last diff sixty-nine files wide. The previous retro asked for a write that
  leaves an unmoved sha alone; doing it by hand is the same answer with
  nothing built.
- What is lost by hand is the cross check. `--write` runs every suite, so it
  would have caught a suite that went red somewhere else while this one was
  being proved. The board does that too, a few minutes later and on the whole
  tree, so the loss is real and small and this diff names it rather than
  pretending the two are identical.

## Lacked

- A way to record one task. Still. Both retros on this skill today asked for
  it and the work around it is now two lines rather than sixty-eight, which
  makes it less likely anyone builds the thing.

## Longed for

- A record that says which run wrote it. This page says a suite passed on a
  date and nothing about whether that was a full board, a targeted run, or a
  person at a terminal, and the three are worth telling apart when a record
  is the only evidence a task was delivered.

Feeds: test
Read: code
