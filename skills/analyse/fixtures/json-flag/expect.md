# Expect

What a passing output of the analyse skill on this ask must contain. This is
the receiving seat's checklist for the eval, read as a list of things that can
each fail.

- The goal names the asker (someone who runs `report`) and the outcome (its
  output can be consumed by another tool), and says nothing about how.
- The output format is surfaced, either as an assumption the asker could deny
  (for example, that machine readable means a common structured format) or as
  an open question, and not silently decided as a design choice.
- Every acceptance criterion is observable by running `report` and reading
  what it prints or returns; none names a module, a function, a library, or a
  file inside the tool.
- Criteria and tests are equal in count and numbered to match.
- Every test drives `report` as a command and reads its output or exit code;
  no test imports from inside the tool.
- The handoff records a red run, or a manual walk that was not met.
- Nothing in the requirement extends the ask beyond piping the output: no
  filtering, no new columns, no configuration.
