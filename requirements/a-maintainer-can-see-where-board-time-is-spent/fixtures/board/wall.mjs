const answer = process.argv[2];

if (answer === "counted") console.log("# pass 2");
else if (answer === "refuses") {
  console.log("refused on purpose");
  process.exitCode = 1;
} else if (answer === "after") console.log("reached after the failure");
else if (answer === "declines") {
  console.log("this question is not mine");
  process.exitCode = 2;
} else {
  console.error(`unknown fixture answer: ${answer ?? "none"}`);
  process.exitCode = 1;
}
