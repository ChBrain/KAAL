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
- `verdict`: `pass` or `flag`, the reader's reading.

## Body, two sections

- `# Output`: the model's output on the ask, raw and in full.
- `# Reading`: the reader's reading, the verdict on the first line and one
  line per item of `expect.md`, met or not met and why.

## What counts

A record counts for nothing when any field is missing, when its verdict is
not `pass`, or when any of its three shas no longer matches the file it
names: editing the skill or the fixture relegates the move until the record
is regenerated. `kaal ledger` names the reason for every record it drops.

## How a record is made

By a person, running the skill in their own runtime on the fixture's `ask.md`,
reading the output against `expect.md`, and writing the file by hand; or by
the evals workflow, on an `/eval <skill> [model]` comment on a pull request or
a dispatch, with one configured model as both model and reader.

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
