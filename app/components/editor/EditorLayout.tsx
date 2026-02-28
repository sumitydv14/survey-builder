export default function EditorLayout({
  editor,
  chat,
  // preview,
}: {
  editor: React.ReactNode;
  chat: React.ReactNode;
  preview: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <div className="flex-1 border-r">{editor}</div>
      <div className="w-[320px] border-r">{chat}</div>
      {/* <div className="w-[320px] overflow-auto">{preview}</div> */}
    </div>
  );
}