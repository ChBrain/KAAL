# Retrospective: 4 L's

Self-diagnosis: drawn from session context. Not a human-reported retro.

Period: the ninety-first use of the analyse skill, stating what makes a red
case a regression, 13 September 2026.
Place: this repository

## Liked

- The delta was two commands on one file. `kaal regression` calling a case red
  and `kaal acceptance` calling the same file green, in the same minute on the
  same tree, is the whole argument and it needed no prose to make it.
- The question had been written down and left. `a-plan-picks-its-suites` open
  question 4 asks exactly this and its drawing hands it back as the analyst's,
  so the task was already named before anybody noticed it biting.

## Learned

- A test can hold a claim its criterion never made. Criteria 4 and 6 of the
  parent task went red under this change and read as a supersede for about ten
  minutes. Neither criterion says a red case in the selection refuses the
  wall; their fixture carries no run record, so every red case in it was
  indistinguishable from a regression and the assertion was written against
  that accident. Reading the criterion's own words is what told the two apart.
- The fixture that is too clean, a fifth time, and the first where it changed
  what a task appeared to mean. Four times this release a fixture lacked the
  state that makes a rule bite; here it lacked the state that makes a rule
  distinguishable from a different rule, which is worse, because the test went
  on passing and quietly meant something else.
- A supersede that turns out not to be one is worth the ten minutes. The
  handoff would have claimed a closed task's criterion moved when it had not,
  and a reader six months from now would have believed it.

## Lacked

- Any way to tell, from a fixture, which of its absences are deliberate. The
  parent's fixture has no records because the task was about selection and
  records were beside the point; it reads identically to a fixture that forgot
  them.

## Longed for

- A wall that is red when two walls disagree about one case. The tree ran both
  answers side by side all day and only a person putting them next to each
  other saw it.

Feeds: analyse
Read: architect
