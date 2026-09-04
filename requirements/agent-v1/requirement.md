# Requirement: agent-v1

_Written in analyse mode. Ask: the design says an agent is a persona, a
binding and a loadout, and that Kaal is the persona that drives KAAL; today
no agent definition exists in the tree and Kaal lives only on an unmerged
branch from May (PR #1) in a layout the design has since replaced. Bring the
agent definition into being, with Kaal as the first one, and close #1 by
superseding it._

## Goal

Kai wants an agent to be a real thing in the tree, checked by a wall the way
a skill is, and Kaal to be the first: a persona file that carries what PR #1
wrote, a binding that says what Kaal may and may not do, and a loadout that
names the skills he carries; he will know when `kaal agents` refuses a broken
agent and accepts Kaal, and #1 can close as superseded.

## Assumptions

- The agent definition is the design's section 3: `agents/<name>/` with
  `AGENT.md` (frontmatter: `name`, `description`, `division`, `skills`,
  `hands_to`, `lane`, `license`; sections Purpose, Allowed, Not allowed,
  Input, Output, Handoff, in that order), `persona.md` (Projection, Action,
  Shadow, Tell, in that order, the shape credited to khai in its
  frontmatter), `moves.json`, `fixtures/`.
- Division names are still Kai's; until they exist, `division` takes a rung
  name (`human`, `nlp`, `skill`, `script`) and the wall accepts those four.
- Kaal's persona is PR #1's text, carried over as written, with the four
  chapters kept and the frontmatter changed to this league's shape; his scope
  is the stamp: read the measure, turn the wheel or send the artefact back,
  never edit.
- A persona defines voice only: it may not contain the words `Allowed` or
  `Not allowed`; scope lives in `AGENT.md`.

## Constraints

- `kaal agents` is a new command; `kaal check` keeps its contract from
  push-v1 (a skills directory in, findings out).
- Every loadout entry resolves to a skill directory; every `hands_to` entry
  resolves to an agent directory; `lane` is a non-empty list of globs.
- MIT; no en-dash or em-dash; no vendor named; no dependency beyond node.

## Acceptance criteria

1. `agents/kaal/` exists with `AGENT.md`, `persona.md`, `moves.json` and a
   `fixtures/` directory holding at least one fixture with `ask.md` and
   `expect.md`.
2. Every `AGENT.md` under `agents/` has the seven frontmatter fields, `name`
   equal to its directory, `division` one of the four rung names, every
   `skills` entry resolving under `skills/`, every `hands_to` entry resolving
   under `agents/`, a non-empty `lane` list, and `license: MIT`.
3. Every `AGENT.md` body carries the six sections in order, and every
   `persona.md` carries the four chapters in order, credits the shape to
   khai in its frontmatter, and contains neither `Allowed` nor
   `Not allowed`.
4. `node bin/kaal.mjs agents [root]` exits 0 on the league's own tree and
   exits 1 on `fixtures/bad-agent`, naming the agent and the rule.
5. Kaal's persona carries PR #1's four chapters (its Tell mentions the stamp
   and its Action the wheel), and Kaal's `Not allowed` says he does not edit
   the artefact he stamps.

## Open questions

- What are the divisions called?
- Does Kaal carry a loadout at all, or is the stamp a move of his own with
  no skill behind it? v1 gives him `retro-4ls` and nothing else.

## Handoff

- Task: agent-v1
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test requirements/agent-v1/acceptance.test.mjs`, all
  five failing; green on a stand-in
- Tests: `acceptance.test.mjs`, beside this file; `fixtures/bad-agent`
- Open questions: 2, listed above
- Supersedes: PR #1, which closes when this lands
- Status: open
