import chalk from "chalk";

export async function routeSource(
  source: string
) {
  switch (source) {
    case "memory":
      console.log(chalk.green("Using Memory"));
      break;

    case "rag":
      console.log(chalk.green("Using RAG"));
      break;

    case "tool":
      console.log(chalk.green("Using Tool"));
      break;

    case "llm":
      console.log(chalk.green("Using LLM"));
      break;

    default:
      console.log(chalk.red("Unknown Source"));
  }
}