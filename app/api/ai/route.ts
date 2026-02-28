import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { topic } = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const chunks = [
        `{ "questions":[`,
        `{ "id":"q_ai_1","type":"single-select","label":"How is ${topic}?","options":["Good","Bad"]}`,
        `]}`
      ];

      for (const chunk of chunks) {
        await new Promise((r) => setTimeout(r, 300));
        controller.enqueue(encoder.encode(chunk));
      }

      controller.close();
    },
  });

  return new Response(stream);
}