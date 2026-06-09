export type VectorRecord = {
  id: string;
  text: string;
  source: string;
  chunkNumber: number;
  embedding: number[];
};

export const vectorStore: VectorRecord[] = [];