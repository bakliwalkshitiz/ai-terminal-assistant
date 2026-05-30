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

Do not return explanations.
Do not return markdown.
Do not return code blocks.
Do not return any text outside JSON.

Format:

{
  "command": "string",
  "description": "string",
  "safety": "safe|unsafe",
  "risk": "low|medium|high|critical",
  "explanation": "string"
}

Example:

{
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