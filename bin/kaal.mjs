#!/usr/bin/env node
// The league's own tool: Kaal's moves. One entry point, one command, one exit
// code. Findings go to stderr one per line; a summary goes to stdout. It reads
// the whole league and no consumer needs it; a skill's own scripts live in the
// skill and never call this.
//
//   node bin/kaal.mjs ledger [root]   every rung has its evidence
//   node bin/kaal.mjs check  [dir]    every skill obeys the skill rules
//   node bin/kaal.mjs retros          unconsumed retros per skill
import { join } from "node:path";
import { checkLedgers } from "./lib/ledger.mjs";
import { checkSkills } from "./lib/rules.mjs";
import { countRetros } from "./lib/retros.mjs";

const USAGE = "usage: kaal ledger [root] | check [dir] | retros";
const [cmd, arg] = process.argv.slice(2);
const cwd = process.cwd();
let findings = [];

if (cmd === "ledger") {
  findings = checkLedgers(arg ?? cwd).map(
    (f) => `${f.skill}: ${f.move} ${f.message}`,
  );
  if (!findings.length) console.log("ledger: every rung evidenced");
} else if (cmd === "check") {
  findings = checkSkills(arg ?? join(cwd, "skills")).map(
    (f) => `${f.skill}: ${f.rule}: ${f.message}`,
  );
  if (!findings.length) console.log("check: every skill obeys the rules");
} else if (cmd === "retros") {
  for (const r of countRetros(cwd))
    console.log(`${r.skill}: ${r.count} unconsumed`);
} else {
  console.error(USAGE);
  process.exit(1);
}
for (const f of findings) console.error(f);
process.exit(findings.length ? 1 : 0);
