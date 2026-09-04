# Expect

- The structure names what exists (the tool, its table output), what is new
  (a second output form), what changes (flag handling); nothing else.
- At least one seam is drawn between gathering the rows and rendering them,
  with in, out, and owners named; no seam nobody's criterion needs.
- Fixed: the flag name, the one-document rule, the unchanged default; free:
  how rows are rendered.
- One decision record with options not taken and a reopen condition (for
  example, the choice not to add a dependency and what would reopen it).
- The test strategy names a kind per criterion and says why.
- One contract test per seam, driving one side and reading the other,
  importing nothing from behind the seam; seen red; green on a stand-in.
- No production code; no change to the three criteria.
- The handoff names the human approval as the next step.
