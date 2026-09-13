#!/usr/bin/env node
// The two shapes in a graph of blocks that six pages read in turn will not
// show: a root that nothing waits behind, and a cycle where nobody moves.
// Usage: node scripts/order.mjs [root]
//
// Reading six backlogs and ordering them by hand is how a cycle becomes a
// queue that never drains: every seat in it is waiting on somebody who is
// waiting on them, and each page on its own reads like ordinary work. The
// traversal is deterministic and the judgement is not, so this computes the
// first and leaves the second where it belongs.
//
// Prints one `root:` line per seat nothing waits behind, with what clearing
// it releases, then one `cycle:` line per cycle, then the count of pages it
// read. Exits 0 with an answer, 1 on a bad argument.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** The seats and their trees, off the declaration, so a seat added is read. */
export function pagesOf(root) {
  const path = join(root, "kaal.config.json");
  if (!existsSync(path)) return null;
  const seats = JSON.parse(readFileSync(path, "utf8")).seats ?? [];
  return seats.map((s) => ({
    seat: s.name,
    path: join(String((s.owns ?? [])[0]).split("/")[0], "backlog.md"),
  }));
}

/**
 * The edges one page declares: the seat that owes, and the seat waiting.
 * Keyed `<seat>/<task>` under `blocks:`, the shape the pages already hold.
 */
export function edgesOf(text, waiting) {
  const out = [];
  const lines = String(text).split(/\r?\n/);
  let inside = false;
  for (const line of lines) {
    if (/^blocks:\s*$/.test(line)) {
      inside = true;
      continue;
    }
    if (inside && /^\S/.test(line)) inside = false;
    if (!inside) continue;
    const m = line.match(/^[ \t]+([^/:]+)\/([^:]+):[ \t]*(.+?)[ \t]*$/);
    if (m) out.push({ owes: m[1], task: m[2], kind: m[3], waiting });
  }
  return out;
}

/**
 * The seats nothing waits behind. A seat that owes something and waits on
 * nobody is where an order starts, because clearing it releases everything
 * downstream and nothing has to happen first.
 */
export function roots(edges) {
  const owes = new Set(edges.map((e) => e.owes));
  const waits = new Set(edges.map((e) => e.waiting));
  return [...owes].filter((s) => !waits.has(s)).sort();
}

/**
 * Every cycle, as the seats in it. Found by walking each seat's own chain and
 * stopping where it meets itself: a cycle is a finding for the seats in it
 * and never a queue for the manager to sort, so this names and never breaks.
 */
export function cycles(edges) {
  const next = new Map();
  for (const e of edges) {
    if (!next.has(e.waiting)) next.set(e.waiting, new Set());
    next.get(e.waiting).add(e.owes);
  }
  const found = new Map();
  const walk = (start, at, seen) => {
    for (const to of next.get(at) ?? []) {
      if (to === start) {
        const ring = [...seen, at];
        const key = [...ring].sort().join(",");
        if (!found.has(key)) found.set(key, ring);
        continue;
      }
      if (seen.includes(to)) continue;
      walk(start, to, [...seen, at]);
    }
  };
  for (const seat of next.keys()) walk(seat, seat, []);
  return [...found.values()];
}

/** Every edge across every page, and how many pages answered. */
export function read(root) {
  const pages = pagesOf(root);
  if (!pages) return null;
  let readCount = 0;
  const edges = [];
  for (const p of pages) {
    const full = join(root, p.path);
    if (!existsSync(full)) continue;
    readCount += 1;
    edges.push(...edgesOf(readFileSync(full, "utf8"), p.seat));
  }
  return { edges, read: readCount, declared: pages.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.argv[2] ?? ".";
  const answer = read(root);
  if (!answer) {
    console.error(`order: no kaal.config.json under ${root}`);
    process.exit(1);
  }
  const { edges } = answer;
  for (const seat of roots(edges)) {
    const releases = [
      ...new Set(edges.filter((e) => e.owes === seat).map((e) => e.waiting)),
    ];
    console.log(
      `root: the ${seat} owes, and nothing waits behind it: releases the ${releases.sort().join(", the ")}`,
    );
  }
  for (const ring of cycles(edges))
    console.log(`cycle: nobody moves: the ${ring.join(", the ")}`);
  console.log(`order: read ${answer.read} of ${answer.declared} backlog(s)`);
}
