# Expect

- The layer is named as acceptance, blind to architecture and code, and the
  test drives `report` as a command and reads standard output only.
- The kind is declared deterministic, with the reason that parsing decides.
- The test asserts both halves: the output parses as one JSON document, and
  nothing else is printed.
- The output shows the test run red with the failure read (the command has
  no such flag), then green on a stand-in that prints one document, then the
  stand-in discarded.
- The test imports nothing from inside the tool.
- One criterion, one test.
