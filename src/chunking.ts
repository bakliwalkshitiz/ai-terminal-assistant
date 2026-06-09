export function chunkText(
  text: string
): string[] {
  return text
    .split(/\r?\n\r?\n/)
    .map(
      (chunk) => chunk.trim()
    )
    .filter(
      (chunk) => chunk.length > 0
    );
}