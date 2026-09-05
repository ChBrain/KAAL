#!/usr/bin/env node
// The league's own tool: Kaal's moves. One entry point, one command, one exit
// code. Findings go to stderr one per line; a summary goes to stdout. It reads
// the whole league and no consumer needs it; a skill's own scripts live in the
// skill and never call this.
//
//   node bin/kaal.mjs ledger [root]   every rung has its evidence
//   node bin/kaal.mjs check  [dir]    every skill obeys the skill rules
//   node bin/kaal.mjs retros          unconsumed retros per skill
//   node bin/kaal.mjs agents [root]   every agent obeys the agent rules
//   node bin/kaal.mjs gates           every wall in kaal.config.json, one exit code
//   node bin/kaal.mjs acceptance <files or globs...>   judged by each requirement's status
//   node bin/kaal.mjs contracts  <files or globs...>   judged by each drawing's task
import { join } from "node:path";
import { checkLedgers } from "./lib/ledger.mjs";
import { checkSkills } from "./lib/rules.mjs";
import { countRetros } from "./lib/retros.mjs";
import { runGates } from "./lib/gates.mjs";
import { runAcceptance, runContracts } from "./lib/acceptance.mjs";
import { checkAgents } from "./lib/agents.mjs";

const USAGE =
  "usage: kaal ledger [root] | check [dir] | retros | gates | acceptance <files or globs...> | contracts <files or globs...> | agents [root]";
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
} else if (cmd === "agents") {
  findings = checkAgents(arg ?? cwd).map(
    (f) => `${f.agent}: ${f.rule}: ${f.message}`,
  );
  if (!findings.length) console.log("agents: every agent obeys the rules");
} else if (cmd === "retros") {
  for (const r of countRetros(cwd))
    console.log(`${r.skill}: ${r.count} unconsumed`);
} else if (cmd === "acceptance") {
  const a = runAcceptance(process.argv.slice(3));
  for (const l of a.lines) console.log(l);
  console.log(a.summary);
  process.exit(a.ok ? 0 : 1);
} else if (cmd === "contracts") {
  const a = runContracts(process.argv.slice(3));
  for (const l of a.lines) console.log(l);
  console.log(a.summary);
  process.exit(a.ok ? 0 : 1);
} else if (cmd === "gates") {
  const g = runGates(cwd);
  for (const l of g.lines) console.log(l);
  console.log(g.summary);
  process.exit(g.ok ? 0 : 1);
} else {
  console.error(USAGE);
  process.exit(1);
}
for (const f of findings) console.error(f);
process.exit(findings.length ? 1 : 0);
