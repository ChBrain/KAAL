---
model: perplexity-best
reader: perplexity-best
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

I loaded a skill that isn't relevant here — let me proceed directly as the analyst. The ask is a single task: the `report` command should emit output that is machine-consumable via piping. Here is the requirement and its proof.
Requirement
Task: `report` — machine-consumable output mode

- Status: open
- Blocked on: —
- Supersedes: —

Goal
A developer wants `report` to emit output in a format that downstream tools can parse, so that the result of a report run can be processed by other programs without screen-scraping the human table.
Assumptions

1. The ask named no specific machine-readable format (JSON, CSV, TSV, …); the most plausible default is JSON, because it is self-describing and already well-supported in most shell pipelines. This assumption can be denied; if another format is required it replaces this one and the acceptance criteria change accordingly.
2. The existing table output (human-readable) is the current and only output of `report`.
3. A flag or environment variable triggers the machine-readable path; it does not replace the default table view.
4. "Pipe its output into other tools" means stdout; stderr is not the delivery channel for data.
5. The exit code behaviour of `report` is not changed by this feature.

Constraints

1. The human table output must remain the default when no machine-readable flag is given — the existing behaviour must not be broken.
2. The machine-readable output must go to stdout only.
3. No constraint on implementation language or framework has been stated; this requirement is silent on it.

Acceptance Criteria

1. When `report` is invoked with the machine-readable flag, it writes to stdout and exits 0.
2. The output written to stdout is valid JSON (parseable without error by a standard JSON parser).
3. The output is a JSON array; each element of the array corresponds to one row that would appear in the human table.
4. Each array element contains every field that the human table shows, with field names that are stable across runs (no generated or random keys).
5. When `report` is invoked without the machine-readable flag, the output to stdout is unchanged from the current table format (regression guard).
6. When the report result set is empty, the output is the empty JSON array `[]` and the exit code is 0.

Open Questions

1. Which flag name triggers machine-readable mode — `--json`, `--output=json`, `--format json`, or another? This requirement assumes `--json`; if a different spelling is chosen, the test fixture must be updated but the criteria are unchanged.
2. Should a subset of fields be selectable (e.g., `--fields name,score`)? The ask did not name this; it is not in scope here. Raise a new ask if needed.
3. Should other formats (CSV, TSV, NDJSON) be supported alongside JSON, or is one format sufficient? Out of scope for this task; raise a new ask.

Acceptance Tests
Tests are numbered to match the criteria above. Because no runner was named in the ask, tests are written for Node.js `node:test` — the runner already present in the KAAL repository. Each test drives `report` as a subprocess (the public surface) and reads its stdout. No internal state is read.
File: `requirements/report-machine-output/report.test.mjs`

```
// requirements/report-machine-output/report.test.mjs
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

// Run `report` as a black-box subprocess.
// Adjust REPORT_CMD to match the installed command in the repo (e.g. "node report.mjs").
const CMD = process.env.REPORT_CMD ?? "report";
function run(args = []) {
  return spawnSync(CMD, args, { encoding: "utf8", timeout: 10_000 });
}

// AC-1: exits 0 when --json flag is given
describe("AC-1: exit code with --json", () => {
  it("exits 0", () => {
    const r = run(["--json"]);
    assert.equal(r.status, 0, `exit code was ${r.status}; stderr: ${r.stderr}`);
  });
});

// AC-2: stdout is valid JSON
describe("AC-2: stdout is valid JSON", () => {
  it("parses without error", () => {
    const r = run(["--json"]);
    assert.doesNotThrow(() => JSON.parse(r.stdout), `stdout was not valid JSON: ${r.stdout}`);
  });
});

// AC-3: top-level value is an array
describe("AC-3: output is a JSON array", () => {
  it("top-level value is an Array", () => {
    const r = run(["--json"]);
    const parsed = JSON.parse(r.stdout);
    assert.ok(Array.isArray(parsed), `expected Array, got ${typeof parsed}`);
  });
});

// AC-4: every element has stable, non-empty field names
describe("AC-4: each row has stable field names", () => {
  it("all elements share the same key set, no key is empty string", () => {
    const r = run(["--json"]);
    const rows = JSON.parse(r.stdout);
    // At least one row must exist for this assertion to be meaningful.
    // If the result set is empty on the current fixture, skip and mark partial.
    assert.ok(rows.length > 0, "no rows returned — run against a fixture with at least one result, or see AC-6");
    const keys = Object.keys(rows[0]);
    assert.ok(keys.length > 0, "first row has no fields");
    keys.forEach(k => assert.ok(k.length > 0, "one field name is the empty string"));
    rows.forEach((row, i) => {
      const rowKeys = Object.keys(row);
      assert.deepEqual(rowKeys.sort(), keys.sort(), `row ${i} has different keys than row 0`);
    });
  });
});

// AC-5: default invocation (no --json) leaves stdout unchanged from table format
describe("AC-5: default output is unchanged (regression guard)", () => {
  it("stdout without --json does not parse as JSON", () => {
    const r = run([]);
    assert.throws(
      () => JSON.parse(r.stdout),
      "stdout without --json should be a table, not JSON"
    );
  });
});

// AC-6: empty result set yields [] and exit 0
describe("AC-6: empty result set", () => {
  it("outputs [] and exits 0", () => {
    // Provide an environment variable so the command returns no rows.
    // Adjust REPORT_EMPTY_ARGS if the command uses a different mechanism (e.g. a date filter).
    const emptyArgs = (process.env.REPORT_EMPTY_ARGS ?? "--filter __no_match__").split(" ");
    const r = spawnSync(CMD, ["--json", ...emptyArgs], { encoding: "utf8", timeout: 10_000 });
    assert.equal(r.status, 0, `exit code was ${r.status}`);
    const parsed = JSON.parse(r.stdout);
    assert.ok(Array.isArray(parsed), "expected array");
    assert.equal(parsed.length, 0, "expected empty array");
  });
});
```

Run command (with timeout, off the league's own tree):

```
REPORT_CMD=<your-report-command> node --test --test-timeout=60000 requirements/report-machine-output/report.test.mjs
```

Handoff

- Task: `report` — machine-consumable output mode
- Criteria count: 6
- Test count: 6 ✓ (equal)
- Red run: Not yet recorded — `report --json` does not exist, so AC-1 through AC-4 and AC-6 will fail immediately; AC-5 will be red because `run([])` may or may not throw on a future table format change. Record the red run output here before handing to the developer.
- Partial red notes:
  - AC-4 contains a count-first guard (`rows.length > 0`) per the Count first rule; if the live fixture returns zero rows, the test notes this and defers to AC-6 rather than producing a false green.
  - AC-5 is a regression guard; it will be green on the current codebase (table output is not JSON today) and must stay green after the feature lands.
  - AC-6 depends on a fixture or filter mechanism that produces an empty result. If no such mechanism exists, this becomes Blocked on: developer to expose an empty-result path. Note that in the handoff.
- Open questions (blocking the developer, not this handoff):
  1.  Flag spelling (`--json` assumed).
  2.  `REPORT_CMD` value — the test needs the invocation string.
  3.  Mechanism for an empty-result run (AC-6): flag, filter argument, or fixture environment?
- Status: open

# Reading

I loaded the wrong skill — here is the checklist evaluation directly.
flag

- The goal names the asker and the outcome, and says nothing about how — met. The goal names "a developer" as the asker and states the outcome ("emit output in a format that downstream tools can parse … without screen-scraping the human table"). No implementation is prescribed there.
- Output format is surfaced as an assumption the asker could deny, or as an open question — met. The document explicitly states JSON is assumed as "the most plausible default" and that "this assumption can be denied; if another format is required it replaces this one."
- Every acceptance criterion is observable by running `report` and reading its output or exit code; none names a module, function, library, or file inside the tool — met. All six criteria reference only what `report` writes to stdout, what it exits with, or how its output parses. No internal module is named.
- Criteria and tests are equal in count and numbered to match — met. Six criteria, six tests, AC-1 through AC-6 with matching numbering.
- Every test drives `report` as a command and reads its output or exit code; no test imports from inside the tool — met. All tests use `spawnSync` against the `report` command as a subprocess; no internal module is imported.
- The handoff records a red run, or a manual walk that was not met — not met. The handoff explicitly states "Red run: Not yet recorded" and defers to the developer to record it. A placeholder and an explanation are given, but no actual red run output is present. The checklist requires the red run be recorded, not merely promised.
- Nothing in the requirement extends the ask beyond piping the output: no filtering, no new columns, no configuration — not met. AC-6 relies on a `--filter __no_match__` argument (or `REPORT_EMPTY_ARGS`) to produce an empty result set. This introduces a filtering mechanism that was not part of the original ask ("pipe its output into other tools"), and the open question about "a subset of fields selectable via `--fields`" is noted but not clearly rejected — it is marked "out of scope" in prose, but the mechanism to produce an empty-result path for AC-6 implies at minimum a `--filter` capability is assumed to exist or be created, which goes beyond the ask.
