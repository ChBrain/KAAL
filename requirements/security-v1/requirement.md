# Requirement: security-v1

_Written in analyse mode. Ask: before skills with scripts are reused outside
this repository, the league needs the security floor an outside review found
missing: a reporting channel, minimal workflow permissions, a dependency
policy, a rule for scripts that reach the shell or the network, and a named
threat model for prompt injection through the channels this league runs on:
asks, fixtures, retros, pull request bodies, tool output._

## Goal

Kai wants a consumer to be able to answer four questions before copying a
skill: where to report a vulnerability, what a workflow may touch, what a
script may reach, and what the league treats as untrusted text; he will know
when each answer is a file or a wall, and a script that reaches the network
without saying so is refused.

## Assumptions

- `SECURITY.md` carries reporting and supported versions; the threat model
  is a section of the same file rather than a second document.
- A script "reaches" when it imports `child_process`, `net`, `http`,
  `https`, `dns`, `tls`, or calls `fetch`; the declaration is a `## Reach`
  section in the skill's `SKILL.md` naming `shell` or `network` or both.
- Minimal permissions means every workflow declares a top-level
  `permissions` block, and only the evals workflow holds `contents: write`,
  because it commits records.
- The dependency policy is the lockfile committed and `npm ci` in CI; the
  formatter stays the only dependency.

## Constraints

- `kaal check` keeps its contract; the reach rule is one more rule named
  `reach` in the same findings shape.
- Every rule here is a wall or a file; nothing is a recommendation.
- No en-dash or em-dash; no dependency beyond node.

## Acceptance criteria

1. `SECURITY.md` exists with sections Reporting, Supported versions, and
   Threats; Threats names asks, fixtures, retros, pull requests, and tool
   output as untrusted text and states that they are data, never
   instructions.
2. Every workflow under `.github/workflows/` declares a top-level
   `permissions` block, and only the evals workflow declares
   `contents: write`.
3. `package-lock.json` is committed and the ci workflow installs with
   `npm ci`.
4. `node bin/kaal.mjs check <dir>` reports a `reach` finding for a skill
   whose script reaches the shell or the network with no `## Reach` section
   in its `SKILL.md`: exit 1 on `fixtures/undeclared-reach`, exit 0 on the
   league's own skills.
5. Every skill in the league whose scripts reach declares it, and a skill
   whose scripts do not reach carries no `## Reach` section.

## Open questions

- Should a declared reach also name the hosts a script may call, or is
  `network` enough for v1?
- Do fixtures of a skill count as untrusted text when the skill runs on
  them in the evals workflow, and should the workflow say so?

## Handoff

- Task: security-v1
- Criteria: 5; tests: 5 (equal)
- Red run: `node --test requirements/security-v1/acceptance.test.mjs`;
  green on a stand-in
- Tests: `acceptance.test.mjs`, beside this file;
  `fixtures/undeclared-reach`
- Open questions: 2, listed above
- Status: closed
