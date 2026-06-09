import { createEmbedding } from "./embedding.js";
import { vectorStore } from "./vectorStore.js";
import { cosineSimilarity } from "./similarity.js";

export async function retrieve(
  query: string
) {
  const queryEmbedding =
    await createEmbedding(query);

  const matches: {
    text: string;
    score: number;
  }[] = [];

  for (const item of vectorStore) {
    const score = cosineSimilarity(
      queryEmbedding,
      item.embedding
    );

    matches.push({
      text: item.text,
      score,
    });
  }

  matches.sort(
    (a, b) => b.score - a.score
  );

  return matches.slice(0, 3);
}
export async function buildContext(
  query: string
) {
  const matches =
    await retrieve(query);

  return matches
    .map((item) => item.text)
    .join("\n");
}