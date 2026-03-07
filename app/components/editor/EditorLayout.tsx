"use client";

import { useState } from "react";

type Tab = "editor" | "chat";

export default function EditorLayout({
  editor,
  chat,
}: {
  editor: React.ReactNode;
  chat: React.ReactNode;
  preview?: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("editor");

  return (
    <div className="flex flex-col bg-[#0d1117] overflow-hidden" style={{ height: "calc(100dvh - 56px)" }}>

      {/* ── Mobile tab bar (visible only on small screens) ── */}
      <div className="flex md:hidden border-b border-[#21262d] bg-[#161b22] flex-shrink-0">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-all ${
            activeTab === "editor"
              ? "text-[#e6edf3] border-b-2 border-[#58a6ff]"
              : "text-[#8b949e] hover:text-[#e6edf3]"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25ZM7.25 8a.75.75 0 0 1-.22.53l-2.25 2.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L5.44 8 3.72 6.28a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l2.25 2.25c.141.14.22.331.22.53Zm1.5 1.5h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1 0-1.5Z" />
          </svg>
          Editor
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-all ${
            activeTab === "chat"
              ? "text-[#e6edf3] border-b-2 border-[#a371f7]"
              : "text-[#8b949e] hover:text-[#e6edf3]"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h4.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
          </svg>
          AI Chat
        </button>
      </div>

      {/* ── Main content area ── */}
      <div className="flex flex-1 min-h-0">

        {/* Left: Editor + Error Panel */}
        {/* On mobile: show only when activeTab === "editor" */}
        <div
          className={`flex-col border-r border-[#21262d] min-w-0 flex-1
            ${activeTab === "editor" ? "flex" : "hidden"} md:flex`}
        >
          {editor}
        </div>

        {/* Right: AI Chat */}
        {/* On mobile: show only when activeTab === "chat" */}
        <div
          className={`flex-col bg-[#161b22] border-l border-[#21262d]
            w-full md:w-[380px] md:flex-shrink-0
            ${activeTab === "chat" ? "flex" : "hidden"} md:flex`}
        >
          {chat}
        </div>

      </div>
    </div>
  );
}