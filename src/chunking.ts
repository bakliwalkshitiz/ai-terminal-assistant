export function chunkText(
  text: string,
  chunkSize: number
): string[] {
  const chunks: string[] = [];

  for (
    let i = 0;
    i < text.length;
    i += chunkSize
  ) {
    chunks.push(
      text.slice(i, i + chunkSize)
    );
  }

  return chunks;
}