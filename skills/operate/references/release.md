# Release: <version> to <target>

## Want

- Version: <version>
- Target: <target> (production: yes / no)
- Artefact: <what is shipped, built from <commit>>
- Answering means: <the smoke assertions, one per line>
- Rollback: <the path, and what it restores>
- Key: <who gave the go, for this version and this target, and when; or
  "non-production, on the handoff">

## Proof

- Deploy tests: <runner, seen red, green on a stand-in, green>
- Rollback rehearsed: <target, previous version answered: yes / no>
- Shipped: <time>
- Smoke: <result as a run just made>
- Rollback executed: <no / yes, because <failure>>

## Handoff

- Handed back: <nothing / to the developer, with <failure>>
- Next: <retro on this use>
