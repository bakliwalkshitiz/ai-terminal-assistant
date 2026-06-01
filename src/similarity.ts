export function cosineSimilarity(
  a: number[],
  b: number[]
): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    const ai = a[i]!;
    const bi = b[i]!;

    dot += ai * bi;
    magA += ai * ai;
    magB += bi * bi;
  }

  return (
    dot /
    (Math.sqrt(magA) * Math.sqrt(magB))
  );
}