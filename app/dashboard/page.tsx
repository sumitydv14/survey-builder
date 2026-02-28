"use client";

import { useEffect, useRef, useState } from "react";
import { createSurvey, getSurveys } from "../services/surveyApi";
import { motion, AnimatePresence } from "framer-motion";
import ImportSchemaModal from "../components/ui/ImportSchemaModal";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Survey {
  _id: string;
  title: string;
  description: string;
  product: string;
  coverImage?: string;
  createdAt?: string;
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteConfirm({ survey, onConfirm, onCancel }: {
  survey: Survey; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <motion.div
        className="relative bg-[#161b22] border border-[#f85149]/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        initial={{ scale: 0.92, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 8 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="#f85149">
            <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
          </svg>
        </div>
        <h3 className="text-[#e6edf3] font-semibold text-center mb-1">Delete Survey?</h3>
        <p className="text-[#8b949e] text-sm text-center mb-5">
          "<span className="text-[#e6edf3]">{survey.title}</span>" will be permanently deleted. This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] text-sm transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all">
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Field Helper ─────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, onEnter }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; onEnter?: () => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider block mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg px-3 py-2 text-sm text-[#e6edf3] placeholder-[#484f58] outline-none transition-colors"
      />
    </div>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateModal({ onClose, onCreate, openImport, setOpenImport }: {
  onClose: () => void;
  onCreate: (data: { title: string; description: string; product: string; coverImage: string }) => Promise<void>;
  openImport: boolean;
  setOpenImport: (open: boolean) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [product, setProduct] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [creating, setCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setCreating(true);
    await onCreate({ title, description, product, coverImage });
    setCreating(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        className="relative bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Cover image zone */}
        <div
          className="h-32 relative flex items-center justify-center cursor-pointer overflow-hidden select-none"
          style={{ background: coverPreview ? "transparent" : "linear-gradient(135deg, #21262d 0%, #0d1117 100%)" }}
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {coverPreview ? (
            <>
              <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">Change image</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setCoverImage(""); setCoverPreview(""); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-black flex items-center justify-center transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="white">
                  <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.042.018.749.749 0 0 1 .018 1.042L9.06 8l3.22 3.22a.749.749 0 0 1-.018 1.042.749.749 0 0 1-1.042.018L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[#484f58] hover:text-[#8b949e] transition-colors">
              <svg width="28" height="28" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1.5a.5.5 0 0 0-.5.5v4.5H3.5a.5.5 0 0 0 0 1H7.5V12a.5.5 0 0 0 1 0V7.5h4a.5.5 0 0 0 0-1H8.5V2a.5.5 0 0 0-.5-.5Z" />
                <path d="M2.5 2A1.5 1.5 0 0 0 1 3.5v9A1.5 1.5 0 0 0 2.5 14h11a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 13.5 2Zm-1 1.5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v6.086l-2.646-2.647a1.5 1.5 0 0 0-2.121 0l-3 3-1.293-1.293a1.5 1.5 0 0 0-2.121 0L2.5 9.5Zm0 7.793V10.5l1.829-1.829a.5.5 0 0 1 .707 0L6.207 9.84l-3 3H2.5a1 1 0 0 1-.5-.086Zm4.914 0L10 8.707a.5.5 0 0 1 .707 0L14 12.207V12.5a1 1 0 0 1-1 1H7.414Z" />
              </svg>
              <span className="text-xs font-medium">Click or drag to add cover image</span>
              <span className="text-[10px] opacity-60">PNG, JPG, WebP</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
        </div>

        {/* Form body */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#e6edf3] font-semibold">Create New Survey</h2>
            <button onClick={onClose} className="p-1 rounded text-[#484f58] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.042.018.749.749 0 0 1 .018 1.042L9.06 8l3.22 3.22a.749.749 0 0 1-.018 1.042.749.749 0 0 1-1.042.018L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </button>
          </div>
          <div className="space-y-3">
            <Field label="Title *" value={title} onChange={setTitle} placeholder="e.g. Customer Satisfaction Q1" onEnter={handleSubmit} />
            <Field label="Description" value={description} onChange={setDescription} placeholder="Brief description of this survey" />
            <Field label="Product" value={product} onChange={setProduct} placeholder="e.g. Puma Running Shoes" />
            <button onClick={() => setOpenImport(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] hover:border-[#8b949e] rounded-lg transition-all">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z" /><path d="M11.78 4.72a.749.749 0 1 1-1.06 1.06L8.75 3.81v6.44a.75.75 0 0 1-1.5 0V3.81L5.28 5.78a.749.749 0 1 1-1.06-1.06l3-3a.749.749 0 0 1 1.06 0Z" /></svg>
              Import
            </button>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] text-sm transition-all">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || creating}
              className="flex-1 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              {creating ? (
                <><span className="w-3 h-3 border border-white border-t-transparent rounded-full" style={{ animation: "spin 0.6s linear infinite" }} />Creating…</>
              ) : "Create & Open Editor"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openImport, setOpenImport] = useState(false);
  const [importData, setImportData] = useState<string | null>(null);
  const router = useRouter();

  const loadSurveys = async () => {
    setLoading(true);
    const data = await getSurveys();
    setSurveys(data.surveys || []);
    setLoading(false);
  };

  useEffect(() => { loadSurveys(); }, []);
  const handleCreate = async (formData: { title: string; description: string; product: string; coverImage: string }) => {
    const res = await fetch("/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      ...formData,
      schemaJson: importData,
    }),
    });
    const data = await res.json();
    setShowCreate(false);
    if (data?.survey?._id) router.push(`/surveys/${data.survey._id}/editor`);
    else loadSurveys();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/surveys/${id}`, { method: "DELETE" });
    setSurveys((prev) => prev.filter((s) => s._id !== id));
    setDeletingId(null);
  };

  const handelUpload = (fileText: string) => {
    setImportData(fileText);
    setOpenImport(false);
  }

  const surveyToDelete = surveys.find((s) => s._id === deletingId);

  return (
    <div className="min-h-screen bg-[#0d1117]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* <header className="border-b border-[#21262d] bg-[#161b22] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#238636] to-[#58a6ff] flex items-center justify-center text-xs font-bold text-white">S</div>
            <span className="text-[#e6edf3] font-semibold text-sm">Survey Builder</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#238636] hover:bg-[#2ea043] rounded-lg transition-all font-medium">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" /></svg>
              New Survey
            </button>
          </div>
        </div>
      </header> */}

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#e6edf3]">Your Surveys</h1>
          <p className="text-sm text-[#8b949e] mt-0.5">{loading ? "Loading…" : `${surveys.length} survey${surveys.length !== 1 ? "s" : ""}`}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-52 rounded-xl bg-[#161b22] border border-[#21262d] animate-pulse" />)}
          </div>
        ) : surveys.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-24 gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 rounded-2xl bg-[#161b22] border border-[#21262d] flex items-center justify-center text-3xl">📋</div>
            <p className="text-[#e6edf3] font-semibold">No surveys yet</p>
            <p className="text-[#8b949e] text-sm text-center max-w-xs">Create your first survey or import an existing schema to get started.</p>
            <button onClick={() => setShowCreate(true)} className="mt-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-semibold rounded-lg transition-all">Create Survey</button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {surveys.map((s) => (
              <SurveyCard
                key={s._id}
                survey={s}
                onClick={() => router.push(`/surveys/${s._id}/editor`)}
                onDelete={() => setDeletingId(s._id)}
              />
            ))}
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} openImport={openImport} setOpenImport={setOpenImport}  />}
      </AnimatePresence>

      <AnimatePresence>
        {deletingId && surveyToDelete && (
          <DeleteConfirm survey={surveyToDelete} onConfirm={() => handleDelete(deletingId)} onCancel={() => setDeletingId(null)} />
        )}
      </AnimatePresence>

      <ImportSchemaModal
        isOpen={openImport}
        onClose={() => setOpenImport(false)}
        onUpload={handelUpload}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Survey Card ──────────────────────────────────────────────────────────────
function SurveyCard({ survey, onClick, onDelete }: {
  survey: Survey; onClick: () => void; onDelete: () => void;
}) {
  const gradients = [
    "from-[#238636] to-[#2ea043]", "from-[#1f6feb] to-[#388bfd]",
    "from-[#8957e5] to-[#a371f7]", "from-[#bf8700] to-[#e3b341]",
    "from-[#da3633] to-[#f85149]",
  ];
  const colorIdx = survey._id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % gradients.length;
  const initials = survey.title?.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "S";
  const date = survey.createdAt
    ? new Date(survey.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } } }}
      className="group relative bg-[#161b22] border border-[#21262d] hover:border-[#30363d] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5 flex flex-col"
      onClick={onClick}
    >
      {/* Cover banner */}
      <div className="relative h-32 flex-shrink-0 overflow-hidden">
        {survey.coverImage ? (
          <img
            src={survey.coverImage}
            alt={survey.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradients[colorIdx]} opacity-60`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161b22]/80 via-transparent to-transparent" />

        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete survey"
          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 backdrop-blur-sm"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
            <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
          </svg>
        </button>

        {!survey.coverImage && (
          <div className={`absolute bottom-2 left-3 w-9 h-9 rounded-xl bg-gradient-to-br ${gradients[colorIdx]} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
            {initials}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-[#e6edf3] font-semibold text-sm leading-tight truncate group-hover:text-white transition-colors">
            {survey.title}
          </h3>
          {survey.description && (
            <p className="text-[#8b949e] text-xs mt-0.5 line-clamp-2">{survey.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[#21262d] flex-wrap">
          {survey.product && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] border border-[#30363d] truncate max-w-[120px]">
              {survey.product}
            </span>
          )}
          {date && <span className="text-[10px] text-[#484f58] font-mono flex-shrink-0">{date}</span>}
          <span className="text-[10px] font-semibold text-[#238636] bg-[#238636]/10 border border-[#238636]/20 px-2 py-0.5 rounded-full ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            Open →
          </span>
        </div>
      </div>
    </motion.div>
  );
}