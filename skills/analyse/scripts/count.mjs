#!/usr/bin/env node
// Criteria and tests must count equal. Usage: node scripts/count.mjs <criteria> <tests>
// Exits 0 when equal, 1 when not, or when either argument is missing or not a number.
const [c, t] = process.argv.slice(2);
const n = (s) => (s !== undefined && /^\d+$/.test(s) ? Number(s) : NaN);
const criteria = n(c);
const tests = n(t);
if (Number.isNaN(criteria) || Number.isNaN(tests)) {
  console.error("usage: count.mjs <criteria> <tests>, both whole numbers");
  process.exit(1);
}
if (criteria !== tests) {
  console.error(`criteria ${criteria} and tests ${tests} do not count equal`);
  process.exit(1);
}
console.log(`criteria ${criteria}, tests ${tests}: equal`);
