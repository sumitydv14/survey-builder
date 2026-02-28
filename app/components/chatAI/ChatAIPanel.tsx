"use client";

import { useState } from "react";
import { generateSurveyStream } from "../../services/aiApi";

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function ChatAIPanel({
  onKeep,
}: {
  onKeep: (schema: any) => void;
}) {
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamOutput, setStreamOutput] = useState("");

  const handleGenerate = async () => {
    if (!topic) return;

    // 👉 user message add
    setMessages((prev) => [...prev, { role: "user", text: topic }]);

    setStreamOutput("");

    await generateSurveyStream(topic, (chunk) => {
      setStreamOutput((prev) => prev + chunk);
    });
  };

  const handleKeep = () => {
    try {
      onKeep(JSON.parse(streamOutput));
    } catch {}
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b font-semibold">Pro AI</div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] p-2 rounded text-sm ${
              m.role === "user"
                ? "bg-blue-100 ml-auto"
                : "bg-gray-100"
            }`}
          >
            {m.text}
          </div>
        ))}

        {/* Streaming AI Bubble */}
        {streamOutput && (
          <div className="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap">
            {streamOutput}

            <button
              onClick={handleKeep}
              className="mt-2 bg-black text-white px-2 py-1 text-xs rounded"
            >
              KeepIt
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t flex gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ask AI to generate survey..."
          className="border flex-1 p-2 rounded text-sm"
        />

        <button
          onClick={handleGenerate}
          className="bg-green-500 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}