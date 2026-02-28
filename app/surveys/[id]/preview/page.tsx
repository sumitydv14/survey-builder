"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseSurvey } from  "../../../lib/parser";

interface Question {
  id: string;
  type: string;
  label?: string;
  options?: string[];
}

export default function Preview() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params?.id as string;

  const [survey, setSurvey] = useState<any>(null);
  const [schema, setSchema] = useState<{ questions: Question[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!surveyId) return;
      const res = await fetch(`/api/surveys/${surveyId}`);
      const data = await res.json();
      setSurvey(data.survey);

      if (data?.survey?.schemaJson) {
        const { schema: parsed } = parseSurvey(
          data.survey.schemaJson,
          data.survey.format ?? "xml"
        );
        setSchema(parsed);
      }
      setLoading(false);
    };
    load();
  }, [surveyId]);

  const handleRadio = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleCheckbox = (qId: string, value: string, checked: boolean) => {
    setAnswers((prev) => {
      const current: string[] = prev[qId] ?? [];
      return {
        ...prev,
        [qId]: checked
          ? [...current, value]
          : current.filter((v) => v !== value),
      };
    });
  };

  const handleText = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => setSubmitted(true);

  const questions: Question[] = schema?.questions ?? [];
  const answered = Object.keys(answers).length;
  const total = questions.length;
  const progress = total > 0 ? (answered / total) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-[#58a6ff] border-t-transparent"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <p className="text-[#8b949e] text-sm font-mono">Loading preview…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!schema || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#21262d] flex items-center justify-center mx-auto text-2xl">⚠️</div>
          <p className="text-[#e6edf3] font-semibold">No valid schema found</p>
          <p className="text-[#8b949e] text-sm">Fix the schema errors in the editor first.</p>
          <button
            onClick={() => router.push(`/surveys/${surveyId}/editor`)}
            className="mt-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] text-sm rounded-lg transition-colors border border-[#30363d]"
          >
            ← Back to Editor
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <div
          className="bg-[#161b22] border border-[#21262d] rounded-2xl p-10 text-center max-w-md w-full"
          style={{ animation: "fadeUp 0.4s ease both" }}
        >
          <div className="w-16 h-16 rounded-full bg-[#238636]/20 border border-[#238636]/30 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 16 16" fill="#3fb950">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#e6edf3] mb-2">Response Submitted!</h2>
          <p className="text-[#8b949e] text-sm mb-6">Thanks for completing this survey preview.</p>
          <button
            onClick={() => { setSubmitted(false); setAnswers({}); }}
            className="w-full py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Preview Again
          </button>
          <button
            onClick={() => router.push(`/surveys/${surveyId}/editor`)}
            className="w-full mt-2 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] rounded-lg text-sm transition-colors border border-[#30363d]"
          >
            ← Back to Editor
          </button>
        </div>
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#0d1117]/90 backdrop-blur border-b border-[#21262d]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push(`/surveys/${surveyId}/editor`)}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all"
            title="Back to editor"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
            </svg>
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#8b949e] font-mono">
                {survey?.title ?? "Survey Preview"} · {answered}/{total} answered
              </span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: `hsl(${120 * (progress / 100)}, 60%, 60%)` }}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1 bg-[#21262d] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, #238636, #58a6ff)`,
                }}
              />
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20 flex-shrink-0">
            PREVIEW
          </span>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            answer={answers[q.id]}
            onRadio={(v) => handleRadio(q.id, v)}
            onCheckbox={(v, c) => handleCheckbox(q.id, v, c)}
            onText={(v) => handleText(q.id, v)}
          />
        ))}

        {/* Submit */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl bg-[#238636] hover:bg-[#2ea043] active:scale-[0.98] text-white font-semibold text-sm transition-all duration-150 shadow-lg shadow-[#238636]/20"
          >
            Submit Response
          </button>
          <p className="text-center text-[11px] text-[#484f58] mt-2 font-mono">
            This is a preview — responses are not saved
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  index,
  answer,
  onRadio,
  onCheckbox,
  onText,
}: {
  question: Question;
  index: number;
  answer: any;
  onRadio: (v: string) => void;
  onCheckbox: (v: string, checked: boolean) => void;
  onText: (v: string) => void;
}) {
  const hasAnswer =
    answer !== undefined &&
    answer !== "" &&
    (Array.isArray(answer) ? answer.length > 0 : true);

  return (
    <div
      className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 transition-all duration-200 hover:border-[#30363d]"
      style={{
        animation: `fadeUp 0.3s ease both`,
        animationDelay: `${index * 60}ms`,
        borderLeftColor: hasAnswer ? "#238636" : undefined,
        borderLeftWidth: hasAnswer ? 3 : undefined,
      }}
    >
      {/* Question header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="w-6 h-6 rounded-md bg-[#21262d] text-[#8b949e] text-[11px] font-bold font-mono flex items-center justify-center flex-shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-[#e6edf3] text-sm font-medium leading-relaxed">
            {question.label ?? `Question ${index + 1}`}
          </p>
          <span className="text-[10px] font-mono text-[#484f58] mt-0.5 block uppercase tracking-wider">
            {question.type}
          </span>
        </div>
        {hasAnswer && (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="#3fb950" className="flex-shrink-0 mt-1">
            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
          </svg>
        )}
      </div>

      {/* Inputs */}
      {question.type === "single-select" && (
        <div className="space-y-2">
          {question.options?.map((opt) => {
            const selected = answer === opt;
            return (
              <label
                key={opt}
                onClick={() => onRadio(opt)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 border ${
                  selected
                    ? "bg-[#238636]/10 border-[#238636]/40 text-[#e6edf3]"
                    : "bg-[#0d1117] border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3]"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    selected ? "border-[#238636]" : "border-[#484f58]"
                  }`}
                >
                  {selected && (
                    <span className="w-2 h-2 rounded-full bg-[#238636]" />
                  )}
                </span>
                <span className="text-sm">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {question.type === "multi-select" && (
        <div className="space-y-2">
          {question.options?.map((opt) => {
            const checked = (answer ?? []).includes(opt);
            return (
              <label
                key={opt}
                onClick={() => onCheckbox(opt, !checked)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 border ${
                  checked
                    ? "bg-[#1f6feb]/10 border-[#1f6feb]/40 text-[#e6edf3]"
                    : "bg-[#0d1117] border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3]"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                    checked ? "border-[#1f6feb] bg-[#1f6feb]" : "border-[#484f58]"
                  }`}
                >
                  {checked && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                      <path d="M8.5 2.5L4 7.5 1.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </span>
                <span className="text-sm">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {(question.type === "text" || question.type === "textarea") && (
        <textarea
          rows={question.type === "textarea" ? 4 : 2}
          value={answer ?? ""}
          onChange={(e) => onText(e.target.value)}
          placeholder="Type your answer…"
          className="w-full bg-[#0d1117] border border-[#21262d] focus:border-[#58a6ff] rounded-lg px-3 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] outline-none resize-none transition-colors"
        />
      )}

      {question.type === "rating" && (
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRadio(String(star))}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <svg width="28" height="28" viewBox="0 0 16 16" fill={Number(answer) >= star ? "#e3b341" : "#30363d"}>
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.873 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
              </svg>
            </button>
          ))}
          {answer && (
            <span className="text-xs text-[#8b949e] font-mono ml-2">{answer}/5</span>
          )}
        </div>
      )}
    </div>
  );
}