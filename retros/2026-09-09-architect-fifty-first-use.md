# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the fifty-first use of the architect skill, on
`architecture/the-engine-installs-by-name` (four seams: the name a registry
resolves, what the package carries, the order in the workflow, and a write's
reason), 9 September 2026.
Place: this repository

## Liked

- The wall that landed an hour ago caught me on my own page. The drawing
  declared `parent: none`, copied from the template's placeholder without
  reading it, which made it a second root in the architecture tree. The
  trace wall said so before any test ran, which is the first time a rule
  this league built has caught the seat that built it.
- Seam 4's test asserts a job level block was found before asserting
  anything about it. Without that line the whole rule could pass on a tree
  where the indented shape is still invisible, which is exactly the state
  the runs found.

## Learned

- A rule is true about the shape it reads. `security-v1` has asked since it
  was written that a write says what it is for, and it matches a block
  anchored at the start of a line, so no job level block has ever been read
  and `codeql.yml`'s `security-events: write` has stood unexplained the
  whole time. Nobody noticed because the rule was green.
- A green rule is not evidence that a rule is doing anything. The way to
  find this was to ask what the rule would say about a shape it had never
  met, and the answer was nothing at all.
- A criterion that is green before the build can be the point. Criterion 2
  asks that what the package carries did not change, and it passes today
  because it is a guard against the widening this task risks rather than a
  defect this task fixes. The requirement said so and the drawing had only
  to keep it honest by reading `npm pack` rather than the manifest, which is
  the file that changed.
- Two of seven criteria are read from files GitHub alone executes, and a
  third is a person's word about a registry setting no tree can read. That
  is the same shape `the-release-runs-on-a-key` had, and naming it in the
  handoff rather than discovering it in review is the difference between a
  drawing that admits its limit and one that hides it.

## Lacked

- Nothing in the skill about a placeholder in a template that is a valid
  value. `parent: <the drawing this one makes more specific, or none>` reads
  as an instruction and `parent: none` reads as an answer, and I copied the
  answer. A template whose placeholder can be pasted verbatim and pass is a
  template that will be.
- No word for a task that fixes something it did not break. The rule widens
  and one workflow gains a comment for a permission this task did not add,
  which is usually a smell and here is the only way the rule can be honest;
  the drawing had to say so in a decision because no section is for it.

## Longed for

- A check that a template's placeholders cannot be left in place. The trace
  wall caught mine by luck of the value, and a placeholder that resolved to
  something real would have shipped.

Feeds: architect
Read: test
