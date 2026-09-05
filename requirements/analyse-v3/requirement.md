# Requirement: analyse-v3

_Written in analyse mode. Ask, from a retro that names a defect: two
hand-made evals of the analyse skill on `json-flag`, in two runtimes,
both flagged on different items, and both readings were right. One model
wrote the format into the goal and left its test unnumbered; the other
promised the red run instead of recording it and grew a filter the ask
never named. Five of seven met in both. The misses are the text's: each
is a sentence the skill does not say._

## Goal

Whoever uses the analyse skill wants a model reading it to keep the format
out of the goal, to number each test to its criterion by name, and to hand
off only a red run it has actually run; they will know when the skill's
text says each of the three in the section where a writer looks, the
template says the numbering too, and the retro that found them is
archived.

## Assumptions

- The three misses are text misses: a model that followed the skill this
  far would have followed one more sentence in the same place.
- A defect retro consumes itself: this requirement names the one retro,
  which moves to `retros/archive/`; the other unconsumed analyse retros
  stay for the next stack.
- The `json-flag` fixture stays as it is; it found the gaps and a rerun
  after this change is the test of the change.

## Constraints

- What the readings liked stays: the pair, the three Handoff lines, the
  timeout, the format surfaced as an assumption or a question.
- The skill stays under its line budget and the standard's shape (rules).
- No vendor, no dash, nothing that names a runtime (rules).

## Acceptance criteria

1. The Goal rule in section 2 names the output's format as a how that
   belongs in an assumption or an open question and never in the goal.
2. The one-criterion-one-test rule in section 3 says a test's name begins
   with its criterion's number, and the template's test shape says the
   same.
3. The red-run rule in section 3 says a red run reported as not yet
   recorded is not a red run, and a proof that has not been run is not
   handed off.
4. `retros/archive/2026-09-05-analyse-sixteenth-use.md` exists and no
   file of that name remains in `retros/`.

## Open questions

- Should the fixture's `expect.md` gain an item on numbering by name, or
  is "numbered to match" enough once the skill says how? (v1: leave the
  fixture; the rerun decides.)

## Retros consumed

`retros/archive/2026-09-05-analyse-sixteenth-use.md`.

## Handoff

- Task: analyse-v3
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=60000 requirements/analyse-v3/acceptance.test.mjs`;
  three red, criterion 4 green by this change (the archive is the
  analyst's act); no stand-in apart from the build itself, which is the
  three sentences
- Tests: `acceptance.test.mjs`, beside this file
- Open questions: 1, listed above
- Blocked on: nothing
- Supersedes: nothing
- Status: closed
