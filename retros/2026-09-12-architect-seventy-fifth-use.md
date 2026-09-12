# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the seventy-fifth use of the architect skill, drawing the board's
third answer, 12 September 2026.
Place: this repository

## Liked

- A seam nobody asked for, drawn because the code was already wrong. The
  waiver pass reads `if (x.ok)` and a wall that declines has `ok: false`, so
  a licence filed over a wall that never failed would have been spent and
  counted. No criterion states it and the drawing carries it as its own row
  in the table, which is what a drawing is for.
- Reading the code I was about to change, rather than the stand-in I had
  written an hour before. The stand-in had the same bug and all five of its
  contracts passed over it, because none of them filed a waiver.

## Learned

- A stand-in proves the seams it has and nothing about the ones it lacks.
  Two stand-ins in a row went green while carrying the same defect, and the
  only thing that found it was opening the file the change lands in and
  reading the branch above the one I was editing.
- The asker has a word this tree lacked. Delivery architecture and solution
  architecture are different questions with one seat and one vocabulary
  between them, and this drawing is the first that says which it is in its
  own first line. It cost one sentence and it tells a reader what kind of
  page they have opened before they read a seam.
- Three readers of one classification is how a definition drifts. The board's
  summary, the waiver pass and the promotion each decided what red meant, and
  the defect this task exists for is exactly that: one number read three
  ways, two of them wrong.

## Lacked

- Any contract over the waiver's own behaviour before today. It is a human's
  act with a count attached and nothing asked what happens to it over a wall
  in a state that did not exist when it was written.

## Longed for

- A drawing that can say a seam serves no criterion without it reading as
  scope invented. The table has a row for it and the row's why column is
  where the argument has to live, which is a paragraph in a cell.

Feeds: architect
Read: code
