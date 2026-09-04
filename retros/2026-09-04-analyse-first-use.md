# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the first real use of the analyse skill, on the ask "analyse the
setup of the skills in khai", 4 September 2026.

## Liked

- The pair held: an ask with no stated outcome still became a goal that can
  miss, seven criteria that can fail, and seven tests that were red for the
  right reason (nothing built yet).
- Counting the ask first surfaced that it wanted a report and not a change,
  and that went into an assumption the asker could deny rather than a
  decision made in silence.
- The context reading found two things nobody had measured: no consumer of
  the built skills exists in khai, and the skills documentation's status
  section is stale.

## Learned

- A proof seen red is not yet a proof. A throwaway answer that satisfied the
  criteria turned three tests red for the wrong reason: a line count off by
  one, a word match where a cell match was meant, a path check that read a
  line it did not own. Seeing the tests pass on a known-good answer is part of
  writing them.
- A report-shaped deliverable is testable at its surface: the file plus the
  tree it describes. That was not obvious before the run.
- Inferred: the skill's own text is enough for a model to produce the pair
  without further prompting; the run followed it step by step.

## Lacked

- A step that proves the proof can pass, not only that it fails.
- A rule for where the output lands when the consumer repository refuses the
  branch or has no requirements lane; the run improvised a home and the asker
  did not want it.
- A fixture runner: the counts (criteria equal tests, links one level deep,
  no dash) were checked by hand.

## Longed for

- The league's walls as code, so the analyst runs them instead of reading
  for them.
- A retro that feeds the next requirement by design, so a run like this one
  improves the skill without a separate decision to do so.

Feeds: `analyse`.
