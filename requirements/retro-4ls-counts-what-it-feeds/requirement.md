---
traces:
  parent: push-v1@f3c24644903fd4962783c910a1904266a44225da7294e4de764caa07d55d5b7c
  supersedes: nothing
---

# Requirement: retro-4ls-counts-what-it-feeds

## Goal

A user carrying `retro-4ls` wants the skill itself to answer how many
unconsumed retros feed a named skill, so the skill can complete its rule of
ten after it is copied away from KAAL and the league's end-to-end answer does
not become a second meaning of the same count.

## What the runs said

- `skills/retro-4ls/moves.json` names `check whether the skill has ten
unconsumed retros`, leaves it at rung `nlp`, and gives it no script or test.
  The skill's only executable, `scripts/name.mjs`, finds the next filing
  ordinal from filenames; it does not read `Feeds:`, `Read:` or requirements.
- `node bin/kaal.mjs retros` delegates to `bin/lib/retros.mjs`. That module
  reads top-level pages under `retros/`, excludes a page once any
  `requirements/*/requirement.md` names its filename, accepts plain or
  backticked `Feeds:` names with an optional final period, and reports
  `Read:` separately.
- `node bin/kaal.mjs retros | rg '^manage:'` at the start of this work on 14
  September 2026 printed `manage: 0 unconsumed` and `manage: 0 read`.
  While the branch was in flight, PR #304 added
  `2026-09-14-manage-first-use.md`; the latest `release` now prints one.
  Zero is therefore the observed state this ask named, held on fixed ground
  by the acceptance fixture, and not an invariant about a moving retro stack.
- The allocation is older authority, not an accident: `push-v1` criterion 4
  requires `kaal retros`, its assumptions call the retro count Kaal's move,
  and its drawing fixes seam 5 as `retros/` and `requirements/` into
  `bin/lib/retros.mjs`. That allocation may need to be superseded where it
  makes the engine, rather than the skill, own the counting algorithm.

## Assumptions

- The standalone surface follows the skill's existing executable convention:
  the move's declared Node script takes a skill name and an optional repository
  root, in that order, and reports `<skill>: <n> unconsumed` on stdout. The
  root defaults to the current directory.
- A filename is consumed by reference, not by status or location. Any
  requirement page beneath `requirements/<task>/` naming the filename is the
  observable already used by the end-to-end answer.
- The end-to-end command remains a consumer-visible surface. This task moves
  ownership of the algorithm; it does not withdraw `kaal retros` or its read
  report.

## Constraints

- The executable and its cases travel inside `skills/retro-4ls/`; a copied
  skill must not import, execute or otherwise require `bin/**`.
- Counting is deterministic, offline and read-only. Pointing it at a root
  changes no retro, requirement or skill.
- `Read:` is not `Feeds:`. It never contributes to the rule of ten.
- This requirement does not choose how `kaal retros` reaches the skill-owned
  answer. That integration seam belongs to the architect.
- The accepted `Feeds:` grammar remains compatible: the skill name may be
  plain or backticked, and either form may carry one final period.

## Acceptance criteria

1. A copy containing only `retro-4ls` can run the move declared as its
   unconsumed-retro counter for a named skill and obtain that skill's count;
   no file under `bin/**` is present or needed.
2. The standalone counter accepts a repository root after the named skill,
   answers from that root, and does not require KAAL or a KAAL configuration
   to be installed there.
3. A top-level markdown page directly under `retros/` whose `Feeds:` line
   names the requested skill contributes one to its unconsumed count.
4. A page below `retros/archive/` contributes nothing to the unconsumed
   count, even when its `Feeds:` line names the requested skill.
5. A top-level retro contributes nothing once a
   `requirements/<task>/requirement.md` names that retro's filename.
6. All four accepted `Feeds:` forms contribute equally: a plain name, a
   backticked name, and either one with an optional final period.
7. A skill named only on `Read:` does not gain an unconsumed retro; the retro
   continues to count for the different skill named on `Feeds:`.
8. On the same repository root and named skill, the standalone skill answer
   and `kaal retros` report the same unconsumed count, so there is one counting
   algorithm rather than two answers that can drift.
9. `retro-4ls` owns the executable move and its proof: its move record stands
   at `script`, names a script and a test within the skill directory, and that
   declared test passes.
10. On fixed ground preserving the repository state this ask observed, both
    surfaces report `manage: 0 unconsumed`; until the skill declares and
    carries its counter, this criterion remains red even though the
    end-to-end command already knows the number.

## Open questions

- Does `kaal retros` call the skill script, import a skill-owned reader, or
  share a smaller stamped source? The answers have different packaging seams;
  the architect must choose one that makes criterion 8 structural.
- Does the older `push-v1` authority get superseded outright, or does its seam
  remain the command-facing half while this requirement supersedes only
  ownership of the algorithm in `bin/lib/retros.mjs`?
- Should a malformed `Feeds:` line be a finding or simply not count? The
  current engine ignores it and this ask does not change that behaviour.

## Handoff

- Task: retro-4ls-counts-what-it-feeds
- Criteria: 10; tests: 10 (equal)
- Red run: `node --test --test-timeout=60000
requirements/retro-4ls-counts-what-it-feeds/acceptance.test.mjs`, 14
  September 2026, all 10 failing. Every case reaches the skill's declared
  counting move and reports `the unconsumed-retro counter is at nlp, not
script`. No case imports the existing engine implementation. Each case
  also fails when selected and run alone.
- Tests: `requirements/retro-4ls-counts-what-it-feeds/acceptance.test.mjs`,
  with fixed roots under `fixtures/`
- Stand-in green: all 10 together and each alone against a disposable copied
  skill that declared a counter and its passing test, then discarded
- Open questions: 3, listed above
- Blocked on: nothing
- Unblocks: a copied `retro-4ls` completing its own feed-the-loop procedure
- Supersedes: potentially the `push-v1` allocation of the counting algorithm
  to `bin/lib/retros.mjs`; the architect must resolve the integration seam
  and its trace without withdrawing the command promised there
- Rebase review: `a-seat-claims-its-work-before-doing-it` is
  reviewed-no-impact. It changes the pull request cycle around this Analyst
  work, but no premise, constraint, trace or handoff statement about the
  missing counter. Its normalized lifecycle evidence is not a backlog-claim
  representation, and this requirement introduces none.
- People: none
