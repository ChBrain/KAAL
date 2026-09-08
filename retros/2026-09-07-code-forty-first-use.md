# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the forty-first use of the code skill, building
`a-requirement-shows-its-work` against its five acceptance tests,
7 September 2026.
Place: this repository

## Liked

- The build found a defect in its own specification, and the specification
  was the honest place to fix it. Criterion 5 asserted that `kaal retros`
  counts zero unconsumed analyse retros, which was true the hour it was
  written and false two retros later. The fix was not to make the tree fit
  the criterion but to say what the criterion was actually about: the twelve
  this run consumed, and a tool count read from the same tree it counts.
- Seven isolations, seven single reds. Every one of the five tests falls on
  its own thing and on nothing else, which is the first run this week where
  the isolation found nothing left to fix.

- The board caught the consequence I did not think of and named the fix in
  the same line. Editing the analyse skill's text made two generated runner
  pages stale, which turned four closed contracts red across three walls,
  and `fix: regenerate with kaal runner <skill> <fixture> --write` was the
  whole diagnosis. A wall that says what to do costs one command instead of
  one investigation.

## Learned

- `git checkout -- <path>` does not undo an isolation, it undoes everything
  uncommitted under that path. Seven isolations restored that way threw the
  whole build away, silently, and the only reason it was caught is that the
  restored run was still red. An isolation restores from a copy of the file
  as it stands, or from a commit, and never from the index of a build that
  has not landed.
- The rule that caught the criterion was already in this skill's own
  reading. "On fixed ground" forbids reading the league's own tree for a
  state a later change will move, and criterion 5's test did exactly that.
  A rule written down is not a rule applied, and the seat that wrote it is
  no safer than any other.
- A sentence-scoped assertion moves the words, not the meaning. Test 2 reads
  the sentences of the proof's rules that mention a fixture, so the cost had
  to be named in a sentence that also names the fixture. Rewriting it that
  way made the rule read better, which is the good case; the bad case is the
  one where the sentence bends to the pattern and the rule stops being true.

## Lacked

- Nothing stops an acceptance test from reading a state the tree will move,
  though the skill forbids it in prose. This is the second such test this
  week and the other requirement in flight makes it a rule for drawings. A
  wall would find it; nothing does today.
- The analyst has produced two requirements and the builder has closed one,
  so a spec can sit open with red tests and nothing in the board says how
  long that is acceptable or how many may be open at once.

## Longed for

- A restore that is scoped to one isolation: something that takes a copy
  before the first break and puts it back after each, so an isolation can
  never cost the build it is testing.

Feeds: code
