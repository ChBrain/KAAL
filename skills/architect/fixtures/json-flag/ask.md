# Ask

Draw the change for this requirement. Goal: someone who runs the command line
tool `report` can consume its output with another tool. Criteria: (1) `report
--json` prints one JSON document on standard output and nothing else; (2) the
document carries every row the table shows, with the same values; (3) without
the flag, the output is unchanged. Each criterion has a red acceptance test
that drives `report` as a command. Constraint: no new dependency.
