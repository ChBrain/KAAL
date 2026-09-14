---
traces:
  parent: a-requirement-shows-its-work@28dbdbeb253110c8614d43ded370563419ce14ec7e22b435e1fe3354261c3769
  supersedes: nothing
---

# Requirement: a-human-ask-earns-its-requirements

_Human ask, preserved from Kai: "Today, a human and an NLP collaborator
manually trigger work through conversation. This is acceptable temporarily,
but the decision trail exists outside the repository. In the intended model,
a human submits an idea for consideration. The human's statement is
authoritative as an ask, but it is not automatic permission to implement the
proposed change. Every ask must be analyzed against the repository's existing
setup. That analysis produces zero or more requirements: zero when the ask is
discarded, already satisfied, duplicated, or awaiting an answer; one when it
expresses one independently testable need; more than one when it contains
separable needs. Only requirements that survive analysis reach the manager
for release placement." The authority chain remains: human owns intent;
analyst owns admission, refusal, and decomposition; manager owns release
placement. A Product seat is not part of this ask._

_Analyst's interpretation: this is one need, a repository-visible admission
decision between a human ask and manager planning. Its cases include zero,
one, and many resulting requirements, but they fail together if that decision
has no governed evidence. The human's proposed shape remains evidence, never
architecture._

## Goal

A human submitting an idea wants the repository to preserve what they asked
and the analyst's evidenced decision about what, if anything, it becomes, so
the manager can plan admitted requirements without treating the ask itself as
permission to build.

## What the runs said

- On the current `release` base, `git ls-tree` restricted to
  `requirements/<task>/requirement.md` counted 76 requirements. `git grep`
  found an ask or analyse-mode opening in 61,
  but that evidence has no home when analysis produces no requirement.
- `kaal.config.json` says the human's requirements evidence is "the ask
  itself, in the requirement's opening line" and records it at
  `requirements/<task>/requirement.md`. The declaration therefore represents
  the one-or-more case and cannot represent a discarded, covered, or waiting
  ask without fabricating a requirement.
- `node bin/kaal.mjs backlog` read all six declared seat pages and answered
  that nothing is blocked. Each page says it holds only what its seat cannot
  do, keyed by the seat owed and task; none is an ask record or a decision
  trail.
- `rg` found no intake, ask-ledger, or disposition vocabulary in the engine,
  its surface, the two working skills, or the declaration. The trace table
  resolves requirements, supersedes, parents, suites, cases, and principles,
  but no relation from a human ask to the requirement or requirements it
  produced.

## Assumptions

- Analysis is repository evidence, not a claim that a conversation happened.
  It preserves the human's words separately from the analyst's reading, the
  authorities actually read, and one disposition.
- An ask needs a stable way to be referenced because two-way trace cannot be
  checked without one. Whether that identity is a path, key, or field is the
  architect's decision.
- "Already satisfied" and "duplicated" are one disposition family here:
  both produce no new requirement and resolve to existing authority. The
  reason may distinguish them without creating two workflow states.
- Independent means each produced requirement states one carried part of the
  ask and has its own acceptance proof. It does not mean each must enter a
  different release.
- Meaning remains a human judgement. Deterministic proof can establish that
  analysis and links exist and that zero, one, or many were recorded; it
  cannot establish that the analyst's interpretation was wise.
- Adoption applies to asks admitted after a repository-visible boundary. Old
  requirements do not become invalid merely because the earlier process left
  no separate ask evidence.

## Constraints

- Intake is not a seat backlog. From the ask and the current backlog doctrine,
  an awaiting ask may cause the analyst to record a block, but the preserved
  ask, analysis, question, and disposition live in the intake evidence, not
  in the backlog entry.
- No Product seat. Human, analyst, and manager retain the three authorities
  named in the ask.
- A human-proposed solution, file, command, or implementation remains part of
  the original ask. It becomes neither a requirement nor architecture by
  being named.
- The adoption boundary is explicit and deterministic from repository state.
  It is never a date, age, or elapsed-time rule.
- The six acceptance fixtures describe cases and expected observations only.
  Their JSON is test data, not the path, format, name, or reader of the future
  repository mechanism.
- No release placement is made here. The manager decides scope only after an
  accepted requirement exists.

## Acceptance criteria

1. A discarded ask remains inspectable as the human's original words,
   distinguishable from the analyst's interpretation; its analysis names the
   current authorities actually read, records one discarded disposition and
   its reason, and links no new requirement.
2. An ask already satisfied or duplicated remains inspectable with its
   original words and analysis distinguished; the analysis names what it
   read, records one covered disposition, links the existing authority that
   covers it, and produces no duplicate requirement.
3. An accepted ask expressing one need records one accepted disposition and
   produces exactly one independently testable requirement. The ask evidence
   links that requirement, the requirement resolves back to the ask, and the
   requirement identifies the part of the human's words it carries rather
   than adopting a proposed solution as architecture.
4. An accepted ask expressing separable needs records one accepted
   disposition and produces more than one independently testable requirement.
   It links every result, every result resolves back to the ask, and each
   identifies a different part it carries, with no unlinked result on either
   side.
5. An ask that only a human can clarify remains inspectable with one awaiting
   disposition, the unanswered question, the authorities read, and zero
   requirements. The analyst's existing backlog represents the block by
   reference without becoming the ask record and without inventing an answer
   or requirement.
6. An unanalyzed human instruction presented directly for release placement
   is not manager work: its disposition evidence records the refusal and
   reason, and no plan carries the raw ask. Manager planning refers to
   accepted requirements, never raw asks; the same rule exempts historical
   requirements through an explicit repository-state boundary whose result
   cannot change with the clock.

## Open questions

- What artifact or artifacts preserve an ask and its analysis, and what are
  they called?
- What file format gives a human quotation, an analyst interpretation, a
  disposition, readings, questions, and links an inspectable shape?
- Which command or wall, if any, reads the evidence?
- How is the deterministic adoption boundary represented without rewriting
  the history of requirements that predate it?
- Does repeated submission point to one earlier ask, directly to its produced
  requirement, or both?
- Would distinct recurring work and proof later warrant a Product seat? This
  requirement creates none.

## Handoff

- Task: a-human-ask-earns-its-requirements
- Criteria: 6; tests: 6 (equal)
- Red run: `node --test --test-timeout=60000
requirements/a-human-ask-earns-its-requirements/acceptance.test.mjs`, 14
  September 2026, all 6 failing because the tree has no governed evidence
  for any of the six asks; each case was also seen red alone
- Stand-in green: all six assertions passed first against an in-memory answer
  with the required evidence and links, before each was run against the tree;
  discarded after the run
- Tests: `acceptance.test.mjs`, beside this file; six case descriptions under
  `fixtures/`, read as test data and never as a proposed production format
- Open questions: 6, listed above
- Blocked on: nothing
- Unblocks: the architect deciding the evidence shape and reader; only after
  that, a governed path from human asks to manager planning
- Supersedes: nothing
- People: none
