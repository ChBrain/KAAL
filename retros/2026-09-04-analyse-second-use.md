# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the second real use of the analyse skill, on the ask "analyse for
push: human to NLP, NLP to Skill, Skill to Script; also hooks, CI",
4 September 2026.

## Liked

- Counting the ask split it cleanly into two tasks that fail independently,
  and the second was written in the same sitting instead of deferred.
- The stand-in green check, added after the first use, earned its place at
  once: it caught a workflow-step regex that did not allow a list marker.
- The bad-input fixtures (a vendor-named skill, a ledger claiming a rung with
  no test) made the script criteria concrete without any script existing.

## Learned

- An acceptance test that spawns the one command from inside that command
  recurses; a wall about the runner has to read the runner's declaration (the
  script line, the globs) rather than run it from within.
- The stand-in for a task about scripts is most of the build; that is fine,
  because it is discarded, but it means the developer's seat will look like a
  repeat of the analyst's scratch work.
- Inferred: the ledger's human rung had no entries because nobody wrote them;
  the design named the human's three gates and no skill recorded them.

## Lacked

- A stated shape for an eval record; the requirement had to invent frontmatter
  (`model`, `verdict`) as an assumption rather than read it from a rule.
- A way for a test to inject a failing command into the hook without the hook
  knowing about the test (`KAAL_TEST_COMMAND` is a test's fingerprint in
  production code).

## Longed for

- The scripts themselves, so that counts, dashes and rungs stop being checked
  by reading.
- The two-model eval run, which is the only rung climb no script can make.

Feeds: `analyse`.
