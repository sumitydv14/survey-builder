"use client";

interface Props {
  format: string;
  setFormat: (f: string) => void;
}

export default function FormatSwitcher({
  format,
  setFormat,
}: Props) {
  const formats = ["xml", "json", "yaml"];

  return (
    <div className="flex gap-2 p-2">
      {formats.map((f) => (
        <button
          key={f}
          onClick={() => setFormat(f)}
          className={`px-3 py-1 border rounded ${
            format === f ? "bg-green-500 text-white" : ""
          }`}
        >
          {f.toUpperCase()}
        </button>
      ))}
    </div>
  );
}