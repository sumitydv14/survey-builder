"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fileText: string) => void;
}

export default function ImportSchemaModal({
  isOpen,
  onClose,
  onUpload,
}: Props) {
  const [fileName, setFileName] = useState("");
  const [fileText, setFileText] = useState("");

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    const allowed = ["xml", "json", "yaml", "yml"];

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!allowed.includes(ext || "")) {
      alert("Only XML / JSON / YAML allowed");
      return;
    }

    const text = await file.text();
    setFileText(text);
    setFileName(file.name);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-lg p-5 space-y-4">
        <h2 className="font-semibold text-lg">
          Import Survey File
        </h2>

        {/* Upload Area */}
        {!fileName && (
          <label className="border-dashed border-2 p-6 block text-center cursor-pointer">
            Upload XML / JSON / YAML
            <input
              type="file"
              className="hidden"
              onChange={(e) =>
                e.target.files &&
                handleFile(e.target.files[0])
              }
            />
          </label>
        )}

        {/* File Preview */}
        {fileName && (
          <div className="border p-3 rounded">
            <p className="text-sm">{fileName}</p>

            <div className="flex gap-2 mt-2">
              <label className="text-blue-600 cursor-pointer text-sm">
                Replace
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files &&
                    handleFile(e.target.files[0])
                  }
                />
              </label>

              <button
                onClick={() => {
                  setFileName("");
                  setFileText("");
                }}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded"
          >
            Cancel
          </button>

          <button
            disabled={!fileText}
            onClick={() => {
              onUpload(fileText);
              onClose();
            }}
            className="bg-green-500 text-white px-4 py-1 rounded"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}