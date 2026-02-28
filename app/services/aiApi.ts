export async function generateSurveyStream(
  topic: string,
  onChunk: (chunk: string) => void
) {
  const res = await fetch("/api/ai", {
    method: "POST",
    body: JSON.stringify({ topic }),
  });

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    onChunk(text);
  }
}