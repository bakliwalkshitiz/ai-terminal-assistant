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
  "source": "llm",
  "needRetrieval": false,
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
  "source": "memory|rag|tool|llm",
  "needRetrieval": true,
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
- Create a plan before choosing a command.
- Put the steps in the plan array.
- Decide where the final answer or action should come from.
- Set source to one of:

  memory -> user preferences, stored facts, previous information.

  rag -> documents, notes, PDFs, retrieved knowledge.

  tool -> terminal actions, browser actions, file actions.

  llm -> general knowledge that can be answered directly.

- Choose source based on where the FINAL answer or action comes from.
- Do NOT choose memory simply because the request appeared in memory.
- If a terminal command is required, source must be "tool".
- If a browser action is required, source must be "tool".
- If a file action is required, source must be "tool".
- If documents must be searched, source must be "rag".
- If user preferences or stored facts are needed, source must be "memory".
- If general knowledge is enough, source must be "llm".

- Decide whether retrieval is needed.
- Set needRetrieval to true or false.

- Use only Windows CMD commands for terminal actions.
- Return exactly one command.
- Do not guess when the request is unclear.
- If unsure, return an empty command.

- Safety, risk and explanation must match the command.

Examples:

User:
"What is my favorite language?"

{
  "thought": "Need stored user information.",
  "source": "memory",
  "needRetrieval": false,
  "plan": ["Check memory"],
  "tool": "terminal",
  "command": "echo Checking memory",
  "description": "Answer from memory",
  "safety": "safe",
  "risk": "low",
  "explanation": "The answer should come from stored memory."
}

User:
"How does authentication work in my project?"

{
  "thought": "Need project documentation.",
  "source": "rag",
  "needRetrieval": true,
  "plan": ["Search documents", "Retrieve context"],
  "tool": "file",
  "command": "echo Retrieving documents",
  "description": "Retrieve project information",
  "safety": "safe",
  "risk": "low",
  "explanation": "The answer requires retrieved documents."
}

User:
"Create a folder named demo"

{
  "thought": "The user wants to create a folder.",
  "source": "tool",
  "needRetrieval": false,
  "plan": ["Create folder demo"],
  "tool": "terminal",
  "command": "mkdir demo",
  "description": "Create folder",
  "safety": "safe",
  "risk": "low",
  "explanation": "A terminal command is required."
}

User:
"What is the capital of France?"

{
  "thought": "General knowledge question.",
  "source": "llm",
  "needRetrieval": false,
  "plan": ["Answer directly"],
  "tool": "terminal",
  "command": "echo Paris",
  "description": "Answer general knowledge question",
  "safety": "safe",
  "risk": "low",
  "explanation": "The answer can be generated directly."
}
  RAG RULES:

Use source = "rag" when:
- The question mentions:
  knowledge base
  stored documents
  stored data
  company data
  internal information
  according to documents
  according to memory

- The answer may exist in retrieved documents.

Examples:

Question:
"What does my knowledge base say about backend development?"
source: rag

Question:
"According to the stored documents, what is used for frontend development?"
source: rag

Question:
"What is React?"
source: llm

Question:
"What is the capital of France?"
source: llm
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
    response.choices[0]
      ?.message.content ?? ""
  );
}