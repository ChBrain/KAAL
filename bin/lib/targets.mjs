// The two targets, in one place. The same two words were already in
// `class.mjs` and in the ci workflow and neither knew about the other; a
// reader asking what a target is should find one answer.

/** The targets, in the order a promotion travels. */
export const TARGETS = ["release", "main"];

/** The same as remote refs: the order a branch is likely to have come from. */
export const BASES = TARGETS.map((t) => `origin/${t}`);

/** The one target a promotion into `main` may come from. */
export const PROMOTION_FROM = "release";

/**
 * Whether a red wall stops this target. A wall's colour is a fact about the
 * tree and the same fact at both targets; this says whether the fact stops a
 * merge. A target this does not know is bound, because the safe answer to a
 * question about an unknown place is the strict one.
 * @param {string} [into]
 */
export const binding = (into) => into !== PROMOTION_FROM;
