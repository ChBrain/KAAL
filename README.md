# KAAL

**Kai's Artificial Agent League.** A league of agent definitions and the
skills they carry, for one purpose: how to use LLMs to build software.

KAAL is software delivery, engine oriented. It is not a product and it is not
a runtime. It defines what an agent is, what a skill is, what each may do, and
how both earn their place; where they run is the consumer's business. khai,
where everything is a play, is one consumer among possible others, and nothing
in KAAL depends on it. The engine is open: MIT.

The full design is [DESIGN.md](DESIGN.md). This page is the door.

## The idea in five sentences

A skill is a directory with a `SKILL.md`, in the open Agent Skills standard,
that any runtime reading the standard can load; a skill is NLP and scripts,
and both travel with it. An agent is a persona for voice, a binding for scope,
and a loadout of skills. Every seat in a delivery pipeline owes a pair, _I
want this_ and _this is how I test that it is true_, and nobody proves another
seat's want. Everyone stays in lane: a seat declares the paths it may change,
the lane is read off the diff, and one pull request is one lane. Every move a
skill makes sits on a ladder, Human < NLP < Skill < Script, and climbs one
rung at a time on evidence, never on a claim.

## The first job

Five delivery skills and the loop that improves them, built by running the
pipeline on itself.

| skill       | seat       | want, and its proof                                                                     |
| ----------- | ---------- | --------------------------------------------------------------------------------------- |
| `analyse`   | analyst    | a task that can fail: goal, assumptions, constraints, criteria; acceptance tests        |
| `architect` | architect  | the drawing: structure, seams, fixed and free, decisions; contract tests per seam       |
| `code`      | developer  | the least code that turns the tests green; unit tests written first                     |
| `operate`   | operator   | a release that holds: ship, smoke, rollback, with the human's key; deploy tests         |
| `test`      | every seat | the discipline of the proof: red for the right reason, green on a stand-in, blind below |
| `retro-4ls` | every use  | what was liked, learned, lacked, longed for; fed to the analyst as the next requirement |

Requirements drive architecture and acceptance tests. Architecture drives
contract tests and code. Tests drive code. Code drives unit tests and
deployment. Deployment drives its own tests and observability. Each testing
layer is blind to the layers below it, and that blindness is an import
boundary, so it is a wall.

## Glossary

- **agent**: a persona (voice), a binding (scope), and a loadout of skills.
  Defined under `agents/<name>/`; mapped onto a runtime by an adapter the
  consumer owns.
- **skill**: a directory under `skills/<name>/` with `SKILL.md`, its
  `references/`, its `scripts/`, a `moves.json` ledger, and `fixtures/`.
  Follows the Agent Skills standard plus league policy: MIT, no vendor or
  runtime named, no consumer's vocabulary, no en-dash or em-dash.
- **seat**: a place in the pipeline that a skill is carried in: analyst,
  architect, developer, operator. The tester is not a seat; it is the
  discipline every seat loads.
- **want and proof**: every seat's output. The want says what must be true;
  the proof is the test that fails when it is not, seen red before it is
  trusted and seen green on a throwaway stand-in before it is believed.
- **lane**: the paths a seat may change. Read off the diff, never typed. One
  pull request, one lane; a handoff is one seat's pull request landing and
  the next seat starting from what landed.
- **wall**: a deterministic check that gates: it runs in the hook and in CI
  and no model is in it. Every wall was watched to fail before it was trusted
  to pass.
- **harness**: a script that asks a model to read a rubric, several times,
  with a skeptic, and decides by a rule. It advises and never gates, because
  what it judges is meaning.
- **move**: one thing a skill does, listed in its ledger with the rung it has
  evidence for.
- **rung**: where a move sits on the ladder. `human`: a person does it.
  `nlp`: a model does it in conversation. `skill`: a model does it under the
  skill, proven on fixtures by two models. `script`: code does it, with a
  test seen red.
- **ledger**: `moves.json`. A rung is a measurement: a move claims `skill`
  only with fresh eval records from two models, and `script` only with a
  script inside the skill and a passing test beside it.
- **fixture**: a small known ask under a skill's `fixtures/<name>/`, with the
  `expect.md` the receiving seat reads the output against.
- **eval record**: one model's run on one fixture, under
  `evals/<skill>/<fixture>/`, carrying `model`, `verdict`, and `skill_sha`,
  the SHA-256 of the `SKILL.md` it evaluated. When the skill changes, the
  record is stale and counts for nothing: editing a skill relegates its moves.
- **retro**: a 4 L's self-diagnosis filed under `retros/` after every use of
  a skill, ending with `Feeds: <skill>`. Every ten unconsumed retros on a
  skill, the analyst reads the stack as an ask and writes the skill's next
  requirement; the consumed retros move to `retros/archive/`.
- **requirement**: the analyst's output under `requirements/<task>/`: the
  want as `requirement.md`, the proof as `acceptance.test.mjs` beside it.
- **drawing**: the architect's output under `architecture/<task>/`: the
  structure, seams, decisions, and `contracts.test.mjs` beside it.
- **Kaal**: the persona that drives KAAL. Whoever works in this repository
  works as Kaal: reads the measure against the declared standard, turns the
  wheel or sends the artefact back, and never edits from inside the stamp.

## Using a skill

Copy a skill directory into the place your runtime discovers skills from, or
load it by path where your runtime allows it. Everything the skill needs is
inside the directory; nothing in KAAL is required at the consumer's side. A
wiring script that keeps consumers' copies equal to the league's is a later
job; until then, the copy is by hand and so is the drift.

## Running the walls

One command runs every wall the league has, in the pre-push hook and in CI
alike:

```
npm install   # once per clone; also wires the pre-push hook
npm test      # node bin/kaal.mjs gates
```

The walls are data, a `gates` list in `kaal.config.json`: every
requirement's acceptance tests (a closed requirement's red is a failure, an
open one's red is its analyst's red run and is reported), every drawing's contract tests, the unit
tests, the skill rules (`kaal check`, which also refuses a script that reaches the
shell or the network without a Reach section in its skill, and a skill
with no adversarial fixture), the ledgers' evidence and freshness
(`kaal ledger`), and the format check. The runner prints one line per wall
with its count and a summary, runs every wall even after one fails, and
treats a wall it cannot run as a failure. Every wall is a program and its
arguments, started by the platform's own shell, and `kaal acceptance` and
`kaal contracts` expand their own globs, so the board reads the same on a
machine with no `sh`. A human may waive a red wall with
a file in `waivers/` naming the wall, who, why and until; the board then says
waived, never ok, and an expired waiver counts for nothing. The `ci` workflow runs the same
command on every pull request and push to main; making it a required check
is a repository setting.

## Layout

```
DESIGN.md        the design: the rulings, and why
skills/          the members
agents/          the agents; Kaal first, the persona that drives KAAL
requirements/    the analyst's wants and proofs, one task each
architecture/    the architect's drawings and contracts, one task each
retros/          the loop; archive/ holds what a requirement consumed
evals/           eval records, the evidence for the Skill rung
bin/             the league's own tool; never called by a skill
lib/             scripts shared between skills, stamped into them at build
```

## What KAAL is not

Not a runtime, an orchestrator, or a marketplace. Not a place for content
skills: a skill that authors a play, a persona, or an engine's prose belongs
to the house whose content it is. Not finished: every ledger sits at the NLP
rung until the first fixture evals have run, and the standings table does not
exist yet. The design says what is ruled and what is open.
