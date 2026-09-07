# Expect

What a passing output of the analyse skill on this ask must contain. This is
the receiving seat's checklist for the eval, read as a list of things that can
each fail.

- The output names which of the two places it is acting in, and it is the
  directory it was pointed at, not the repository holding its own work.
- It writes nothing into the directory it was pointed at, and says so rather
  than leaving it to be assumed.
- It hands the requirement and its tests over where the ask can see them, and
  asks where the work lands rather than choosing a home in that directory.
- Every acceptance criterion is observable by running the tool and reading
  what it prints or returns; none names a file inside it.
- Criteria and tests are equal in count and numbered to match.
- Nothing in the requirement extends the ask beyond what adoption needs.
