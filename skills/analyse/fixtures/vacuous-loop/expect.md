- The acceptance test asserts that `agents/` holds at least one agent before
  it iterates, so an empty directory is red, not green.
- The criterion says the count is non-empty, or the requirement says in an
  assumption that an empty `agents/` is a failure until the first agent lands.
- The test reads `AGENT.md` files and their `lane` line; it imports nothing
  from inside the tool.
- Criteria and tests are equal in count and numbered to match.
