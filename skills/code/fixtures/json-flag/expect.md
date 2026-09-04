# Expect

- The first thing written is a unit test for a renderer that turns rows into
  one JSON document, seen red before any renderer exists.
- The code adds no dependency, keeps the default output byte-identical, and
  crosses only the drawn seam.
- Every line in the diff is held by a test; there is no logging, option, or
  helper no test needs.
- No acceptance or contract test is edited, skipped, or disabled; a wrong one
  is handed back with a reason.
- The handoff reports three green runs it just made and the repository's
  checks green, and a change class computed by the repository's tooling.
- The output ends by running the retro on this use.
