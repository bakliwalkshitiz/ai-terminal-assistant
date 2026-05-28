import readline from "readline";
import chalk from "chalk";

import { askAI } from "./ai.js";
import { runCommand } from "./terminal.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log(chalk.green("AI Terminal Assistant Started"));

  while (true) {
    const input = await ask(chalk.blue("You > "));

    if (input === "exit") {
      break;
    }

    const aiResponse = await askAI(input);

    console.log(chalk.yellow("\nAI Suggestion:\n"));
    console.log(aiResponse);

    const confirm = await ask(
      chalk.magenta("\nRun this command? (yes/no): ")
    );

    if (confirm === "yes") {
      try {
        const blockedCommands = [
  "del",
  "format",
  "shutdown",
  "rd /s",
];

const isBlocked = blockedCommands.some((cmd) =>
  aiResponse?.toLowerCase().includes(cmd)
);

if (isBlocked) {
  console.log(chalk.red("Dangerous command blocked"));
  continue;
}
        const output = await runCommand(aiResponse || "");

        console.log(chalk.green("\nCommand Output:\n"));
        console.log(output);
      } catch (error) {
        console.log(chalk.red("\nError:\n"));
        console.log(error);
      }
    }
  }

  rl.close();
}

main();