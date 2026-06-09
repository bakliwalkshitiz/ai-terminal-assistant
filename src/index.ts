import readline from "readline";
import chalk from "chalk";

import { askAI, askRAG } from "./ai.js";
import { routeSource } from "./router.js";
import { runCommand } from "./terminal.js";

import { buildContext } from "./retrieval.js";
import { createEmbedding } from "./embedding.js";
import { vectorStore } from "./vectorStore.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const memory: string[] = [];

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log(
    chalk.green("AI Terminal Assistant Started")
  );

  while (true) {
    const input = await ask(
      chalk.blue("You > ")
    );

    if (input === "exit") {
      break;
    }

    memory.push(input);

    if (memory.length > 5) {
      memory.shift();
    }

    console.log(chalk.yellow("\nMemory:"));
    console.log(memory);

    const aiResponse = await askAI(
      input,
      memory
    );

    console.log(
      chalk.yellow("\nAI Suggestion:\n")
    );
    console.log(aiResponse);

    let response;

    try {
      response = JSON.parse(
        aiResponse || "{}"
      );
    } catch {
      console.log(
        chalk.red(
          "\nInvalid JSON Response"
        )
      );
      continue;
    }

    if (
      !response.thought ||
      !Array.isArray(response.plan) ||
      !response.source ||
      !response.tool ||
      !response.command
    ) {
      console.log(
        chalk.red(
          "\nInvalid AI Response"
        )
      );
      continue;
    }

    if (
      response.source === "rag"
    ) {
      const context =
        await buildContext(input);

      const ragAnswer =
        await askRAG(
          input,
          context
        );

      console.log(
        chalk.green(
          "\nRAG Answer:\n"
        )
      );

      console.log(ragAnswer);

      continue;
    }

    console.log(chalk.cyan("\nThought:"));
    console.log(response.thought);

    console.log(chalk.cyan("\nSource:"));
    console.log(response.source);

    await routeSource(
      response.source
    );

    console.log(chalk.cyan("\nPlan:"));

    response.plan.forEach(
      (
        step: string,
        index: number
      ) => {
        console.log(
          `${index + 1}. ${step}`
        );
      }
    );

    console.log(chalk.cyan("\nTool:"));
    console.log(response.tool);

    console.log(chalk.cyan("\nCommand:"));
    console.log(response.command);

    console.log(
      chalk.cyan("\nDescription:")
    );
    console.log(response.description);

    console.log(chalk.cyan("\nSafety:"));
    console.log(response.safety);

    console.log(chalk.cyan("\nRisk:"));
    console.log(response.risk);

    console.log(
      chalk.cyan("\nExplanation:")
    );
    console.log(response.explanation);

    const confirm = await ask(
      chalk.magenta(
        "\nRun this command? (yes/no): "
      )
    );

    if (confirm !== "yes") {
      continue;
    }

    try {
      const blockedCommands = [
        "del",
        "format",
        "shutdown",
        "rd /s",
      ];

      const isBlocked =
        blockedCommands.some((cmd) =>
          response.command
            .toLowerCase()
            .includes(cmd)
        );

      if (isBlocked) {
        console.log(
          chalk.red(
            "Dangerous command blocked"
          )
        );
        continue;
      }

      let output = "";

      switch (response.tool) {
        case "terminal":
          output =
            await runCommand(
              response.command
            );
          break;

        case "browser":
          console.log(
            chalk.yellow(
              "\nBrowser Tool Coming Soon"
            )
          );
          continue;

        case "file":
          console.log(
            chalk.yellow(
              "\nFile Tool Coming Soon"
            )
          );
          continue;

        default:
          console.log(
            chalk.red(
              "\nUnknown Tool"
            )
          );
          continue;
      }

      console.log(
        chalk.green(
          "\nCommand Output:\n"
        )
      );

      console.log(output);

      console.log(
        chalk.cyan(
          "\nObservation:"
        )
      );

      console.log(
        "Command executed successfully."
      );
    } catch (error) {
      console.log(
        chalk.red(
          "\nError:\n"
        )
      );

      console.log(error);

      console.log(
        chalk.cyan(
          "\nObservation:"
        )
      );

      console.log(
        "Command execution failed."
      );

      console.log(
        chalk.yellow(
          "\nReflection:"
        )
      );

      console.log(
        "The command failed. Consider checking the path, command syntax, or file existence."
      );
    }
  }

  rl.close();
}

const docs = [
  "Java is a programming language",
  "Spring Boot is used for backend development",
  "React is used for frontend development",
];

for (const doc of docs) {
  const embedding =
    await createEmbedding(doc);

  vectorStore.push({
    text: doc,
    embedding,
  });
}

main();