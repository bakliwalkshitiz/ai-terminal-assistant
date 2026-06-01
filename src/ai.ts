import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askAI(
  prompt: string,
  memory: string[]
) {
  const memoryContext = memory.join("\n");

  const longTermMemory = fs.readFileSync(
    "memory.txt",
    "utf-8"
  );

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `
You are a Windows terminal assistant.

Return ONLY valid JSON.

Do not return markdown.
Do not return code blocks.
Do not return text outside JSON.

If the user's request is unclear, invalid, meaningless, or cannot be converted into a valid action, return:

{
  "thought": "Could not determine a valid action.",
  "plan": [],
  "tool": "terminal",
  "command": "",
  "description": "Invalid request",
  "safety": "safe",
  "risk": "low",
  "explanation": "Could not determine a valid Windows command."
}

Format:

{
  "thought": "string",
  "plan": ["step 1", "step 2"],
  "tool": "terminal|browser|file",
  "command": "string",
  "description": "string",
  "safety": "safe|unsafe",
  "risk": "low|medium|high|critical",
  "explanation": "string"
}

Rules:

- First think about the user's request.
- Put your reasoning in the thought field.
- Choose the most appropriate tool.
- Use only Windows CMD commands for terminal actions.
- Return exactly one command.
- Do not guess when the request is unclear.
- If unsure, return an empty command.
- Safety, risk and explanation must match the command.
- Create a plan before choosing a command.
- Put the steps in the plan array.
`,
      },
      {
        role: "user",
        content: `
Short-Term Memory:
${memoryContext}

Long-Term Memory:
${longTermMemory}

Current User Request:
${prompt}
`,
      },
    ],
  });

  return response.choices?.[0]?.message.content ?? "";
}

export async function askRAG(
  question: string,
  context: string
) {
  const response =
    await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Answer only using the provided context.",
        },
        {
          role: "user",
          content: `
Context:
${context}

Question:
${question}
`,
        },
      ],
    });

  return (
    response.choices?.[0]?.message.content ??
    ""
  );
}