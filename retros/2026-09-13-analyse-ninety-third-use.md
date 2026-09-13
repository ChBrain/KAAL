# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the ninety-third use of the analyse skill, stating that a seat
carries its own backlog, 13 September 2026.
Place: this repository

## Liked

- The stand-in earned its keep twice over. It found that the shape the asker
  named cannot hold what the asker asked for, and it found that a criterion
  about grouping was written against a layout rather than a claim. Neither
  was visible in the page and both were cheap on a throwaway.
- Two criteria came out of running rather than reading. That one of the six
  owned trees is published is a fact about `package.json` and nobody would
  have thought to look; it turns into a criterion because a page in `bin/`
  reaches every consumer of the tool and no wall says a word.

## Learned

- **The asker's shape and the asker's precedent were two different shapes.**
  The item says a backlog entry is `flat and keyed by task, the shape the
reviews: block already proved`. Those halves disagree: the parser returns one
  value per key and `reviews:` is keyed `<kind>/<name>`, compound on purpose.
  Keyed by task alone, a page carrying two blocks on one task reports one and
  loses the other without a word. The precedent is the half that can hold
  what the criteria ask for, and reading it closely was the whole fix.
- A criterion about grouping is a criterion about a claim and not a layout.
  The first version matched a regular expression against the start of a line,
  which failed on an answer that grouped perfectly well. What grouping means
  is that the seat is said once over the tasks it owes, and the honest test
  is that a line names the seat and no task.
- A vocabulary that lives only in prose is a list nothing can check. The kinds
  a block may name started as words from a table in the plan; they are
  declared beside the seats now, and the table in `AGENTS.md` is held to the
  same list, which is exactly what `a-diff-carries-one-seat` already does for
  seats and lanes.

## Lacked

- Any way to know what a published package carries without packing it. The
  developer's tree ships and five others do not, and the only thing that says
  so is `npm pack --dry-run`.

## Longed for

- A parser that says when it drops a key. Two blocks on one task became one
  silently, which is the same failure the frontmatter module's own comment
  says is the worst of the three things a parser can do.

Feeds: analyse
Read: code
