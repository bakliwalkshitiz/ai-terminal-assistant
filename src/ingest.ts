import fs from "fs";
import { chunkText } from "./chunking.js";
import { createEmbedding } from "./embedding.js";
import { vectorStore } from "./vectorStore.js";

export async function ingestFile(
  filePath: string
) {
  const content =
    fs.readFileSync(
      filePath,
      "utf-8"
    );

  const chunks =
    chunkText(content);

  for (const chunk of chunks) {
    const embedding =
      await createEmbedding(
        chunk
      );

    vectorStore.push({
      text: chunk,
      embedding,
    });
  }

  console.log(
    `Ingested ${chunks.length} chunks`
  );
}