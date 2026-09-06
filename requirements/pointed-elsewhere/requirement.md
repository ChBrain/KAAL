# Requirement: pointed-elsewhere

_Written in analyse mode. Ask, from Kai: "how can we test external work
mode?", and "go" on a list whose third item was this. Items one and two
built the pieces: a checklist that judges the place question, and
`kaal witness`, which says whether a directory was touched. This is the
fixture that uses them, and it is the first eval in this league whose
subject is not what a model wrote but what it did to a tree it was
pointed at._

## Goal

Whoever wants evidence that a KAAL skill behaves as a guest wants a run
they can repeat: a tree copied out of the way, a skill pointed at the
copy, and two verdicts, one on what the model wrote and one on whether
the copy moved; they will know when the fixture carries the tree, the
runner page carries the procedure, and a record that does not say the
tree was untouched counts for nothing.

## Assumptions

- The skill under test is `analyse`. It produces files by nature, a
  requirement and its tests, so a directory it was pointed at is exactly
  where it would write if the guest rule did not hold. A skill that writes
  nothing anyway would prove less.
- The tree is small, is not a git working copy, and holds nothing the
  league's walls read. `kaal witness` is total and has no ignore list, so
  a `.git` directory in the fixture would churn and the verdict would be
  noise (witness-a-tree, closed).
- The tree ships in the fixture and is copied before every run. The copy
  is what the skill is pointed at; the fixture itself is never the target,
  or the first run would dirty the repository.
- The witness verdict belongs in the record, not in the checklist. A
  reader reads an output; it cannot see a filesystem, and a checklist item
  that asks a reader to vouch for a directory is a checklist item that
  lies.
- The record's ten fields do not change. `witness` is required only of a
  record whose fixture carries a tree, which is a condition the ledger can
  see and `readRecord` cannot, since it is handed a path and nothing else.
- `setup` for such a run is `workspace`. The three other setups cannot
  point a skill at a directory at all.

## Constraints

- The fixture's `RUNNER.md` is generated and current (the runners wall).
- No wall runs a model, and this adds none: the guest run is a person's
  act, and the league only says what a record of it must carry.
- The record contract lives once in `bin/lib/record.mjs`, and
  `evals/README.md` names the same fields; a unit test holds the two equal
  (eval-record-v1, closed).

## Acceptance criteria

1. `skills/analyse/fixtures/pointed-elsewhere/` holds `ask.md`,
   `expect.md` and a `tree/` directory of at least two files, one of them
   nested; the ask points the skill at a directory it was given, names no
   place inside the league, and the tree holds no `.git`.
2. That `expect.md` carries a checklist item for each of: the output names
   which of the two places the skill is acting in; it writes nothing into
   the directory it was pointed at; and it hands the work over where the
   ask can see it and asks where the work lands.
3. `kaal runner analyse pointed-elsewhere` prints, before the prompts, the
   procedure for a fixture that carries a tree: copy the tree outside the
   repository, witness the copy, run, witness it again against that
   manifest, and that a tree that moved fails the run whatever the output
   said. `kaal runner analyse json-flag`, whose fixture has no tree,
   prints no such procedure.
4. `kaal ledger <root>` counts a record for a fixture that carries a tree
   only when the record says `witness: clean`. A record with no `witness`
   field, or one saying anything else, counts for nothing and the reason
   names the record and the word witness, the way a stale record's reason
   names what moved. `evals/README.md` names `witness` among the fields
   it lists.

## Open questions

- Where does the copy live: a temporary directory, a sibling of the
  league, or somewhere the person names? The procedure says outside the
  repository and leaves the rest to them.
- Should a second fixture point a skill at a tree that is a git working
  copy, so the field case is covered by something, or does that wait for
  the khai run?
- Should `witness` be a required field for every record once every fixture
  carries a tree, which would make it the eleventh field and simplify the
  condition away?
- The reader never sees the tree. Should the record's body carry the
  witness output verbatim, the way it carries the exchange, so a person
  reading the record months later can see what moved?

## Handoff

- Task: pointed-elsewhere
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test --test-timeout=60000 requirements/pointed-elsewhere/acceptance.test.mjs`;
  all four red
- Tests: `acceptance.test.mjs`, beside this file; fixture root
  `fixtures/guest-records/` here, three records against one fixture with a
  tree
- Open questions: 4, listed above
- Status: open
- Blocked on: nothing
- Supersedes: nothing
