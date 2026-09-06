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
//   node bin/kaal.mjs drawings [root] every drawing holds the template's shape
//   node bin/kaal.mjs fixtures [root] every fixture artefact, by shape
//   node bin/kaal.mjs standard [file] the pinned spec against the live text (network)
//   node bin/kaal.mjs assess <target> [--output <path>]  a target descriptor, read only
//   node bin/kaal.mjs boundary        nothing under a guarded place writes, executes or reaches
//   node bin/kaal.mjs witness <dir> [--against <manifest>]  what a directory holds, or what moved
//   node bin/kaal.mjs runner <skill> <fixture> [--write | --check]   the two prompts and the frontmatter, from the tree
//   node bin/kaal.mjs runner --check   every RUNNER.md in the tree, current or stale
//   node bin/kaal.mjs gates           every wall in kaal.config.json, one exit code
//   node bin/kaal.mjs acceptance <files or globs...>   judged by each requirement's status
//   node bin/kaal.mjs contracts  <files or globs...>   judged by each drawing's task
import { join, relative, sep, resolve, dirname } from "node:path";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { checkLedgers, standings } from "./lib/ledger.mjs";
import { checkSkills } from "./lib/rules.mjs";
import { countRetros } from "./lib/retros.mjs";
import { runGates } from "./lib/gates.mjs";
import { runAcceptance, runContracts } from "./lib/acceptance.mjs";
import { checkAgents } from "./lib/agents.mjs";
import { checkDrawings } from "./lib/drawings.mjs";
import { listFixtures } from "./lib/fixtures.mjs";
import { compareSpec } from "./lib/standard.mjs";
import { appliesHere } from "./lib/applies.mjs";
import { renderTarget } from "./lib/assess/target.mjs";
import { refuseOutput } from "./lib/assess/paths.mjs";
import { writeDocument } from "./lib/assess/output.mjs";
import { checkBoundary } from "./lib/boundary.mjs";
import { render } from "./lib/witness/manifest.mjs";
import { compare } from "./lib/witness/compare.mjs";
import { renderRunner, runnerPath } from "./lib/runner.mjs";

const USAGE =
  "usage: kaal ledger [root] | check [dir] | drawings [root] | fixtures [root] | standard [file] | runner <skill> <fixture> [--write | --check] | assess <target> [--output <path>] | boundary | witness <dir> [--against <manifest>] | retros | gates | acceptance <files or globs...> | contracts <files or globs...> | agents [root]";
const [cmd, arg] = process.argv.slice(2);
const league = join(dirname(fileURLToPath(import.meta.url)), "..");
const cwd = process.cwd();
let findings = [];

// Before anything is read: is this tree's question the one the command asks?
// A tree that holds none of the artefact a command reads has not adopted the
// league for that question, and the honest answer is that it does not apply,
// on its own exit code, so a caller reading only the code never takes a non
// answer for a pass.
const notApplicable = appliesHere(cmd, arg ?? null, cwd);
if (notApplicable) {
  console.error(`${cmd}: not applicable here: ${notApplicable}`);
  process.exit(2);
}

if (cmd === "ledger") {
  for (const s of standings(arg ?? cwd)) {
    console.log(
      `${s.skill}: ${s.move}: candidate skill, ${s.fresh} of ${s.need} fresh models`,
    );
    for (const x of s.stale) console.log(`  stale: ${x.file} (${x.why})`);
  }
  findings = checkLedgers(arg ?? cwd).map(
    (f) => `${f.skill}: ${f.move} ${f.message}`,
  );
  if (!findings.length) console.log("ledger: every rung evidenced");
} else if (cmd === "drawings") {
  findings = checkDrawings(arg ?? cwd).map(
    (f) => `${f.task}: ${f.rule}: ${f.message}`,
  );
  if (!findings.length) console.log("drawings: every drawing holds its shape");
} else if (cmd === "standard") {
  const r = await compareSpec(cwd, arg ?? null);
  if (r.same) console.log(`standard: the pinned spec is unchanged (${r.live})`);
  else
    console.error(
      `standard: the spec drifted from the pin: live ${r.live}, pinned ${r.pinned} (${r.from}); reconcile the mirror rule by rule, then re-pin`,
    );
  // No exit call after a fetch: the process ends when the fetch's handles
  // have closed. An exit call here dies on Windows with a libuv assertion.
  process.exitCode = r.same ? 0 : 1;
} else if (cmd === "runner") {
  const [skill, fixture, flag] = process.argv.slice(3);
  // The sweep: the same act over every fixture that carries a runner. A
  // fixture with none is not stale and is not named; a runner is opt-in
  // until a fixture has earned one.
  if (skill === "--check" && !fixture) {
    let stale = 0;
    for (const sk of readdirSync(join(cwd, "skills"))) {
      const fixtures = join(cwd, "skills", sk, "fixtures");
      if (!existsSync(fixtures)) continue;
      for (const fx of readdirSync(fixtures)) {
        const file = join(fixtures, fx, "RUNNER.md");
        if (!existsSync(file)) continue;
        const shown = `skills/${sk}/fixtures/${fx}/RUNNER.md`;
        if (readFileSync(file, "utf8") === renderRunner(cwd, sk, fx))
          console.log(`runner: ${shown} is current`);
        else {
          console.error(`runner: ${shown} is stale`);
          stale++;
        }
      }
    }
    process.exit(stale ? 1 : 0);
  }
  if (
    !skill ||
    !fixture ||
    (flag && flag !== "--write" && flag !== "--check")
  ) {
    console.error(USAGE);
    process.exit(1);
  }
  const doc = renderRunner(cwd, skill, fixture);
  const file = runnerPath(cwd, skill, fixture);
  if (flag === "--write") {
    writeFileSync(file, doc);
    console.log(`runner: wrote ${relative(cwd, file).split(sep).join("/")}`);
  } else if (flag === "--check") {
    const shown = relative(cwd, file).split(sep).join("/");
    if (!existsSync(file)) {
      console.error(
        `runner: ${shown} is missing; run kaal runner ${skill} ${fixture} --write`,
      );
      process.exit(1);
    }
    if (readFileSync(file, "utf8") !== doc) {
      console.error(
        `runner: ${shown} is stale; run kaal runner ${skill} ${fixture} --write`,
      );
      process.exit(1);
    }
    console.log(`runner: ${shown} is current`);
  } else process.stdout.write(doc);
  process.exit(0);
} else if (cmd === "assess") {
  // Read only, and the output path is judged before anything is read: a
  // refusal that comes after a read has already read.
  const rest = process.argv.slice(3);
  const flag = rest.indexOf("--output");
  if (!rest[0] || (flag >= 0 && !rest[flag + 1])) {
    console.error(USAGE);
    process.exit(1);
  }
  const target = resolve(rest[0]);
  const out = flag >= 0 ? resolve(rest[flag + 1]) : null;
  const refusal = refuseOutput(out, { league, target });
  if (refusal) {
    console.error(refusal);
    process.exit(1);
  }
  const doc = renderTarget(target);
  if (out) writeDocument(out, doc);
  else process.stdout.write(doc);
  process.exit(0);
} else if (cmd === "boundary") {
  const found = checkBoundary(cwd);
  for (const f of found)
    console.error(`boundary: ${f.where}/${f.file} ${f.verb}`);
  if (!found.length) console.log("boundary: the guarded trees only read");
  process.exit(found.length ? 1 : 0);
} else if (cmd === "witness") {
  // Reads only, in both forms, and the boundary wall holds the modules to
  // that: the whole point of the command is that the tree it was pointed at
  // is the same afterwards. Not in the applicability table, because a tree
  // holding nothing of the league can still be witnessed.
  const rest = process.argv.slice(3);
  const flag = rest.indexOf("--against");
  if (!rest[0] || (flag >= 0 && !rest[flag + 1])) {
    console.error(USAGE);
    process.exit(1);
  }
  const dir = resolve(rest[0]);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    console.error(`witness: ${rest[0]} is not a directory`);
    process.exit(1);
  }
  if (flag < 0) {
    const doc = render(dir);
    if (doc) console.log(doc);
    process.exit(0);
  }
  const manifest = rest[flag + 1];
  let text;
  try {
    text = readFileSync(manifest, "utf8");
  } catch {
    console.error(`witness: ${manifest} cannot be read`);
    process.exit(1);
  }
  let moved;
  try {
    moved = compare(dir, text);
  } catch (e) {
    console.error(`witness: ${manifest} is not a manifest: ${e.message}`);
    process.exit(1);
  }
  for (const m of moved) console.log(`${m.verb}: ${m.path}`);
  if (!moved.length) console.log("witness: nothing moved");
  process.exit(moved.length ? 1 : 0);
} else if (cmd === "fixtures") {
  // Not guarded by applicability: a listing that finds nothing has an answer,
  // and code-v2 fixed it as a refusal, so an empty list is never mistaken for
  // a run against the right root.
  const found = listFixtures(arg ?? cwd);
  for (const x of found) console.log(`${x.shape} ${x.path}`);
  if (!found.length) {
    console.error(`fixtures: none found under ${arg ?? cwd}`);
    process.exit(1);
  }
  process.exit(0);
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
} else if (cmd === "acceptance" || cmd === "contracts") {
  const run = cmd === "acceptance" ? runAcceptance : runContracts;
  const a = run(process.argv.slice(3));
  for (const l of a.lines) console.log(l);
  console.log(a.summary);
  console.log(`# pass ${a.passed}`);
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
if (cmd !== "standard") {
  for (const f of findings) console.error(f);
  process.exit(findings.length ? 1 : 0);
}
