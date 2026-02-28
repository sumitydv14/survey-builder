"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fileText: string) => void;
}

const ALLOWED_EXTS = ["xml", "json", "yaml", "yml"];

const FORMAT_ICONS: Record<string, { label: string; color: string; bg: string }> = {
  xml:  { label: "XML",  color: "text-[#7ee787]",  bg: "bg-[#238636]/10 border-[#238636]/30" },
  json: { label: "JSON", color: "text-[#79c0ff]",  bg: "bg-[#1f6feb]/10 border-[#1f6feb]/30" },
  yaml: { label: "YAML", color: "text-[#e3b341]",  bg: "bg-[#bf8700]/10 border-[#bf8700]/30" },
  yml:  { label: "YAML", color: "text-[#e3b341]",  bg: "bg-[#bf8700]/10 border-[#bf8700]/30" },
};

export default function ImportSchemaModal({ isOpen, onClose, onUpload }: Props) {
  const [fileName, setFileName] = useState("");
  const [fileExt, setFileExt] = useState("");
  const [fileText, setFileText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTS.includes(ext)) {
      setError("Only XML, JSON, YAML files are allowed.");
      return;
    }
    const text = await file.text();
    setFileText(text);
    setFileName(file.name);
    setFileExt(ext === "yml" ? "yaml" : ext);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setFileName("");
    setFileExt("");
    setFileText("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleImport = () => {
    onUpload(fileText);
    handleClose();
  };

  const fmt = FORMAT_ICONS[fileExt];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

          {/* Modal */}
          <motion.div
            className="relative bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="#8b949e">
                    <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z" />
                    <path d="M11.78 4.72a.749.749 0 1 1-1.06 1.06L8.75 3.81v6.44a.75.75 0 0 1-1.5 0V3.81L5.28 5.78a.749.749 0 1 1-1.06-1.06l3-3a.749.749 0 0 1 1.06 0Z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[#e6edf3] font-semibold text-sm">Import Schema</h2>
                  <p className="text-[#484f58] text-[10px] font-mono">XML · JSON · YAML</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-[#484f58] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.042.018.749.749 0 0 1 .018 1.042L9.06 8l3.22 3.22a.749.749 0 0 1-.018 1.042.749.749 0 0 1-1.042.018L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Drop zone */}
              {!fileName ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? "border-[#58a6ff] bg-[#1f6feb]/10"
                      : "border-[#30363d] bg-[#0d1117] hover:border-[#484f58] hover:bg-[#161b22]"
                  }`}
                >
                  {/* Upload icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isDragging ? "bg-[#1f6feb]/20" : "bg-[#21262d]"}`}>
                    <svg width="22" height="22" viewBox="0 0 16 16" fill={isDragging ? "#58a6ff" : "#8b949e"}>
                      <path d="M8.75 1.75a.75.75 0 0 0-1.5 0V7H2a.75.75 0 0 0 0 1.5h5.25v5.25a.75.75 0 0 0 1.5 0V8.5H14A.75.75 0 0 0 14 7H8.75V1.75Z" />
                    </svg>
                  </div>

                  <div className="text-center">
                    <p className={`text-sm font-medium transition-colors ${isDragging ? "text-[#58a6ff]" : "text-[#e6edf3]"}`}>
                      {isDragging ? "Drop to import" : "Drop your file here"}
                    </p>
                    <p className="text-xs text-[#8b949e] mt-0.5">or <span className="text-[#58a6ff] hover:underline cursor-pointer">browse to upload</span></p>
                  </div>

                  {/* Format pills */}
                  <div className="flex items-center gap-1.5">
                    {["XML", "JSON", "YAML"].map((f) => (
                      <span key={f} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                        {f}
                      </span>
                    ))}
                  </div>

                  <input ref={fileRef} type="file" accept=".xml,.json,.yaml,.yml" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
              ) : (
                /* File selected state */
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden"
                >
                  {/* File row */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Format badge */}
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${fmt?.bg ?? "bg-[#21262d] border-[#30363d]"}`}>
                      <span className={`text-[10px] font-black font-mono ${fmt?.color ?? "text-[#8b949e]"}`}>
                        {fmt?.label ?? fileExt.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[#e6edf3] text-sm font-medium truncate">{fileName}</p>
                      <p className="text-[#8b949e] text-[10px] mt-0.5 font-mono">
                        {(fileText.length / 1024).toFixed(1)} KB · ready to import
                      </p>
                    </div>

                    <svg width="16" height="16" viewBox="0 0 16 16" fill="#3fb950">
                      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                    </svg>
                  </div>

                  {/* Preview strip */}
                  <div className="border-t border-[#21262d] px-4 py-2.5 bg-[#0d1117]">
                    <pre className="text-[10px] font-mono text-[#8b949e] truncate leading-relaxed">
                      {fileText.trim().slice(0, 120)}{fileText.length > 120 ? "…" : ""}
                    </pre>
                  </div>

                  {/* Replace / Remove */}
                  <div className="border-t border-[#21262d] flex items-center px-4 py-2 gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-[#58a6ff] hover:text-[#79c0ff] cursor-pointer transition-colors">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z" />
                      </svg>
                      Replace file
                      <input type="file" accept=".xml,.json,.yaml,.yml" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                    </label>
                    <button onClick={reset} className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-red-400 transition-colors ml-auto">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0">
                      <path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                    </svg>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#21262d] flex items-center justify-between gap-3 bg-[#0d1117]/50">
              <p className="text-[10px] text-[#484f58] font-mono">
                Supported: .xml .json .yaml .yml
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={!fileText}
                  onClick={handleImport}
                  className="px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center gap-1.5"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z" /><path d="M11.78 4.72a.749.749 0 1 1-1.06 1.06L8.75 3.81v6.44a.75.75 0 0 1-1.5 0V3.81L5.28 5.78a.749.749 0 1 1-1.06-1.06l3-3a.749.749 0 0 1 1.06 0Z" />
                  </svg>
                  Import Schema
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}