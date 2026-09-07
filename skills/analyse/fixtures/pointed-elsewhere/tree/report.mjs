// A small tool. It prints a table and takes no options.
const rows = [
  { name: "alpha", count: 3 },
  { name: "beta", count: 11 },
];
for (const r of rows) console.log(`${r.name.padEnd(8)}${r.count}`);
