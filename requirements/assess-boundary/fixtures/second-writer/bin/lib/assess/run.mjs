// A module that runs the target, which the boundary refuses.
import { spawnSync } from "node:child_process";

export const run = (cmd) => spawnSync(cmd, { encoding: "utf8" });
