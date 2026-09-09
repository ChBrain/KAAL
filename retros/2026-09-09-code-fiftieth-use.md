# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fiftieth use of the code skill, on
`requirements/an-architect-names-its-principles` (six criteria, two seams:
the citation's grammar and the name resolved before the orphan return),
9 September 2026.
Place: this repository

## Liked

- The drawing had already fixed the hard part, so the wall rule was
  transcription: the rule's name, its place above the orphan return, one
  finding per unresolved name, and the three ways of naming nothing were all
  on the page. Five of six acceptance criteria went green before the module
  was touched at all.
- The board named the root cause. Five walls red and eleven closed tasks
  failing looked like a wide break; `kaal check skills` said one line, a
  depth rule on one link, and fixing that line turned three walls green at
  once. Reading the cheapest wall first was worth more than reading the
  longest output.

## Learned

- A drawing can fix where a thing lives without asking whether anything can
  point at it. Principles live at `references/principles/<name>.md` because
  the requirement and the drawing said so, and the skills wall forbids a
  markdown link with more than two path segments, so the skill cannot link
  into that directory at all. No link to a principle file itself could ever
  pass. The build named the path in prose; the drawing should have met this
  and did not.
- The depth rule counts a trailing slash as a segment, so
  `references/principles/` reads as three levels and `references/principles`
  as two. A directory therefore passes or fails on a character that changes
  nothing about where it is. That is a latent defect in a closed rule and it
  is worth a task rather than a workaround, which is why the build wrote
  prose instead of trimming the slash.
- The supersede the analyst named was not the only one. The requirement said
  the two goods moves out of the skill; it did not say that adding
  `Weighed against:` breaks a closed contract fixing the decision record at
  exactly five labels in order. The code skill's instruction to look for an
  unnamed supersede by running the closed tests the change touches found it,
  and it is the first time that instruction has earned its place in a run I
  did.
- I wrote the change class from memory and it was wrong. The handoff said
  "nothing a consumer notices moved" while `kaal class` said "tool moved,
  skills moved". The skill says to write what the tooling computed and never
  one you chose, and the reason is exactly this: a class from memory is a
  guess that reads like a measurement.

## Lacked

- Nothing in the skill about a wall whose findings are a symptom of one
  other wall. Eleven closed tasks failed for one link, and the order to read
  them in is not written anywhere: the cheapest wall that reads the thing
  you changed comes first.
- No word for a build that must edit a superseded task's tests. The rule is
  that a seat never edits another seat's tests, and a declared supersede is
  the exception; the skill says to find the supersede and does not say what
  to do once found.

## Longed for

- A way to run the closed tests a change touches, before the whole board.
  The supersede was found by running everything, which took the full board
  and gave eleven failures where one mattered.

Feeds: code
Read: test
