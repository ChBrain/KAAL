# Requirement: evals-v2

_Written in analyse mode. Ask, from a defect: the first `/eval analyse`
comment on a pull request started the evals workflow, and the hosted model
answered 410, "temporarily unavailable as part of a scheduled retirement
brownout". The service the workflow was written against was retired on
30 July 2026; the endpoint, the catalogue and the `models: read` permission
are gone. The second model of push-v1's criterion 7 cannot be read from it._

## Goal

Kai wants the evals workflow to run a skill against whichever chat
completions endpoint the repository is configured with, so that the second
model is a setting and never a host named in the tree; he will know when the
workflow reads its endpoint, key and default model from repository
configuration, refuses in one line naming what is missing before any
request is made, holds no permission for a service that no longer exists,
and the evals README says how to configure it.

## Assumptions

- The endpoint speaks the chat completions shape that every provider and
  every local server offers: a POST with `model`, `messages` and
  `temperature`, a bearer key, and `choices[0].message.content` in the
  answer. The workflow keeps that request and changes only where it goes.
- Repository configuration means a repository variable `EVALS_API_URL`, a
  secret `EVALS_API_KEY`, and a repository variable `EVALS_MODEL` for the
  default model id; the comment's third word and the dispatch input still
  override the model.
- Supersedes push-v1's assumption that the second model is read from the
  hosted models a workflow may use, and push-v1's criterion 8 on the
  `models: read` permission; both are edited to say so.

## Constraints

- No vendor and no host is named in the workflow or in the tree; a URL is
  configuration, not text. The vendor rule stands.
- The record's shape does not change: `model` is the id the run was given.
- No dependency beyond node; no en-dash or em-dash.

## Acceptance criteria

1. The evals workflow names no host: the request URL is read from the
   `EVALS_API_URL` repository variable and the key from the `EVALS_API_KEY`
   secret, and no literal `https://` host appears in its run step.
2. The workflow refuses before any request when either setting is unset:
   one step, ahead of the run, that fails with an `::error` line naming both
   `EVALS_API_URL` and `EVALS_API_KEY`.
3. The workflow holds no `models` permission; `contents: write` and
   `pull-requests: read` stay as they are.
4. The default model is the `EVALS_MODEL` repository variable, and
   `evals/README.md` names the three settings by name.

## Open questions

- Should the workflow write a `flag` record when the endpoint refuses, so
  the board shows the attempt, or stay silent as now? (v1: silent; the
  workflow's own log is the record of a refused request.)

## Handoff

- Task: evals-v2
- Criteria: 4; tests: 4 (equal)
- Red run: `node --test requirements/evals-v2/acceptance.test.mjs`; all
  four red; the build turns them green
- Tests: `acceptance.test.mjs`, beside this file; surface only: the
  workflow file and the README
- Open questions: 1, listed above
- Supersedes: push-v1, assumption on the hosted models and criterion 8
- Status: closed
