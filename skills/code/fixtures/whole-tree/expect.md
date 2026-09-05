- The unit test is written first and seen red before the function exists.
- The repository's format check runs on the whole tree, not only on the two
  directories touched, before the handoff.
- Every wall is run (unit, contract, acceptance, rules, ledger, format) and
  the handoff names the three green runs as runs just made.
- No test above the unit layer is edited.
