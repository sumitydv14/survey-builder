"use client";

import { useState, useRef, useEffect } from "react";
import { generateSurveyStream } from "../../services/aiApi";

interface Message {
  role: "user" | "ai";
  text: string;
  isCode?: boolean;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] inline-block"
          style={{
            animation: "typingBounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function CodeSnippet({
  code,
  onKeep,
}: {
  code: string;
  onKeep: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  // Simple JSON syntax coloring via spans
  const highlight = (json: string) => {
    return json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = "color:#a5d6ff"; // string
        if (/^"/.test(match)) {
          if (/:$/.test(match)) cls = "color:#7ee787"; // key
        } else if (/true|false/.test(match)) {
          cls = "color:#ff7b72"; // bool
        } else if (/null/.test(match)) {
          cls = "color:#ff7b72"; // null
        } else {
          cls = "color:#79c0ff"; // number
        }
        return `<span style="${cls}">${match}</span>`;
      });
  };

  let displayCode = code;
  try {
    displayCode = JSON.stringify(JSON.parse(code), null, 2);
  } catch {}

  return (
    <div className="rounded-lg overflow-hidden border border-[#30363d] bg-[#0d1117] mt-1">
      {/* Code header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#21262d]">
        <span className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">JSON Schema</span>
        <button
          onClick={handleCopy}
          className="text-[10px] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Code body */}
      <pre
        className="text-[11px] font-mono leading-5 p-3 overflow-auto max-h-[260px] text-[#e6edf3]"
        dangerouslySetInnerHTML={{ __html: highlight(displayCode) }}
      />

      {/* Keep button */}
      <div className="px-3 py-2 border-t border-[#21262d] bg-[#161b22]">
        <button
          onClick={onKeep}
          className="w-full py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold transition-colors duration-150"
        >
          ✦ Insert into Editor
        </button>
      </div>
    </div>
  );
}

export default function ChatAIPanel({
  onKeep,
}: {
  onKeep: (schema: any) => void;
}) {
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamOutput, setStreamOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamOutput, isLoading]);

  const handleGenerate = async () => {
    const trimmed = topic.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setTopic("");
    setStreamOutput("");
    setIsLoading(true);
    setIsStreaming(false);

    await generateSurveyStream(trimmed, (chunk) => {
      setIsLoading(false);
      setIsStreaming(true);
      setStreamOutput((prev) => prev + chunk);
    });

    setIsStreaming(false);
  };

  const handleKeep = () => {
    try {
      onKeep(JSON.parse(streamOutput));
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#21262d] flex items-center gap-2 flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#bc8cff] flex items-center justify-center text-[10px] font-bold text-white">
          ✦
        </div>
        <span className="text-sm font-semibold text-[#e6edf3]">AI Survey Builder</span>
        <span className="ml-auto text-[10px] text-[#238636] font-mono bg-[#0d1117] px-2 py-0.5 rounded-full border border-[#238636]/30">
          LIVE
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && !isLoading && !streamOutput && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#58a6ff]/20 to-[#bc8cff]/20 flex items-center justify-center text-2xl">
              ✦
            </div>
            <p className="text-[#8b949e] text-sm">Describe a survey topic and I'll generate the schema for you.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {["Customer satisfaction", "Employee feedback", "Product NPS"].map((s) => (
                <button
                  key={s}
                  onClick={() => setTopic(s)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-[#30363d] text-[#8b949e] hover:border-[#58a6ff] hover:text-[#58a6ff] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-[#1f6feb] text-white rounded-br-sm"
                  : "bg-[#21262d] text-[#e6edf3] rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#21262d] rounded-xl rounded-bl-sm px-2 py-1">
              <TypingDots />
            </div>
          </div>
        )}

        {/* Streaming / result */}
        {streamOutput && (
          <div className="flex justify-start">
            <div className="w-full max-w-full">
              {isStreaming && (
                <div className="text-[10px] text-[#58a6ff] font-mono mb-1 flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] inline-block"
                    style={{ animation: "pulse 1s ease-in-out infinite" }}
                  />
                  Generating...
                  <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
                </div>
              )}
              <CodeSnippet code={streamOutput} onKeep={handleKeep} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#21262d] flex-shrink-0">
        <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 focus-within:border-[#58a6ff] transition-colors">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your survey…"
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-[#e6edf3] placeholder-[#484f58] outline-none disabled:opacity-50"
          />
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || isLoading}
            className="w-7 h-7 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-150 flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
              <path d="M.989 8 .064 2.68a1.342 1.342 0 0 1 1.85-1.462l13.402 5.744a1.13 1.13 0 0 1 0 2.076L1.913 14.782a1.342 1.342 0 0 1-1.85-1.463L.99 8Zm.603-5.135.925 4.41H8a.75.75 0 0 1 0 1.5H1.517l-.925 4.41 13.402-5.787z" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-[#484f58] mt-1.5 text-center">Press Enter to send</p>
      </div>
    </div>
  );
}