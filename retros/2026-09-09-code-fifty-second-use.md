# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-second use of the code skill, on
`requirements/a-trace-pins-what-it-read` (four seams, six criteria, 59
artefacts pinned), 9 September 2026.
Place: this repository

## Liked

- The build was mostly transcription because the stand-in had already been
  written and isolated during the drawing. Four contract tests green on the
  first run, and the whole change was the module, a flag, a case, a page and
  two templates.
- The loop was shown rather than claimed. Adding one sentence to
  `applies-here`'s criteria and running the wall printed two findings, the
  drawing that answers it and the requirement that supersedes it, and the
  tree was restored from a copy afterwards. A run in the handoff is worth
  more than a paragraph saying it would work.

## Learned

- A grammar change is a supersede of everything that read the old grammar,
  and the analyst named the change without naming the readers. Criterion 1
  said a value is now `<name>` or `<name>@<sha>`; what nobody said is that a
  closed test in the previous task compared a trace's names to prose and
  would now compare a sha to prose. Found by running the closed tests the
  change touches, which is the second run in three that has found one.
- The class was computed after the last edit this time and it was right. Two
  runs ago I wrote it from memory and one run ago from a measurement taken
  too early; the rule that works is to run it as the last thing before the
  commit.
- Regenerating the runner pages fixed four red walls at once. The templates
  are inside the pages a runner generates, so a change to either template
  invalidates every skill's pages, not only the skill whose template it is.
  That is wider than the sweep I expected and the skill's sweep clause does
  not say it.

## Lacked

- Nothing in the skill about proving a loop end to end. The handoff has
  `Unproven:` for what a run cannot establish and no place for what a run
  did establish beyond the tests, which here was the whole point of the
  task.
- No word for a change that alters a value's grammar. The sweep clause names
  fixtures a test counts, fixtures a sha pins, and generated files; a grammar
  every reader parses is a fourth kind and the readers are found by running
  them, never by reading a list.

## Longed for

- A way to ask which closed tests read a given file or export, so a grammar
  change can name its readers before the board does. `kaal traces` now
  answers that question for artefacts and nothing answers it for code.

Feeds: code
Read: test
