"use client";

export default function ErrorPanel({
  error,
}: {
  error: string | null;
}) {
  if (!error) return null;

  return (
    <div className="h-[120px] border-t bg-red-50 text-red-600 p-3 text-sm overflow-auto">
      <strong>Schema Error:</strong>
      <pre>{error}</pre>
    </div>
  );
}