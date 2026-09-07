# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the thirty-eighth use of the code skill, on
`each-skill-carries-its-own-version` (a rule, six skills, seven fixtures and
two generated files), 7 September 2026.
Place: this repository

## Liked

- A closed contract went red and the fix was in my code, not in their test.
  `standard-v1` asserts one finding per malformed field, and my rule made
  `metadata-flat` yield two: a metadata that is a string, and a version that
  cannot be read out of one. The second was noise about the first. Asking
  for a version only when there is a metadata to read it from kept their
  claim true, made mine honest, and needed no supersede.
- The drawing named the blast radius before I met it. A new rule reaches
  into every fixture written for an older one, and seven of them owed a
  version. Knowing that in advance turned a surprise into a list.

## Learned

- A rule gives an existing key a meaning it did not have.
  `standard-v1/fixtures/fields/optional-ok` already carried
  `version: "1"` as an example of a well formed metadata string. It was
  correct when it was written and wrong the moment `version` stopped being
  an arbitrary name. The fixture owed the fix and nothing had changed in it.
- Which fixtures owe the fix is decided by what a test asserts, not by
  taste. Seven fixtures whose tests count findings or expect none needed a
  version; the rest use `some` and did not, and several are pinned by an
  eval record's sha and must not move at all. Reaching for all thirty-five
  would have broken records that measure bytes.
- The one eval record in the tree is stale and was stale before this change:
  the recorded skill sha is three analyst runs old. The ledger is green
  because every move sits at candidate and nothing claims a rung on that
  evidence, which is the ledger working rather than the ledger asleep. I
  only know that because I compared the sha on both sides.

## Lacked

- Nothing tells a developer how far to walk a new rule through the tree.
  AGENTS.md says a fixture that breaks a new contract owes the fix and does
  not say that a fixture pinned by a record's sha owes nothing, because
  moving it breaks the record instead. Both rules are right and they meet.
- The generated runners went stale silently until the board said so. That is
  the board working, and a developer changing a skill's text has no way to
  know in advance which generated files read it.

## Longed for

- A line in the code skill about a new rule's reach: the fixtures a test
  counts owe the fix, the fixtures a record's sha pins do not, and the
  generated files are regenerated with the repository's own tooling.

Feeds: code
