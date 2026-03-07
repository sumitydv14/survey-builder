"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ImportSchemaModal from "../../components/ui/ImportSchemaModal";

const FIELD_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      type: "spring" as const,
      stiffness: 280,
      damping: 24,
    },
  }),
};

export default function CreateSurveyPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [product, setProduct] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [creating, setCreating] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [importedSchema, setImportedSchema] = useState("");
  const [importedFileName, setImportedFileName] = useState("");
  const [importedFormat, setImportedFormat] = useState("xml");
  const [errors, setErrors] = useState<{ title?: string }>({});

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCoverImage(dataUrl);
      setCoverPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const validate = () => {
    const errs: { title?: string } = {};
    if (!title.trim()) errs.title = "Title is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          product: product.trim(),
          coverImage,
          // Ensure schema is sent - use imported schema or blank default
          rawCode: importedSchema && importedSchema.trim() ? importedSchema : "<survey>\n</survey>",
          format: "xml",
        }),
      });
      const data = await res.json();
      if (data?.survey?._id) {
        router.push(`/surveys/${data.survey._id}/editor`);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setCreating(false);
    }
  };

  const handleImport = (fileText: string, fileName: string, format: string) => {
    setImportedSchema(fileText);
    setImportedFileName(fileName);
    setImportedFormat(format);
    setOpenImport(false);
  };

  return (
    <div
      className="min-h-[calc(100vh-56px)] bg-[#0d1117] relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #238636 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #58a6ff 0%, transparent 70%)" }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: "linear-gradient(#e6edf3 1px, transparent 1px), linear-gradient(90deg, #e6edf3 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-10">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-[#8b949e] hover:text-[#e6edf3] text-sm mb-8 group transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="group-hover:-translate-x-0.5 transition-transform">
            <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
          </svg>
          Back to Dashboard
        </motion.button>

        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-[#e6edf3] tracking-tight">Create New Survey</h1>
          <p className="text-[#8b949e] text-sm mt-1">Set up your survey details. You can edit the schema in the editor after creation.</p>
        </motion.div>

        <div className="space-y-6">
          {/* ── Cover Image ─────────────────────────────── */}
          <motion.div custom={0} variants={FIELD_VARIANTS} initial="hidden" animate="visible">
            <label className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider block mb-2">
              Cover Image <span className="text-[#484f58] font-normal normal-case">— optional</span>
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => !coverPreview && fileRef.current?.click()}
              className={`relative h-44 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                coverPreview
                  ? "border-[#30363d] cursor-default"
                  : isDragging
                  ? "border-[#58a6ff] bg-[#1f6feb]/8 cursor-copy"
                  : "border-dashed border-[#30363d] hover:border-[#484f58] bg-[#161b22] hover:bg-[#1c2128] cursor-pointer"
              }`}
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-white text-xs font-medium bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                      Cover image set
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                        className="text-xs text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Change
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setCoverImage(""); setCoverPreview(""); }}
                        className="text-xs text-white bg-red-500/60 hover:bg-red-500/80 backdrop-blur-sm px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDragging ? "bg-[#1f6feb]/20" : "bg-[#21262d]"}`}>
                    <svg width="22" height="22" viewBox="0 0 16 16" fill={isDragging ? "#58a6ff" : "#484f58"}>
                      <path d="M2.5 2A1.5 1.5 0 0 0 1 3.5v9A1.5 1.5 0 0 0 2.5 14h11a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 13.5 2Zm-1 1.5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v6.086l-2.646-2.647a1.5 1.5 0 0 0-2.121 0l-3 3-1.293-1.293a1.5 1.5 0 0 0-2.121 0L2.5 9.5Zm0 7.793V10.5l1.829-1.829a.5.5 0 0 1 .707 0L6.207 9.84l-3 3H2.5a1 1 0 0 1-.5-.086Zm4.914 0L10 8.707a.5.5 0 0 1 .707 0L14 12.207V12.5a1 1 0 0 1-1 1H7.414Z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${isDragging ? "text-[#58a6ff]" : "text-[#8b949e]"}`}>
                      {isDragging ? "Drop image here" : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-[11px] text-[#484f58] mt-0.5">PNG, JPG, WebP · displayed on your survey card</p>
                  </div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
            </div>
          </motion.div>

          {/* ── Title ──────────────────────────────────── */}
          <motion.div custom={1} variants={FIELD_VARIANTS} initial="hidden" animate="visible">
            <label className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider block mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors({}); }}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. Customer Satisfaction Q1 2025"
              autoFocus
              className={`w-full bg-[#161b22] border rounded-xl px-4 py-3 text-sm text-[#e6edf3] placeholder-[#484f58] outline-none transition-all ${
                errors.title
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-[#30363d] focus:border-[#58a6ff] focus:bg-[#1c2128]"
              }`}
            />
            <AnimatePresence>
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-red-400 text-xs mt-1.5 flex items-center gap-1"
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                  </svg>
                  {errors.title}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Description ─────────────────────────────── */}
          <motion.div custom={2} variants={FIELD_VARIANTS} initial="hidden" animate="visible">
            <label className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider block mb-2">
              Description <span className="text-[#484f58] font-normal normal-case">— optional</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this survey about? Who is it for?"
              rows={3}
              className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#58a6ff] focus:bg-[#1c2128] rounded-xl px-4 py-3 text-sm text-[#e6edf3] placeholder-[#484f58] outline-none transition-all resize-none"
            />
          </motion.div>

          {/* ── Product ─────────────────────────────────── */}
          <motion.div custom={3} variants={FIELD_VARIANTS} initial="hidden" animate="visible">
            <label className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider block mb-2">
              Product <span className="text-[#484f58] font-normal normal-case">— optional</span>
            </label>
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. Puma Running Shoes, SaaS Platform…"
              className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#58a6ff] focus:bg-[#1c2128] rounded-xl px-4 py-3 text-sm text-[#e6edf3] placeholder-[#484f58] outline-none transition-all"
            />
          </motion.div>

          {/* ── Import Schema ───────────────────────────── */}
          <motion.div custom={4} variants={FIELD_VARIANTS} initial="hidden" animate="visible">
            <label className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider block mb-2">
              Schema File <span className="text-[#484f58] font-normal normal-case">— optional, import existing XML/JSON/YAML</span>
            </label>
            {importedSchema ? (
              <div className="flex items-center gap-3 bg-[#161b22] border border-[#238636]/40 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-[#238636]/15 border border-[#238636]/30 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="#3fb950">
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#3fb950] text-xs font-semibold">Schema imported</p>
                  <p className="text-[#8b949e] text-[11px] font-mono truncate">{importedFileName}</p>
                </div>
                <button
                  onClick={() => { setImportedSchema(""); setImportedFileName(""); }}
                  className="text-[#484f58] hover:text-red-400 transition-colors p-1 rounded"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.042.018.749.749 0 0 1 .018 1.042L9.06 8l3.22 3.22a.749.749 0 0 1-.018 1.042.749.749 0 0 1-1.042.018L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setOpenImport(true)}
                className="w-full flex items-center gap-3 bg-[#161b22] border border-dashed border-[#30363d] hover:border-[#484f58] hover:bg-[#1c2128] rounded-xl px-4 py-3 text-sm text-[#8b949e] hover:text-[#e6edf3] transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#21262d] group-hover:bg-[#30363d] flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z" />
                    <path d="M11.78 4.72a.749.749 0 1 1-1.06 1.06L8.75 3.81v6.44a.75.75 0 0 1-1.5 0V3.81L5.28 5.78a.749.749 0 1 1-1.06-1.06l3-3a.749.749 0 0 1 1.06 0Z" />
                  </svg>
                </div>
                <span>Import existing schema <span className="text-[#484f58] text-xs">· XML, JSON, YAML</span></span>
              </button>
            )}
          </motion.div>

          {/* ── Action buttons ──────────────────────────── */}
          <motion.div
            custom={5} variants={FIELD_VARIANTS} initial="hidden" animate="visible"
            className="flex gap-3 pt-2"
          >
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-3 rounded-xl border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex-[2] py-3 rounded-xl bg-[#238636] hover:bg-[#2ea043] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#238636]/20"
            >
              {creating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.7s linear infinite" }} />
                  Creating survey…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
                  </svg>
                  Create & Open Editor
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Import modal */}
      <ImportSchemaModal
        isOpen={openImport}
        onClose={() => setOpenImport(false)}
        onUpload={(text, fileName, format) => handleImport(text, fileName as string, format as string )}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}