// A pin's review state: whether anybody has read the text under a pin since
// it moved, and who. Four words and no more. `current` is a pin matching the
// region it names; `review-needed` is a region that moved with nobody having
// said anything about it; `reviewed-no-impact` and `updated` are the two ways
// a person leaves the third, and they are different claims, so collapsing
// them would lose the case a reader most wants to see later.
//
// Two of the four are never written down. They are what a sha comparison
// says, and a written `current` is a claim about a sha nobody checked. The
// two that are written record an act a person took, which is exactly the
// thing a tool cannot infer, and they live in a `reviews:` block beside
// `traces:` in the same frontmatter: keys `<kind>/<name>`, values
// `<state>@<sha> by <who>: <why>`. Beside the pin and never on it, because a
// trace's value is a comma separated list and a reason wants commas.
//
// A moved pin is a line here and never a finding. A red board stops the seat
// that cannot fix it: an analyst amends a criterion and the architect owns
// the drawing that goes red, and the diff is unlandable until somebody who
// may not have read the text re-pins it. What an unread pin costs instead is
// the task, through the report that judges one.
//
// It reads files and nothing else. No network, no provider, and no clock: a
// bound in days would make a tree go red while nobody touched it, which is a
// wall failing on a schedule rather than on a change.
//
// This module and `traces.mjs` import each other, which is deliberate and
// narrow: this one asks that one for the grammar of a trace and where each
// kind lives, and that one asks this one for a state and for what `--write`
// may touch. Every binding either side uses is a hoisted function called at
// run time, and neither module does anything at all while it is being
// evaluated.
import { parseFrontmatter } from "./frontmatter.mjs";
import {
  KINDS,
  splitTrace,
  readTrace,
  regionSha,
  artefacts,
} from "./traces.mjs";

/**
 * The four, in the order a reader meets them, and the only place these words
 * appear. A fifth word typed anywhere is a finding rather than a state.
 */
const STATES = ["current", "review-needed", "reviewed-no-impact", "updated"];
const [CURRENT, NEEDED] = STATES;
/** The two an act records. The other two are read off a sha. */
const RECORDED = STATES.slice(2);
/** `<state>@<sha> by <who>: <why>`, with everything after the state spare. */
const VALUE =
  /^([^\s@:]+)(?:@([0-9a-f]+))?(?:\s+by\s+([^:]+?))?(?:\s*:\s*(.*))?$/;

/**
 * What a person recorded in one artefact: an entry per reviewed pin, and a
 * finding for a word the league does not know or a clearance missing the who
 * or the why. An artefact with no block at all is the ordinary case: 422
 * pins in this league carry none and not one of them may become a finding.
 * @param {string} text
 * @returns {{reviews: object[], findings: string[]}}
 */
export function readReviews(text) {
  const reviews = [];
  const findings = [];
  let data;
  try {
    ({ data } = parseFrontmatter(text));
  } catch {
    // A page with no frontmatter is the trace wall's finding, in its own
    // words, and saying it twice would send a reader looking for two things.
    return { reviews, findings };
  }
  const block = data.reviews;
  if (!block || typeof block !== "object") return { reviews, findings };
  for (const [key, value] of Object.entries(block)) {
    const cut = String(key).indexOf("/");
    const kind = cut === -1 ? String(key) : String(key).slice(0, cut);
    const name = cut === -1 ? "" : String(key).slice(cut + 1);
    const [, state, sha, who, why] = String(value).match(VALUE) ?? [];
    // Never a silence. A word outside the table is a state nobody defined
    // passing as one somebody did, which is the vacuous pass wearing a typo.
    if (!RECORDED.includes(state)) {
      findings.push(
        `${key}: ${state || String(value)} is not a state a review records; a review records ${RECORDED.join(" or ")}`,
      );
      continue;
    }
    // Which half is missing, because a reader who has to guess reads the
    // file again to find out.
    const missing = [who ? null : "who", why ? null : "why"].filter(Boolean);
    if (missing.length) {
      findings.push(
        `${key}: cleared with no ${missing.join(" and no ")}; ${state} names the person who read it and the reason`,
      );
      continue;
    }
    reviews.push({
      kind,
      name,
      state,
      sha: sha ?? null,
      who: who.trim(),
      why: why.trim(),
    });
  }
  return { reviews, findings };
}

/**
 * The state of one pin: the pin, the sha its region has now, and what was
 * recorded beside it. Exactly one of the four, always.
 *
 * A review names the sha it cleared and counts only while that sha is the
 * region's sha now, so a second move reopens it: a second move is a second
 * question, and a review that outlived its text would be the pin's own
 * problem wearing a person's name.
 * @param {{kind: string, name: string, pin: string|null}} pin
 * @param {string} sha @param {object[]} reviews
 */
export function stateOf(pin, sha, reviews = []) {
  const cleared = (reviews ?? []).find(
    (r) => r.kind === pin.kind && r.name === pin.name && r.sha === sha,
  );
  if (cleared) return cleared.state;
  // No pin is not a moved pin. Nothing has been read and nothing says the
  // text moved, which is where all 422 of this tree's pins started.
  if (!pin.pin || pin.pin === sha) return CURRENT;
  return NEEDED;
}

/**
 * Whether `writePins` may write this pin. A person reading the moved text is
 * the act; carrying the sha forward afterwards is bookkeeping, and
 * bookkeeping is what a tool is for. What it may never do is move a pin
 * nobody read, which is the defect this whole task exists to fix.
 */
export function mayWrite(pin, sha, reviews = []) {
  return stateOf(pin, sha, reviews) !== NEEDED;
}

/**
 * Every pin in the tree, with the state it stands in and the review that
 * cleared it where one did.
 * @param {string} root
 */
function pins(root) {
  const out = [];
  for (const { dir, artefact, text } of artefacts(root)) {
    const trace = readTrace(text);
    if (!trace) continue;
    const { reviews } = readReviews(text);
    for (const [kind, value] of Object.entries(trace)) {
      if (!KINDS[kind]) continue;
      for (const { name, pin } of splitTrace(value)) {
        const sha = regionSha(root, kind, name, { dir, artefact });
        // A name that resolves to nothing is not a state at all. It is the
        // trace wall's finding, in the wall's own words; a pin compared
        // against a file that is not there would read as moved here and be
        // excused as a line.
        if (sha === null) continue;
        const state = stateOf({ kind, name, pin }, sha, reviews);
        out.push({
          artefact,
          kind,
          name,
          state,
          review: reviews.find((r) => r.kind === kind && r.name === name),
        });
      }
    }
  }
  return out;
}

/**
 * One line, naming the artefact, the kind, the name and the state. A pin
 * awaiting a reading keeps the words the trace wall used while this was a
 * finding, region and all, because the task that wrote them still asks for
 * them and only its exit code moved. A cleared one says who and why instead,
 * which is the thing a reader came for.
 */
const line = (p) =>
  p.state === NEEDED
    ? `${p.artefact}: ${p.kind}: ${p.name} moved: its ${KINDS[p.kind].region ?? "whole file"} no longer matches the pin; ${p.state}`
    : `${p.artefact}: ${p.kind}: ${p.name}: ${p.state} by ${p.review?.who}: ${p.review?.why}`;

/**
 * What `traces` prints beside its findings: nothing for a pin that matches,
 * a line for one that does not. Never a finding, whatever it says.
 * @param {string} root @returns {string[]}
 */
export function report(root) {
  return pins(root)
    .filter((p) => p.state !== CURRENT)
    .map(line);
}

/**
 * How many pins stand in each state, in the order the four are declared, so
 * a reader sees what is owed without asking a second question.
 * @param {string} root @returns {{state: string, count: number}[]}
 */
export function counts(root) {
  const all = pins(root);
  return STATES.map((state) => ({
    state,
    count: all.filter((p) => p.state === state).length,
  }));
}

/**
 * What a task owes: the pins in its artefacts that nobody has read since the
 * text under them moved. The lines and not a yes, because the report that
 * judges a task says why it is not delivered and a bare yes is not a reason.
 * @param {string} root @param {string} task @returns {string[]}
 */
export function owes(root, task) {
  return pins(root)
    .filter((p) => p.artefact === task && p.state === NEEDED)
    .map(line);
}
