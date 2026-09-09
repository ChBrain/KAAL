# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-eighth use of the analyse skill, on
`requirements/a-trace-pins-what-it-read` (six criteria, six red tests),
9 September 2026.
Place: this repository

## Liked

- The asker guessed a mechanism and the tree's own history answered the part
  the guess left open. Of 48 tasks with both a requirement and a drawing, 47
  had the requirement edited after the drawing landed and 2 had the
  acceptance criteria change. That single run turned "use a sha" into "hash
  the criteria section, not the file", and it took one loop over git log.
- The two true positives were `push-v1` and `security-v1`, both amended in
  part by a later task, both keeping their criteria count while the text
  moved. The measurement did not only give a number, it gave the case the
  wall exists for.

## Learned

- A wall can be measured before it is specified. Running a proposed rule
  against the history of the tree it will guard says what its false report
  rate would have been, and 45 in 47 is not a tuning problem, it is a
  different design. I have written eleven walls in this league and never once
  asked what one of them would have said last week.
- The false reports were not carelessness, they were the workflow. A
  requirement's status flips to closed and its handoff is filled in after the
  drawing lands, every time. A rule that fires on the normal path is not
  strict, it is broken, and no amount of discipline from the people using it
  will help.
- A parser's limit chose a format. The frontmatter reader does one level of
  map, so a nested `{name, sha}` was not available and the pin joined the
  name as `<name>@<sha>`. That turned out better than the shape I would have
  picked freely: a list still separates by comma and reads as it looks.
- A test that runs a writer must run it on a copy. The fixture for `--write`
  is copied to a temporary directory first, or the test dirties the
  repository it is measuring and the second run measures the first.

## Lacked

- No step in the skill between "the asker named a mechanism" and writing the
  criteria that says to measure it. The runs section is for facts
  established by running something, and I have been using it for the state of
  the tree; nothing said the strongest fact available is often what a
  proposed rule would have done to the tree's past.
- Nothing about a criterion whose region is a property of a kind rather than
  of the artefact. The kind table gained a column and the requirement had to
  explain the idea in an assumption because no section is for it.

## Longed for

- A way to say in a requirement that a rule was measured and what it scored,
  so a later reader can tell a threshold that was chosen from one that was
  found. The number lives in What the runs said today, which is right, and it
  is not distinguishable there from a count of files.

Feeds: analyse
Read: test
