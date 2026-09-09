---
traces:
  supersedes: nothing
---

# Requirement: a-task-names-its-people

_Written in analyse mode. Ask, from Kai: data protection (he names the
regulation, GDPR) "is a standing requirement, belongs, somehow, to
analyse/analyst in KAAL", with a design and "arguably the full KAAL sequence
so future KAAL goes structured into it". The occasion was a guest reading of
a consumer's pull request on 8 September: a customer file carrying a
person's name, email and phone number; a handover file carrying another
engagement's real name; a rendered document committed beside its source; and
no seat with a word for any of it. Standing means every task answers the
question, not only the ones somebody remembers to ask it of._

_Amended 8 September 2026, after Kai read the first version: "I am Kai. KAAL
is Kais Artificial Agent League. KHAI is Kai Hacks AI. So mentioning Kai is
fine, its mine. Mentioning others is a different discussion." That answer
adds criteria 8 and 9. Nothing in the first seven changes._

## Goal

Whoever asks for a task wants every requirement to say whether the task
touches data about a person and, where it does, what data, for what purpose,
where its record lives, and how it is erased, so that a tree never becomes
the place a person's data lives; they will know when the board refuses a
requirement that does not answer, and when the seats say what the answer
must contain and what a tree may hold.

## What the runs said

- `node --test` on the seven tests against the unchanged tree: seven red,
  each for its own reason, read one at a time. The analyse, test and code
  skills carry none of the phrases; the template's handoff has no
  `- People:` line; `kaal acceptance` on a closed fixture with no such line
  exits 0; the surface page's `acceptance` section does not name it; and
  `find . -name requirement.md` counts seventy-three files outside the
  `no-people` fixture, none carrying the line.
- A stand-in in a scratch clone, with the sentences, the line in every
  requirement file and a reader in the wall: seven green, and
  `kaal gates` green on every wall but acceptance, which read this task as
  open and all green and said to close it. The board found what the plan
  had not: the closed contract `analyse-v2` fixes the handoff's line order
  and a stamped fixture under `architecture/`, the closed contract
  `status-v2` fixes that an orphan drawing reads `FAIL no status`, and the
  runner pages of the three skills go stale when their text moves.
- `kaal acceptance` prints its refusals as one line per requirement in the
  form `FAIL no status: write ... in the Handoff`, read from the tree, which
  is the form criterion 3 keeps.

## Assumptions

- The league names no law. "Data about a person" is the league's phrase,
  and it covers what the regulation where a consumer works calls personal
  data; the asker's word appears in this opening and nowhere in a skill.
- Standing means one line in every requirement's handoff, `- People:`, read
  by the acceptance wall the way `- Status:` is read today. `none` is an
  answer. Anything else names the data, the system of record it is resolved
  from by identifier, and how it is erased. The wall judges that the line is
  there and non-empty; what it says is meaning, and meaning is not a wall.
- The rule belongs to three seats, each carrying its own words, because a
  skill is self-contained and there is no shared text between skills: the
  analyst asks the question, the tester names the proof that cannot be a
  wall, the developer keeps the tree clean. The architect and the operator
  read the handoff and the drawing and need no new sentence of their own.
- What a tree may hold: identifiers, never the person. A person is resolved
  from the system of record at use, by identifier; a local stand-in for
  working without that system is ignored by version control; a built
  artefact that carries a person is never committed.
- Whose presence is not the question. A record that names the person who
  wrote it, or who gave a key, is evidence of authorship or of the key and
  is not the data this rule keeps out of a tree. The league's own records
  name their author on thirty-five requirement pages, in fourteen retros
  and twice in the v0.0.1 release record, once as the person who gave the
  key. Read without this, "a tree holds identifiers, never the person"
  instructs a seat to delete `- Key: Kai, 7 September 2026, "cut it"`,
  which is the only evidence that release had a key at all, and the seat
  doing it would believe it was complying. The person this rule is about is
  the one who did not choose to be in the tree.
- The rule as first written is preventive and the occasion was remedial. It
  says how a tree stays clean; the pull request that prompted it was already
  carrying a customer's name, email and telephone number, and another
  engagement's real name. A seat meets that tree, and the first version
  gives it no word for what to do. The guest paragraph the five working
  skills already carry is where it belongs, because it is the paragraph
  about reading a tree that is not the league's, and it already sorts what
  a guest finds into two kinds.
- A proof of absence for a name the tree must not hold cannot be a wall,
  because the wall would have to hold the name. It is a manual test at the
  merge, with its steps written, and the test skill says so as a class.
- Every requirement in the league gains the line, closed ones included,
  with `none`, since a wall that read only new requirements would pass the
  old ones for a reason nobody can read. Fixture requirements obey the rule
  they are not testing and gain it too.

## Constraints

- The skill rules apply to the skills: the standard's shape, MIT, the line
  budget, no vendor or product named, no dash.
- `kaal acceptance` keeps its shape: one line per requirement on stdout in
  the label form it prints today, `FAIL <reason>` for a refusal, and the
  `- Status:` line keeps its meaning.
- The requirement template's sections stay as they are and in their
  order; the line is added to the Handoff, after `- Supersedes:`.
- Nothing in `bin/` changes except the reader of a requirement's handoff.

## Acceptance criteria

1. The analyse skill's text carries a section on data about a person that
   says the handoff names whether the task touches data about a person;
   where it does, the data, the purpose, the system of record it is
   resolved from by identifier, and how it is erased; that a tree holds
   identifiers and never the person; and that a local stand-in is ignored
   by version control.
2. The requirement template's Handoff carries a `- People:` line whose
   value is `none` or the data named with its system of record and how it
   is erased.
3. `kaal acceptance` refuses a requirement whose handoff has no
   `- People:` line: exit 1 and a `FAIL` line naming the requirement and
   `no people line`; a requirement carrying `- People: none` passes.
4. Every requirement in the league, fixtures included, carries exactly one
   `- People:` line, and its value is not empty.
5. The test skill names the class of proof that cannot be a wall, the
   absence of a name the tree must not hold, and says it is a manual test
   at the merge with its steps written.
6. The code skill says the developer keeps data about a person out of the
   tree: identifiers in the tree, the person resolved from the system of
   record at use, a local stand-in ignored by version control, and no
   built artefact that carries a person committed.
7. `SURFACE.md`'s section for `acceptance` names the `People` line among
   what the command reads.
8. The guest paragraph in each of the five working skills says what a guest
   does with data about a person it finds in a tree it was pointed at: it
   names the file to the ask and never the data, and it does not remove it,
   because a name removed from a working tree stays in the history and the
   tree then reads as clean.
9. The analyse skill's section on data about a person says whose presence
   is not the question: a record naming the person who wrote it or who gave
   a key is evidence of authorship or of the key, and the rule is about a
   person who did not choose to be in the tree.

## Open questions

- Should the line carry a retention, a date or a rule after which the data
  is erased, or is "how it is erased" enough for a first version?
- Does a drawing owe the same line, so an architect who introduces a store
  of people answers the question a requirement did not foresee?
- Should `kaal class` count the `People` line as part of the surface, since
  a consumer's requirements will be refused without it?
- Where a consumer's requirement names a system of record that is a
  product, the skill rule forbids naming products in skills, not in
  requirements; is that the right line?
- A guest that names the file and not the data has told the asker where to
  look and nothing about how bad it is. Is that the right trade, or should
  a guest be able to say what kind of data it saw, in words that carry
  none of it?
- Removing a name leaves it in the history, so the tree is not clean and
  cannot be made clean by a seat. Who decides what happens to a history
  that carries a person, and does the league owe that decision a shape?

## Handoff

- Task: a-task-names-its-people
- Criteria: 9; tests: 9 (equal)
- Red run: `node --test --test-timeout=60000 requirements/a-task-names-its-people/acceptance.test.mjs`,
  8 September 2026, 7 failing, each for its own reason: the sentences are
  absent from three skills, the template and the surface page; the wall
  passes a requirement with no people line; seventy-three requirement
  files in the tree carry none (the tasks, their fixtures under
  `requirements/` and `architecture/`, and the template). Green on a
  stand-in in a scratch clone, 7 passing, its board green on every wall
  but this task's own open-and-green, which is the build's to close; see
  What the runs said. Discarded.
- Tests: `acceptance.test.mjs`, beside this file; `fixtures/no-people` and
  `fixtures/people-none`, each a requirement with one green test
- Open questions: 6, listed above
- Status: closed
- Blocked on: nothing
- Unblocks: nothing
- Supersedes: nothing
- People: none
