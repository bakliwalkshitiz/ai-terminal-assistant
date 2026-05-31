import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askAI(prompt: string) {
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

Example:

{
  "thought": "Need to list files in the current directory.",
  "tool": "terminal",
  "command": "dir",
  "description": "Lists files in current directory",
  "safety": "safe",
  "risk": "low",
  "explanation": "Displays all files and folders in the current directory."
}
`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices?.[0]?.message.content ?? "";
  
}