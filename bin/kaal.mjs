#!/usr/bin/env node
// The league's own tool: Kaal's moves. One entry point, one command, one exit
// code. Findings go to stderr one per line; a summary goes to stdout. It reads
// the whole league and no consumer needs it; a skill's own scripts live in the
// skill and never call this.
//
//   node bin/kaal.mjs ledger [root]   every rung has its evidence
//   node bin/kaal.mjs check  [dir]    every skill obeys the skill rules
//   node bin/kaal.mjs release <version>   whether this tree may be released as that version
//   node bin/kaal.mjs retros [root] [--check]   unconsumed and read retros per skill
//   node bin/kaal.mjs agents [root]   every agent obeys the agent rules
//   node bin/kaal.mjs drawings [root] every drawing holds the template's shape
//   node bin/kaal.mjs fixtures [root] every fixture artefact, by shape
//   node bin/kaal.mjs standard [file] the pinned spec against the live text (network)
//   node bin/kaal.mjs assess <target> [--output <path>]  a target descriptor, read only
//   node bin/kaal.mjs boundary        nothing under a guarded place writes, executes or reaches
//   node bin/kaal.mjs witness <dir> [--against <manifest>]  what a directory holds, or what moved
//   node bin/kaal.mjs runner <skill> <fixture> [--write | --check]   the two prompts and the frontmatter, from the tree
//   node bin/kaal.mjs runner --check   every RUNNER.md in the tree, current or stale
//   node bin/kaal.mjs gates [root]    every wall in kaal.config.json, one exit code
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
import { countRetros, readFindings } from "./lib/retros.mjs";
import { checkRelease } from "./lib/release.mjs";
import { runGates } from "./lib/gates.mjs";
import { runAcceptance, runContracts } from "./lib/acceptance.mjs";
import { checkAgents } from "./lib/agents.mjs";
import { checkDrawings } from "./lib/drawings.mjs";
import { checkTraces, checkShape, writePins } from "./lib/traces.mjs";
import {
  report as reviewReport,
  counts as reviewCounts,
  owes,
} from "./lib/reviews.mjs";
import { checkPlans, writeCounts, reach } from "./lib/plans.mjs";
import { readRun, isFresh, staleWhy, writeRuns } from "./lib/runs.mjs";
import { binding } from "./lib/targets.mjs";
import { asked, promote } from "./lib/promote.mjs";
import { rows as coverageRows, states } from "./lib/coverage.mjs";
import { listFixtures } from "./lib/fixtures.mjs";
import { compareSpec } from "./lib/standard.mjs";
import { appliesHere } from "./lib/applies.mjs";
import { readSeats, laneOf, paths, crossings, proofs } from "./lib/seats.mjs";
import { skillsIn, landingAt, copyInto } from "./lib/assemble.mjs";
import { renderTarget } from "./lib/assess/target.mjs";
import { refuseOutput } from "./lib/assess/paths.mjs";
import { writeDocument } from "./lib/assess/output.mjs";
import { checkBoundary } from "./lib/boundary.mjs";
import { render } from "./lib/witness/manifest.mjs";
import { compare } from "./lib/witness/compare.mjs";
import { renderRunner, runnerPath } from "./lib/runner.mjs";
import {
  defaultBase,
  resolves,
  changed,
  moved,
  versions,
  raised,
} from "./lib/class.mjs";

const USAGE =
  "usage: kaal ledger [root] | check [dir] | drawings [root] | fixtures [root] | standard [file] | runner <skill> <fixture> [--write | --check] | assess <target> [--output <path>] | boundary [root] | witness <dir> [--against <manifest>] | retros [root] [--check] | gates [root] | acceptance <files or globs...> | contracts <files or globs...> | agents [root] | class [root] [--against <ref>] | traces [root] [--write] | runs [root] [--write] | coverage [root] | seats [root] [--against <ref>] | assemble <directory> [skill...] | promote [root] [--into <target>] [--from <head>] | release <version>";
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
} else if (cmd === "traces") {
  // A root that may be a flag, the pair `class` and `retros` carry.
  const troot = arg && !arg.startsWith("-") ? arg : cwd;
  if (process.argv.includes("--write")) {
    const left = writePins(troot);
    writeCounts(troot);
    // What it did not do, because a tool that cleared a review would be
    // recording that somebody read something when nobody did.
    if (left) console.log(`traces: left ${left} pin(s) no review has cleared`);
  }
  // A pin that moved is a line and never a finding. It is printed before the
  // findings, on the way out rather than in the way, because a tree mid
  // handoff is a fact about the tree and not a defect in it.
  for (const line of reviewReport(troot)) console.log(line);
  findings = [
    ...checkTraces(troot),
    ...checkShape(troot),
    ...checkPlans(troot),
  ].map((f) => `${f.artefact}: ${f.kind}: ${f.message}`);
  // The counts whatever the answer, so a reader sees what is owed without
  // asking a second question, and sees it on a red tree too.
  const tally = reviewCounts(troot)
    .map((r) => `${r.count} ${r.state}`)
    .join(", ");
  // How far each plan reaches, whatever the findings say. A reader asking what
  // is covered is most often asking on a red tree, and a count that only
  // appears when everything is well is a count nobody sees when they need it.
  const reached = reach(troot)
    .map((r) => `${r.plan}: ${r.suites} suite(s), ${r.cases} case(s)`)
    .join("; ");
  if (reached) console.log(`traces: plans reach ${reached}`);
  console.log(
    findings.length
      ? `traces: pins: ${tally}`
      : `traces: every trace resolves; pins: ${tally}`,
  );
} else if (cmd === "seats") {
  // A root that may be a flag, the shape `class`, `traces` and `coverage`
  // carry, and the same base ref the class wall reads: a diff's lane is its
  // lane against what it will merge into.
  const sroot = arg && !arg.startsWith("-") ? arg : cwd;
  const at = process.argv.indexOf("--against");
  const base = at === -1 ? defaultBase(sroot) : process.argv[at + 1];
  const declaration = readSeats(sroot);
  const where = laneOf(sroot);
  const diff = paths(sroot, base);
  // Two questions can answer that they are not this tree's, and both exit 2
  // rather than passing: a tree with no branch and no base ref has not been
  // asked this question, and a wall that answered clean would be passing on
  // a lane nobody declared.
  const away = where.notApplicable ?? diff.notApplicable;
  if (away) {
    console.error(`seats: not applicable here: ${away}`);
    process.exit(2);
  }
  // And the third: a promotion carries every seat's work by design, so the
  // question this rule asks has no true answer about it. The exit is 2 and
  // not 0, because a clean answer would read as a diff that is one lane's.
  if (where.promotion) {
    console.error(`seats: not applicable here: ${where.promotion}`);
    process.exit(2);
  }
  // A branch nobody declared, carrying a change nobody can place. Silent
  // here would be the vacuous pass: the diff may be one seat's and still
  // belong to no lane at all.
  if (!where.lane && diff.paths.length)
    findings = [
      ...declaration.findings,
      `${where.branch}: matches no lane (${declaration.lanes.map((l) => l.pattern).join(", ")})`,
    ];
  else {
    const crossed = crossings(diff.paths, where.lane, declaration);
    const moved = proofs(sroot, diff.paths, where);
    console.log(
      where.lane
        ? `lane ${where.lane.pattern} (${where.lane.seat ?? "no seat"})`
        : `lane none: ${where.branch} carries no change to place`,
    );
    for (const line of crossed.lines) console.log(line);
    findings = [
      ...declaration.findings,
      ...crossed.findings,
      ...moved.findings,
    ];
  }
  if (!findings.length) console.log("seats: this diff is one lane's");
} else if (cmd === "assemble") {
  // The one command a consumer of the package runs rather than a seat of the
  // league. It reads the package it is standing in and writes into a tree it
  // was pointed at, which is the opposite direction from every wall here, so
  // it names what it wrote and writes nowhere else.
  const dest = arg;
  const only = process.argv.slice(4);
  if (!dest) {
    console.error(USAGE);
    process.exit(1);
  }
  const found = skillsIn(cwd, only);
  if (found.notApplicable) {
    console.error(`assemble: not applicable here: ${found.notApplicable}`);
    process.exit(2);
  }
  findings = found.findings ?? [];
  if (!findings.length)
    for (const { name, dir } of found.skills) {
      const landing = landingAt(dest, name);
      if (landing.findings) {
        findings.push(...landing.findings);
        continue;
      }
      const wrote = copyInto(dir, landing.path);
      console.log(
        `assemble: ${name}: ${wrote.length} file(s) to ${landing.path}`,
      );
    }
  if (!findings.length)
    console.log(
      `assemble: ${found.skills.length} member(s) of the league are in ${dest}`,
    );
} else if (cmd === "coverage") {
  // A root that may be a flag, the shape `class`, `traces` and `runs` carry.
  // It answers or says the question is not this tree's, and never finds: a
  // gap is a fact about how far the work has got and not a finding.
  const croot = arg && !arg.startsWith("-") ? arg : cwd;
  for (const line of coverageRows(croot)) console.log(line);
} else if (cmd === "runs") {
  // A root that may be a flag, the pair `class` and `traces` carry.
  const rroot = arg && !arg.startsWith("-") ? arg : cwd;
  if (process.argv.includes("--write")) {
    const written = writeRuns(rroot);
    console.log(
      written.length
        ? `runs: recorded ${written.length} (${written.join(", ")})`
        : "runs: nothing green to record",
    );
  } else {
    // Reading only: what is on record, and whether each record is still
    // about the suite it names. The verdict itself belongs to the walls,
    // which run the suites; this says what evidence exists.
    const tasks = readdirSync(join(rroot, "requirements"), {
      withFileTypes: true,
    })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    for (const task of tasks) {
      const run = readRun(rroot, task);
      // The reason whatever the record, because a task with no record can
      // still owe a reading and that is the half this report used to hide.
      const unread = owes(rroot, task);
      const owed = unread.length
        ? `${unread.length} pin(s) await a review: ${unread.join("; ")}`
        : null;
      // No verdict here, and no counts: this path opens no suite. It used to
      // borrow one by calling `verdict` with one pass and no failures, and a
      // task with no record then read `green, and no run has recorded it
      // yet`, which is a wall's sentence about a suite it had run. `push-v1`
      // is red and read green for as long as that stood.
      const said = !run
        ? "no record"
        : run.why
          ? run.why
          : !isFresh(rroot, run)
            ? staleWhy(run)
            : (owed ?? "on record");
      console.log(
        `runs: ${task}: ${said === owed ? owed : [said, owed].filter(Boolean).join("; ")}`,
      );
    }
  }
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
  const found = checkBoundary(arg ?? cwd);
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
} else if (cmd === "release") {
  // A refusal, not a release. It is asked about the working directory
  // whatever it was handed, the way `runner` is and for the same reason:
  // its argument is a version, never a path, and a reason naming a
  // directory called "0.0.1" would be a plausible lie.
  const [version] = process.argv.slice(3);
  if (!version) {
    console.error(usage);
    process.exit(1);
  }
  const r = checkRelease(cwd, version);
  for (const l of r.lines) console.log(l);
  if (!r.ok) process.exit(1);
} else if (cmd === "retros") {
  // Two lines a skill, adjacent and unconsumed first: ten closed tests read
  // the first line anchored, so it keeps its shape and the read count is a
  // line of its own. `--check` is the board's form: the findings and
  // nothing else, because a wall that prints twelve numbers it does not
  // judge is noise on a board a person reads at a glance.
  const check = process.argv.includes("--check");
  // A flag is not a directory, the same reading `applies.mjs` does for this
  // command and for `class`.
  const root = arg && !arg.startsWith("-") ? arg : cwd;
  if (!check)
    for (const r of countRetros(root)) {
      console.log(`${r.skill}: ${r.count} unconsumed`);
      console.log(`${r.skill}: ${r.read} read`);
    }
  const findings = readFindings(root);
  for (const f of findings)
    console.log(`${f.retro}: reads ${f.name}, which is no skill in this tree`);
  if (findings.length) process.exit(1);
} else if (cmd === "acceptance" || cmd === "contracts") {
  const run = cmd === "acceptance" ? runAcceptance : runContracts;
  const a = run(process.argv.slice(3));
  for (const l of a.lines) console.log(l);
  console.log(a.summary);
  console.log(`# pass ${a.passed}`);
  process.exit(a.ok ? 0 : 1);
} else if (cmd === "class") {
  // What class of change this is: which of the three artefacts a consumer can
  // notice moved, and whether the version rose past the place this repository
  // moves on its own. A move of the surface is reported and never refused
  // while the minor and major places are zero; that is what 0.0.x means, and
  // refusing it would put a human in the loop for every new command.
  const rest = process.argv.slice(3);
  const flag = rest.indexOf("--against");
  if (flag >= 0 && !rest[flag + 1]) {
    console.error(USAGE);
    process.exit(1);
  }
  const tree = arg && !arg.startsWith("-") ? arg : cwd;
  const base = flag >= 0 ? rest[flag + 1] : defaultBase(tree);
  // A base that is not in this tree is the same answer as no history at all:
  // there is genuinely nothing to compare against, which is what exit 2 says.
  if (!resolves(tree, base)) {
    console.error(`class: not applicable here: no ref ${base} in ${tree}`);
    process.exit(2);
  }
  const { from, to } = versions(tree, base);
  if (raised(from, to)) {
    console.error(
      `class: ${from} to ${to} moves a place this repository does not move: the raise is the human's`,
    );
    process.exit(1);
  }
  const artefacts = moved(changed(tree, base));
  for (const a of artefacts) console.log(`class: ${a} moved`);
  if (!artefacts.length) console.log("class: nothing a consumer notices moved");
  process.exit(0);
} else if (cmd === "gates") {
  const groot = arg && !arg.startsWith("-") ? arg : cwd;
  const g = runGates(groot);
  for (const l of g.lines) console.log(l);
  console.log(g.summary);
  // The board reports and the promotion refuses. A wall's colour is the same
  // fact at both targets; what differs is whether the fact stops a merge.
  // Below the promotion a seat is still working and can see the red; above it
  // a consumer installs, so nothing red passes. The target is the one the
  // tree opens into, which is the same reading the lane rule takes.
  // Told and never guessed. Asking the tree which refs it holds would make a
  // fixture inside this clone inherit this clone's targets and be judged
  // leniently for having a parent, and it made `waiver-v1` green on a red
  // board the first time this was written. No answer is the strict answer.
  const into = (process.env.KAAL_BASE ?? "").replace(/^origin\//, "").trim();
  if (!g.ok && !binding(into)) {
    // The count in its own words, because the summary's numbers are the walls
    // there are and the walls that failed, and a reader of this line wants
    // the second said as what it is.
    const red = (g.results ?? []).filter((x) => !x.ok && !x.waived).length;
    console.log(
      `gates: ${into} takes this: ${red} red wall(s), each a block with an owner`,
    );
  }
  process.exit(g.ok || !binding(into) ? 0 : 1);
} else if (cmd === "promote") {
  // Whether this tree may reach the target it is asked about, and everything
  // that refuses it. Nothing stops at the first: a gate that did would turn
  // one merge into four.
  const proot = arg && !arg.startsWith("-") ? arg : cwd;
  const what = asked(process.argv.slice(2));
  if (what.usage) {
    console.error(`promote: ${what.usage}`);
    process.exit(1);
  }
  if (what.why) {
    console.error(`promote: not applicable here: ${what.why}`);
    process.exit(2);
  }
  console.log(`promote: into ${what.into}`);
  const r = promote(proot, what);
  for (const f of r.findings)
    console.log(`${f.artefact}: ${f.kind}: ${f.message}`);
  console.log(
    `promote: ${r.red} red wall(s) on the board` +
      (binding(what.into) ? "" : `, which ${what.into} takes`),
  );
  console.log(
    r.count
      ? `promote: into ${what.into}: ${r.count} finding(s)`
      : `promote: into ${what.into}: nothing refuses this`,
  );
  process.exit(r.count ? 1 : 0);
} else {
  console.error(USAGE);
  process.exit(1);
}
if (cmd !== "standard") {
  for (const f of findings) console.error(f);
  process.exit(findings.length ? 1 : 0);
}
