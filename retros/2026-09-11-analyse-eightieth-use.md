# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the eightieth use of the analyse skill, widening criterion 4 of
`a-suite-names-its-cases` from a seat's tree to anything the board says owns a
path, 11 September 2026. The task's own open question answered by running.
Place: this repository

## Liked

- The task predicted this. Its fifth open question said criterion 4 would ask
  out loud where a skill's script test belongs, and it did, on
  `skills/analyse/scripts/count.test.mjs`, the moment the finding was wired.
  The question is kept on the page rather than deleted, because the answer is
  evidence and the question is how it was found.
- The widening reads what is already declared. `kaal.config.json` holds a
  lane's `allows` beside a seat's `owns`, and four of this league's lanes carry
  no seat; the criterion had simply looked at one of the two.

## Learned

- A rule that reads seats alone makes the league's own method the one thing
  the method cannot cover. Every seat loads the skills and no seat owns them,
  on purpose, so the strict reading leaves a skill's own script test outside
  the layer built to force cases into lanes. That is the tell that the rule
  was about the wrong noun: a case belongs where something owns it, and a lane
  that carries no seat still carries an `allows`.
- Absence needs a witness here more than usual. The first half of this
  criterion fires on a path nobody owns and would pass on a tree where nothing
  is ever allowed; the second half, a case under a seatless lane being no
  finding, is what says the widening happened rather than the check being
  dropped.

## Lacked

- Nothing says which of the board's declarations a criterion may read.
  `seats`, `lanes`, `shared` and `gates` are all there, a criterion naming one
  of them is at the surface, and there is no rule about naming the wrong one.

## Longed for

- An open question that can be marked answered on its own page, with what
  answered it. This one is kept as prose because there is nowhere else for it
  to go, and a reader cannot tell it from a question still open.

Feeds: analyse
Read: architect
