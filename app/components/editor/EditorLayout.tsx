export default function EditorLayout({
  editor,
  chat,
}: {
  editor: React.ReactNode;
  chat: React.ReactNode;
  preview?: React.ReactNode;
}) {
  return (
    // 56px = header height (h-14). Editor fills exactly the remaining viewport.
    <div className="flex bg-[#0d1117] overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
      {/* Left: Editor + Error Panel */}
      <div className="flex-1 flex flex-col border-r border-[#21262d] min-w-0">
        {editor}
      </div>

      {/* Right: AI Chat */}
      <div className="w-[380px] flex-shrink-0 flex flex-col bg-[#161b22] border-l border-[#21262d]">
        {chat}
      </div>
    </div>
  );
}