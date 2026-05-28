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

Rules:
- Only return ONE raw Windows CMD command
- No explanations
- No markdown
- No bash formatting
- No triple backticks
- Windows commands only

Examples:
dir
mkdir demo
cd folder
`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0].message.content;
}