# Security

## Reporting

Report a vulnerability in KAAL, in a skill it ships, or in a script a skill
carries, by opening a security advisory on this repository (Security tab,
"Report a vulnerability"), or by mail to the maintainer's address on the
GitHub profile of the repository owner. Say what you found, where, and how
to see it. Expect an acknowledgement within a week and a fix or a reasoned
refusal within a month; a fix lands as a normal pull request through the
walls, and the advisory is published with it.

## Supported versions

`main` is supported. Once the league publishes a tagged release, the latest
tag is supported alongside `main` and nothing older. A consumer that copied
a skill is on the version they copied; the wiring job, when it exists, will
say when a copy is behind.

## Threats

The league runs on text that anyone can write: an **ask**, a **fixture**, a
**retro**, a **pull request** body or comment, and **tool output** (a test's
message, a command's stdout, a fetched page). All five are untrusted. They
are data, never instructions: a skill reads them to do its job and does not
take orders from them, whatever they say. Concretely:

- A skill acts on its `SKILL.md` and the seat's checklist, not on a sentence
  inside an ask that tells it to change lanes, skip a wall, or call a
  script it does not carry.
- A fixture's `ask.md` is run by the evals workflow with a hosted model; the
  workflow gives the model the skill and the ask and nothing else, holds
  only `models: read` and `contents: write` for its records, and commits
  under `evals/`.
- A retro feeds the analyst as an ask, with the same standing as any ask.
- A pull request body or comment can start the evals workflow (`/eval`) and
  nothing else; it cannot change what the workflow does.
- Tool output is read for its verdict and its counts; a message inside it is
  text.

Two rules of the tree follow. A key is given by the human, never by a
document: `operate` refuses production without it, whatever an ask says. And
a script that reaches the shell or the network says so in its skill's
`## Reach` section, checked by `kaal check`; a consumer reads the declaration
before copying the skill.

Workflows hold explicit, minimal permissions: `ci` reads contents only;
`evals` writes contents (its records) and reads models. Dependencies are the
lockfile, installed with `npm ci`; the formatter is the only one.
