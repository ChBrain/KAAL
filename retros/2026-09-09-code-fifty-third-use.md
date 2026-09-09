# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-third use of the code skill, on
`requirements/a-tree-has-one-root` (five seams, seven criteria, a trunk and a
third place), 9 September 2026.
Place: this repository

## Liked

- The trunk was written by the asker and carried by the build. Four of the
  five rules ask about it and none of them is a special case, because it is a
  place like the other two.
- The drawing had already isolated the stand-in, so the module needed no
  thinking and the build's whole cost was elsewhere: in the fixtures, which
  is where a new place is expensive and where the drawing said nothing.

## Learned

- Folding the shape rules into `checkTraces` changed what every caller of
  that function means by a finding, and three closed contracts call it. Four
  tests went red at once, which read as a broken build and was a design
  error in one line. The command calls the two in turn now. The drawing said
  the graph is read four ways and never said by whom, and that omission is
  what let the wrong reading through.
- A new place is a sweep, and it is the widest kind. Sixteen fixture roots
  across three tasks are trees the command runs on, and every one of them
  owed a trunk the moment `kaal/` became a place. Two fixture drawings also
  predated the rule that a drawing answers exactly one requirement. The code
  skill names three kinds of sweep and a fixture that is a whole tree is a
  fourth.
- A fixture can be made wrong by a rule it never met. This task's own
  acceptance fixtures had a root per tree, which was right until the trunk
  existed and made each of them a second root. Nobody could have written the
  `- Root because:` line earlier, and the fix is not a correction of the
  fixture but the fixture catching up with a criterion that moved twice.
- The class was computed last again and it was right again. Three runs, three
  ways of getting it wrong before the rule stuck: from memory, from a
  measurement taken too early, and now from running it as the last thing.

## Lacked

- Nothing in the skill about where a new export is called from. The drawing
  fixes what a function returns and the build decides who calls it, and when
  the answer is "not the function three closed contracts already call" that
  is a design decision made in the build with no place to record it but a
  handoff section I had to invent.
- No word for a fixture that is a tree. The sweep clause counts files; these
  are roots, and the cost of adding a place is measured in roots.

## Longed for

- A command that lists the fixture roots a given wall runs on. Sixteen was a
  number I found by reddening tests one at a time, and it is the number that
  says what a new place costs.

Feeds: code
Read: test
