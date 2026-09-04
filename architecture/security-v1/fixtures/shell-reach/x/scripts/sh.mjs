import { spawnSync } from "node:child_process";
console.log(spawnSync("true").status);
