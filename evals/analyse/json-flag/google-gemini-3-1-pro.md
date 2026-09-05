---
model: google-gemini-3-1-pro
reader: google-gemini-3-1-pro
temperature: default
date: 2026-09-05
fixture: json-flag
ask_sha: beb15ced535972519ee9912207ec7133b8832431ccf59115762d74fce80a8b8a
expect_sha: 99b66e9cc0aae7309dce49a7786643414bc0cfd698d3ec0c02bce6c845fbdf5b
skill_sha: b03950650c34dc6a561563ace4577d2ca4b3e93431aec1f9a0712b86d440fa74
setup: chat
verdict: flag
---

# Output

Proof: `requirements/report-machine-readable/acceptance.test.mjs`
JavaScript

```
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

test("report output is valid json when invoked with --json flag", () => {
  const stdout = execFileSync("report", ["--json"], {
    encoding: "utf8",
    timeout: 60000,
  });

  assert.doesNotThrow(() => {
    JSON.parse(stdout);
  }, "stdout must be valid JSON");
});

```

Want: `requirements/report-machine-readable/requirement.md`
Requirement: report machine-readable output
Goal
A user piping `report` into downstream CLI tools receives machine-parseable JSON output on stdout instead of a human-formatted text table.

Assumptions

- Passing the `--json` flag to `report` is the surface trigger to format results for piping into other tools.

Constraints

- Must not remove or alter the default human-readable terminal table output when invoked without flags.

Acceptance criteria

1. Running `report --json` writes valid JSON to stdout.

Open questions

- Should structured piping support formats other than JSON (such as CSV, NDJSON, or TSV)?

Handoff

- Task: report-machine-readable

- Criteria count: 1

- Test count: 1

- Red run: `node --test --test-timeout=60000 requirements/report-machine-readable/acceptance.test.mjs` (Fails: flag `--json` not recognized or `report` does not output valid JSON)

- Status: open

- Blocked on: nothing

- Supersedes: nothing

# Reading

flag

- The goal names the asker (someone who runs `report`) and the outcome (its output can be consumed by another tool), and says nothing about how: not met because the goal specifies "JSON", which dictates the specific format/mechanism of how rather than just stating the outcome that it can be piped/consumed.

- The output format is surfaced, either as an assumption the asker could deny (for example, that machine readable means a common structured format) or as an open question, and not silently decided as a design choice: met because it surfaces format options in Open questions and frames `--json` under Assumptions.

- Every acceptance criterion is observable by running `report` and reading what it prints or returns; none names a module, a function, a library, or a file inside the tool: met because running `report --json` and observing stdout is purely observable from the CLI interface.

- Criteria and tests are equal in count and numbered to match: not met because the criterion is unnumbered and the test is unnumbered.

- Every test drives `report` as a command and reads its output or exit code; no test imports from inside the tool: met because the test executes `report` using `execFileSync` and verifies its stdout.

- The handoff records a red run, or a manual walk that was not met: met because the handoff section includes a red run command and description.

- Nothing in the requirement extends the ask beyond piping the output: no filtering, no new columns, no configuration: met because the requirement only covers producing machine-readable JSON on stdout via `--json` without adding extra features.
