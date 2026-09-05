# Eval records

One model's run on one fixture, under `evals/<skill>/<fixture>/<model>.md`.
A record is the evidence a move needs to stand at the Skill rung: two distinct
models' records, each complete, `pass`, and fresh. The contract lives once in
code, `bin/lib/record.mjs`, and this page names the same fields; a unit test
holds the two equal.

## Frontmatter, all required

- `model`: the model that produced the output, provider and id.
- `reader`: the model that read the output against the fixture's `expect.md`
  and wrote the verdict; may equal `model` in v1.
- `temperature`: the sampling temperature the request sent.
- `date`: the day of the run, `YYYY-MM-DD`.
- `fixture`: the fixture directory's name under the skill's `fixtures/`.
- `ask_sha`: the SHA-256 of the fixture's `ask.md` at the time of the run.
- `expect_sha`: the SHA-256 of the fixture's `expect.md` at the time of the
  run.
- `skill_sha`: the SHA-256 of the skill's `SKILL.md` at the time of the run.
- `setup`: how the skill was given to the model, one of four words. `chat`:
  the skill pasted as a message before the ask. `system`: the skill as a
  system prompt, a Gem, a Space instruction. `workspace`: the skill loaded by
  an agentic runtime with a repository open. `workflow`: the evals workflow.
  The same skill behaves as three skills across these, so a record that
  does not say is not comparable and counts for nothing.
- `verdict`: `pass` or `flag`, the reader's reading.

## Body, two sections

- `# Output`: the whole exchange, from the first line the model wrote to the
  last, the author's answers to its questions included, verbatim. A skill
  that asks before it answers is judged on the answer it gave after asking;
  an output recorded without its first turn reads as a skill that never
  asked.
- `# Reading`: the reader's reading, the verdict on the first line and one
  line per item of `expect.md`, met or not met and why. The reading is made
  by handing the reader the checklist text at the record's `expect_sha`,
  so the output is read against the checklist the record names; a reader
  left to find a checklist in the tree has read an older copy before.

## What counts

A record counts for nothing when any field is missing, when its verdict is
not `pass`, or when any of its three shas no longer matches the file it
names: editing the skill or the fixture relegates the move until the record
is regenerated. `kaal ledger` names the reason for every record it drops,
and lists a stale one under its candidate's standing with what moved
(`stale: evals/analyse/json-flag/<model>.md (skill moved)`), so the board
says "measured, then moved" and not "never measured".

## How a record is made

By a person, running the skill in their own runtime on the fixture's `ask.md`,
reading the output against `expect.md`, and writing the file by hand; or by
the evals workflow, on an `/eval <skill> [model]` comment on a pull request or
a dispatch, with one configured model as both model and reader.

The person does not assemble the prompts by hand. `kaal runner <skill>
<fixture>` prints them from the tree: the skill with its references and the
ask as one block, the reader's instruction with the checklist as a second,
and the record's frontmatter with the three shas filled as a third. With
`--write` it files them as `RUNNER.md` beside the fixture's `ask.md`, where a
phone copies from the repository page and a runtime in the workspace reads
the same text; `--check` says whether that file is still current. The
league's own fixtures carry theirs.

## Configuring the workflow

The workflow names no host. It reads three repository settings:

- `EVALS_API_URL`, a repository variable: the chat completions URL of any
  provider or local server that speaks the common shape (`model`,
  `messages`, `temperature`; `choices[0].message.content` back).
- `EVALS_API_KEY`, a repository secret: the bearer key for that URL.
- `EVALS_MODEL`, a repository variable: the default model id; the comment's
  third word (`/eval analyse <model>`) or the dispatch input overrides it.

When the URL or the key is missing the workflow refuses in one line before
any request is made. The comment must be a comment on the pull request, not
its description.
