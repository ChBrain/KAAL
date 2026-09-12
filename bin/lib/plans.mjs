// The plans wall: the third question `kaal traces` asks of a tree. Every wall
// that runs tests has one plan, every plan is about one wall, and a plan's
// stated number of suites is what its globs match. It reads the plan pages
// and the board's own config, and it writes nothing unless asked.
//
// It is its own module and not a branch of the trace wall on purpose: the
// two functions beside it return findings three closed contracts read, and
// folding a third question into one of them changes what those contracts
// mean by a finding. That cost four red tests once already.
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  globSync,
} from "node:fs";
import { join } from "node:path";
import { splitTrace } from "./traces.mjs";
import { parseFrontmatter } from "./frontmatter.mjs";
import { spawnSync } from "node:child_process";
import { caseEnv } from "./gates.mjs";

/** The place the plans live in, below the test tree's own root page. */
export const PLANS = join("tests", "plans");
/** A gate runs tests when it names a file ending in this. */
const SUITE = /\.test\.mjs$/;
/**
 * A glob a plan names for its suites, in backticks, the way its criterion's
 * own test reads it. Backticks and not bare words, because a plan is prose
 * and a bare path in a sentence is a path a sentence happens to contain.
 */
const GLOB = /`([^`]*\*[^`]*\.test\.mjs)`/g;
/**
 * The number a plan states, which is a count of suites and says so. Read from
 * the plan's prose and never from its frontmatter, and the separator is a
 * space and never a line.
 *
 * A pin is a sha and a sha ends in a digit as often as not. The line after a
 * plan's `parent` pin is the `suites:` block, so every page here holds
 * `1\nsuites:`, and a pattern whose `\s` crossed a line read that digit as
 * the number the plan stated: all three plans answered 1 and not one of them
 * states a count at all. The writer then replaced what it had matched,
 * collapsing the newline, so the sha lost its last character and the
 * `suites:` key was pulled onto the pin's line. Every line below shifted up
 * by one, the page still parsed, and no wall said a word.
 */
const COUNT = /(\d+)[ \t]+suite/;
/** A page's prose, which is everything below the frontmatter block. */
const prose = (text) => {
  try {
    return parseFrontmatter(text).body;
  } catch {
    // A page with no block is all prose. The trace wall is what reports that,
    // and a reader that threw here would make this one's answer depend on a
    // rule it does not hold.
    return text;
  }
};

/**
 * The gates that owe a plan, each with the globs it runs, sorted so two
 * lists of the same globs compare equal whatever order a command wrote them.
 *
 * Read from the command and never declared beside it: a field saying "this
 * one owes a plan" could be deleted, and a check a tree can switch off is
 * not a check. The predicate is an argument ending in `.test.mjs` rather
 * than a `*.test.mjs` glob, because the star sits in the middle of two of
 * this league's three and the narrower reading finds only the third.
 * @param {string} root
 */
/**
 * The cases a plan reaches, through the suites it names: each once, because a
 * case two of its suites name is one case, and sorted, so the answer is the
 * same twice. A suite the plan names that is not there is walked past; the
 * trace wall is what reports a name resolving to nothing.
 * @param {string} root @param {string} plan
 */
export function casesOf(root, plan) {
  const page = planPages(root).find((p) => p.name === plan);
  if (!page) return [];
  const want = new Set(planSuites(page.text).names);
  const out = new Set();
  for (const s of suitePages(root))
    if (want.has(s.name)) for (const c of s.cases) out.add(c);
  return [...out].sort();
}

/**
 * A case this plan reaches that a wall may not run. Today that is a path
 * under `evals/`: a model's reading cannot be re-run to the same answer
 * twice, so it is evidence and never a gate. Asked about one plan and never
 * about the tree, because that is the scope the criterion has; whether it
 * should be wider is the analyst's.
 * @param {string} root @param {string} plan
 */
export function unrunnable(root, plan) {
  return casesOf(root, plan)
    .filter((c) => c.startsWith("evals/"))
    .map((c) => ({
      artefact: `plans/${plan}`,
      kind: "plan",
      message: `reaches ${c}, which is a model's reading and never a case`,
    }));
}

/**
 * Run these cases and say what came back. Nothing to run is not a run that
 * passed: a selection reaching no case is the vacuous green this league has a
 * task about, so it answers red with a count of nothing.
 *
 * Asked once over all of them, and again file by file only where that failed.
 * The runner flattens several files into one stream of test names and never
 * says which file a name came from, so the fast answer and the exact answer
 * are two different runs, and the exact one is only ever wanted when
 * something is already wrong.
 * @param {string} root @param {string[]} paths
 */
export function runCases(root, paths) {
  if (!paths.length) return { ok: false, cases: 0, red: [] };
  // `caseEnv` clears the runner's own marker. Without it a run started from
  // inside `node --test` reports as a subtest of its parent and exits 0
  // whatever happened, which is green on nothing. It clears the target this
  // tree is judged by for the same reason: a case asks about the tree it
  // built, and a board it spawns must not read this one's.
  const run = (files) =>
    spawnSync(process.execPath, ["--test", "--test-reporter=tap", ...files], {
      cwd: root,
      encoding: "utf8",
      env: caseEnv(),
    });
  if (run(paths).status === 0)
    return { ok: true, cases: paths.length, red: [] };
  return {
    ok: false,
    cases: paths.length,
    red: paths.filter((f) => run([f]).status !== 0),
  };
}

/**
 * The line the board prints about what a plan protects, each case by its
 * path, so a reader sees the selection without opening the plan, its suites
 * and the cases in turn.
 * @param {string} root @param {string} plan
 */
export function reached(root, plan) {
  const cases = casesOf(root, plan);
  return cases.length
    ? `traces: ${plan} reaches: ${cases.join(", ")}`
    : `traces: ${plan} reaches no case`;
}

export function testGates(root) {
  const p = join(root, "kaal.config.json");
  if (!existsSync(p)) return [];
  let config;
  try {
    config = JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return [];
  }
  return (config.gates ?? [])
    .map((g) => {
      const words = (g.command ?? "").split(/\s+/);
      const globs = words.filter((a) => SUITE.test(a)).sort();
      return {
        name: g.name,
        globs,
        // The second shape. A gate whose command names a plan runs what that
        // plan picks, which is a wall that runs tests as much as a glob is,
        // and the plans wall's rule is about walls that run tests. Read from
        // the command rather than declared in a field beside it, because a
        // field would put the pairing back in the lane this is moving it out
        // of. Asked only of a gate carrying no glob: a gate that globs its
        // files says what it runs without reading a plan at all, and the
        // three that do carry a subcommand spelled like the plan about them,
        // which this would otherwise read as a reference.
        plan: globs.length
          ? undefined
          : words.find((a) =>
              existsSync(join(root, "tests", "plans", `${a}.md`)),
            ),
      };
    })
    .filter((g) => g.globs.length || g.plan);
}

/** Every plan page, named by its file and read whole. @param {string} root */
export function planPages(root) {
  const d = join(root, PLANS);
  if (!existsSync(d)) return [];
  return readdirSync(d)
    .filter((n) => n.endsWith(".md"))
    .sort()
    .map((n) => ({
      name: n.slice(0, -3),
      path: join(d, n),
      text: readFileSync(join(d, n), "utf8"),
    }));
}

/**
 * What a plan says it is about, or null where it says nothing. Read as
 * `Wall:` followed by a name, backticked or not, wherever it appears: a plan
 * is prose and its wall is a word in a sentence as often as a field.
 */
const WALL = /(?:^|\s)Wall:\s*`?([A-Za-z0-9_-]+)`?/;
export const wallOf = (text) => text.match(WALL)?.[1] ?? null;
/** The globs a plan names, sorted, so they compare against a gate's. */
export const globsOf = (text) =>
  [...text.matchAll(GLOB)].map((m) => m[1]).sort();
/** What a plan says its globs match, or null where it says no number. */
export const countOf = (text) => {
  const n = prose(text).match(COUNT)?.[1];
  return n === undefined ? null : Number(n);
};
/** What they match now. A glob is read from the root, never from the cwd. */
export const suitesUnder = (root, globs) =>
  globs.flatMap((g) => globSync(g, { cwd: root })).length;

/**
 * @param {string} root
 * @returns {{ artefact: string, kind: string, message: string }[]}
 */
export function checkPlans(root) {
  const out = [];
  // Two kinds, because there are two questions and a plan file is usually
  // named for its wall: `acceptance` the page and `acceptance` the wall
  // would otherwise print the same prefix twice and mean different things.
  const find = (artefact, message) =>
    out.push({ artefact, kind: "plan", message });
  const findWall = (artefact, message) =>
    out.push({ artefact, kind: "wall", message });
  const findSuite = (artefact, message) =>
    out.push({ artefact, kind: "suite", message });
  const gates = testGates(root);
  const byName = new Map(gates.map((g) => [g.name, g]));
  const pages = planPages(root);

  // A plan's own end of it: it is about one wall, and about that wall's
  // suites. Each finding stops this page, because a plan whose wall does not
  // exist has no globs to be judged against.
  for (const p of pages) {
    const wall = wallOf(p.text);
    if (!wall) {
      find(p.name, "carries no `- Wall:` line, so it is a plan about nothing");
      continue;
    }
    const gate = byName.get(wall);
    if (!gate) {
      find(
        p.name,
        `is about the wall ${wall}, which no gate in kaal.config.json holds`,
      );
      continue;
    }
    // A glob a plan still carries was its whole claim once and is a leftover
    // now: a plan picks suites, and a selection owns neither a place nor a
    // number. Inside the loop and after the two above, because each finding
    // stops its page: a plan whose wall does not exist has nothing for a
    // glob to be wrong about.
    const [leftover] = planSuites(p.text).findings;
    if (leftover) {
      find(p.name, leftover);
      continue;
    }
    // A plan picking nothing protects nothing, in the words a suite naming no
    // case already answers. Asked of a plan whose gate names it and not of
    // every plan: a gate that globs its files says what it runs on its own,
    // and a gate that names a plan runs what that plan picks and nothing
    // else, so an empty selection there is a wall over nothing. Which plans
    // those are is read off the gate and never written down a second time.
    if (gate.plan === p.name && !planSuites(p.text).names.length)
      find(p.name, "names no suite");
  }

  // The wall's end of it, reported in its own words: which end is missing is
  // the thing a reader needs, so the two directions never share a sentence.
  for (const g of gates) {
    const named = pages.filter((p) => wallOf(p.text) === g.name);
    if (!named.length)
      findWall(g.name, "is a wall that runs tests and no plan is about it");
    // The other way round, and the finding names the wall rather than either
    // page: two plans about one wall are a pair, and neither of the two is
    // wrong on its own. A refactor dropped this branch once, and nothing said
    // so, because the suite that guards it was red for want of a record.
    else if (named.length > 1)
      findWall(
        g.name,
        `is the wall of ${named.length} plans: ${named.map((p) => p.name).join(", ")}`,
      );
  }

  // The suites' end of it. A suite is read for what it covers, each case is
  // asked whether anything owns where it sits, and the tree is asked back
  // whether a case it holds is covered at all. Its own kind, `suite`, because
  // a finding about a suite is not a finding about the plan that uses it and
  // a reader needs to know which page to open.
  const held = owners(root);
  const named = new Set();
  for (const suite of suitePages(root)) {
    const at = `suites/${suite.name}`;
    if (!suite.cases.length) {
      findSuite(at, "names no case");
      continue;
    }
    for (const path of suite.cases) {
      named.add(path);
      const why = caseOwner(path, held);
      if (why) findSuite(at, why);
    }
  }
  for (const path of unnamed(root, named))
    findSuite("suites", `${path}: no suite names it`);

  return out;
}

/**
 * Rewrite each plan's stated count to what its globs match now, the way
 * `--write` rewrites a trace's shas. A plan whose wall or globs are wrong is
 * left alone: writing a number into a page that is about the wrong thing
 * would hide the finding that says so.
 * @param {string} root
 */
export function writeCounts(root) {
  const gates = new Map(testGates(root).map((g) => [g.name, g]));
  const written = [];
  for (const p of planPages(root)) {
    const gate = gates.get(wallOf(p.text) ?? "");
    if (!gate) continue;
    const globs = globsOf(p.text);
    if (globs.join(" ") !== gate.globs.join(" ")) continue;
    const found = suitesUnder(root, globs);
    if (countOf(p.text) === found) continue;
    // The replacement is made in the prose and put back below the block, so a
    // page whose only digit before the word is inside a pin is left whole.
    const body = prose(p.text);
    const next = p.text.replace(body, body.replace(COUNT, `${found} suite`));
    if (next === p.text) continue;
    writeFileSync(p.path, next);
    written.push(p.name);
  }
  return written;
}

/** The place a suite lives in, beside the plans and below the same root. */
export const SUITES = join("tests", "suites");

/**
 * The names in one trace field of a page's frontmatter, by the trace
 * grammar's own rules: a comma list, a pin stripped, and `nothing` or `none`
 * naming none. Read from the text rather than through the frontmatter parser
 * because this module answers about pages the trace wall has not read yet.
 * @param {string} text @param {string} key
 */
const listOf = (text, key) => {
  // A block of its own, one entry to a line, or a comma list on a line
  // inside `traces:`. The block is read first, because a page carrying both
  // shows a reader the block.
  const block = text.match(
    new RegExp(`^${key}:\\s*$([\\s\\S]*?)^(?=\\S|---)`, "m"),
  );
  if (block) return [...block[1].matchAll(/^ {2}(\S+?):/gm)].map((m) => m[1]);
  return splitTrace(
    text.match(new RegExp(`^\\s+${key}:\\s*(.*)$`, "m"))?.[1],
  ).map((e) => e.name);
};

/**
 * One entry per suite page: its name and the cases it covers.
 * @param {string} root
 * @returns {{ name: string, cases: string[] }[]}
 */
export function suitePages(root) {
  const d = join(root, SUITES);
  if (!existsSync(d)) return [];
  return readdirSync(d)
    .filter((n) => n.endsWith(".md"))
    .sort()
    .map((n) => ({
      name: n.slice(0, -3),
      cases: listOf(readFileSync(join(d, n), "utf8"), "cases"),
    }));
}

/**
 * Every pattern the board says owns a path: each seat's `owns` and each
 * lane's `allows`. Both, because four of this league's lanes carry no seat
 * and one of them holds the skills, so a rule reading seats alone would make
 * the league's own method the one thing the method cannot cover.
 * @param {string} root @returns {string[]}
 */
export function owners(root) {
  const p = join(root, "kaal.config.json");
  if (!existsSync(p)) return [];
  try {
    const config = JSON.parse(readFileSync(p, "utf8"));
    return [
      ...(config.seats ?? []).flatMap((s) => s.owns ?? []),
      ...(config.lanes ?? []).flatMap((l) => l.allows ?? []),
    ];
  } catch {
    return [];
  }
}

/**
 * Why a case may not sit where it sits, or null where something owns it. Two
 * answers and never one: `tests/` is refused before ownership is asked,
 * because the tester owns `tests/**` and would otherwise answer that a case
 * there is fine, which is the opposite of the rule.
 * @param {string} path @param {string[]} owners
 * @returns {string | null}
 */
export function caseOwner(path, owners) {
  if (path.startsWith("tests/"))
    return `${path}: tests/ points at cases and does not hold them`;
  const held = (owners ?? []).some((o) =>
    path.startsWith(o.replace(/\*+$/, "")),
  );
  return held ? null : `${path}: nothing owns it`;
}

/**
 * Every test file no suite names, with two exclusions and each for its own
 * reason. Only under the top level directories the named cases reach, because
 * a tree no suite points into is not yet this wall's business. And never
 * inside a `fixtures/` directory, because a fixture is a scratch tree built
 * for a case and its files are that case's data rather than cases of their
 * own: the first reading of this on the league's own tree found forty six of
 * them, every one a file that exists to be read and not to be run.
 * @param {string} root @param {Set<string>} named
 * @returns {string[]}
 */
export function unnamed(root, named) {
  const out = [];
  for (const top of new Set([...named].map((c) => c.split("/")[0])))
    for (const f of globSync(`${top}/**/*.test.mjs`, { cwd: root })) {
      const rel = String(f).split(/[\\/]/).join("/");
      if (!named.has(rel) && !rel.includes("/fixtures/")) out.push(rel);
    }
  return [...new Set(out)].sort();
}

/**
 * What a plan picks, and what it should not still be carrying. A glob in a
 * plan's prose was the whole of its claim once and is a leftover now.
 * @param {string} text
 * @returns {{ names: string[], findings: string[] }}
 */
export function planSuites(text) {
  const globs = globsOf(text);
  return {
    names: listOf(text, "suites"),
    findings: globs.length
      ? [`names a glob, ${globs[0]}; a plan names suites`]
      : [],
  };
}

/**
 * How far each plan reaches: the suites it names that exist, and the cases
 * those suites cover. Computed from the tree it is asked about, never
 * carried in a page, because a number in a page is a number somebody
 * rewrites.
 * @param {string} root
 * @returns {{ plan: string, suites: number, cases: number }[]}
 */
export function reach(root) {
  const by = new Map(suitePages(root).map((s) => [s.name, s.cases.length]));
  return planPages(root).map((p) => {
    const names = planSuites(p.text).names.filter((n) => by.has(n));
    return {
      plan: p.name,
      suites: names.length,
      cases: names.reduce((n, s) => n + (by.get(s) ?? 0), 0),
    };
  });
}
