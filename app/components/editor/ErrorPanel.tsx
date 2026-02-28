"use client";

import { useState, useRef, useCallback } from "react";

export interface ParseError {
  message: string;
  line?: number;
  column?: number;
  type: "syntax" | "structure" | "attribute" | "text";
}

interface Props {
  errors: ParseError[];
}

const COLLAPSED_HEIGHT = 36;
const DEFAULT_HEIGHT_PERCENT = 40;

const ERROR_TYPE_CONFIG = {
  syntax:    { label: "Syntax",    color: "text-red-400",    bg: "bg-red-500/5    border border-red-500/10    hover:bg-red-500/10",    dot: "bg-red-400"    },
  structure: { label: "Structure", color: "text-orange-400", bg: "bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10", dot: "bg-orange-400" },
  attribute: { label: "Attribute", color: "text-yellow-400", bg: "bg-yellow-500/5 border border-yellow-500/10 hover:bg-yellow-500/10", dot: "bg-yellow-400" },
  text:      { label: "Text",      color: "text-purple-400", bg: "bg-purple-500/5 border border-purple-500/10 hover:bg-purple-500/10", dot: "bg-purple-400" },
};

function ErrorIcon({ type }: { type: ParseError["type"] }) {
  if (type === "syntax" || type === "structure") {
    return (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0 mt-0.5">
        <path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
      </svg>
    );
  }
  if (type === "attribute") {
    return (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0 mt-0.5">
        <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0 mt-0.5">
      <path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25Zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25ZM3.5 6.25a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7a.75.75 0 0 1-.75-.75Zm.75 2.25h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1 0-1.5Z" />
    </svg>
  );
}

export default function ErrorPanel({ errors }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartH = useRef<number>(0);
  const isDragging = useRef(false);

  const errorCount = errors.length;
  const isValid = errorCount === 0;

  const resolveHeight = useCallback(() => {
    if (panelHeight !== null) return panelHeight;
    const parent = containerRef.current?.parentElement;
    if (!parent) return 200;
    return Math.round(parent.getBoundingClientRect().height * (DEFAULT_HEIGHT_PERCENT / 100));
  }, [panelHeight]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      dragStartY.current = e.clientY;
      dragStartH.current = resolveHeight();

      const onMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const delta = dragStartY.current - ev.clientY;
        const parent = containerRef.current?.parentElement;
        const maxH = parent ? parent.getBoundingClientRect().height - 80 : 600;
        const newH = Math.min(maxH, Math.max(COLLAPSED_HEIGHT + 20, dragStartH.current + delta));
        setPanelHeight(newH);
        setCollapsed(false);
      };

      const onUp = () => {
        isDragging.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [resolveHeight]
  );

  const displayHeight = collapsed
    ? COLLAPSED_HEIGHT
    : panelHeight !== null
    ? panelHeight
    : undefined;

  const syntaxCount    = errors.filter((e) => e.type === "syntax").length;
  const structureCount = errors.filter((e) => e.type === "structure").length;
  const attributeCount = errors.filter((e) => e.type === "attribute").length;
  const textCount      = errors.filter((e) => e.type === "text").length;

  return (
    <div
      ref={containerRef}
      className="flex-shrink-0 flex flex-col border-t border-[#21262d] bg-[#0d1117] overflow-hidden"
      style={
        collapsed
          ? { height: COLLAPSED_HEIGHT }
          : displayHeight !== undefined
          ? { height: displayHeight }
          : { height: `${DEFAULT_HEIGHT_PERCENT}%` }
      }
    >
      {/* Drag handle */}
      {!collapsed && (
        <div
          onMouseDown={onMouseDown}
          className="h-[5px] w-full flex-shrink-0 cursor-row-resize group flex items-center justify-center bg-[#161b22] hover:bg-[#21262d] transition-colors"
          title="Drag to resize"
        >
          <div className="w-10 h-[3px] rounded-full bg-[#30363d] group-hover:bg-[#58a6ff] transition-colors" />
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center gap-2 px-3 h-9 flex-shrink-0 border-b border-[#21262d] bg-[#161b22]">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#8b949e] hover:text-[#e6edf3] transition-colors"
        >
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
            style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          >
            <path d="M5 7L1 3h8L5 7z" />
          </svg>
          PROBLEMS
        </button>

        {/* Error count */}
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono leading-none ${
            isValid
              ? "bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {errorCount}
        </span>

        {/* Type breakdown pills */}
        {!isValid && (
          <div className="flex items-center gap-1">
            {syntaxCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 font-mono border border-red-500/20">
                {syntaxCount} syntax
              </span>
            )}
            {structureCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-mono border border-orange-500/20">
                {structureCount} structure
              </span>
            )}
            {attributeCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 font-mono border border-yellow-500/20">
                {attributeCount} attr
              </span>
            )}
            {textCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono border border-purple-500/20">
                {textCount} text
              </span>
            )}
          </div>
        )}

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {isValid ? (
            <span className="text-[10px] text-[#3fb950] font-mono">No problems</span>
          ) : (
            <span className="text-[10px] text-red-400 font-mono">
              {errorCount} error{errorCount > 1 ? "s" : ""}
            </span>
          )}
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${isValid ? "bg-[#3fb950]" : "bg-red-400"}`}
            style={!isValid ? { animation: "errPulse 2s ease-in-out infinite" } : {}}
          />
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand" : "Collapse"}
            className="p-1 rounded text-[#484f58] hover:text-[#e6edf3] hover:bg-[#21262d] transition-all"
          >
            <svg
              width="12" height="12" viewBox="0 0 16 16" fill="currentColor"
              style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            >
              <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex-1 overflow-auto min-h-0">
          {isValid ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 py-8 text-center">
              <div className="w-9 h-9 rounded-full bg-[#238636]/15 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="#3fb950">
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                </svg>
              </div>
              <p className="text-xs text-[#3fb950] font-semibold">Schema is valid</p>
              <p className="text-[11px] text-[#484f58]">No errors or warnings detected</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {errors.map((err, i) => {
                const cfg = ERROR_TYPE_CONFIG[err.type] ?? ERROR_TYPE_CONFIG.syntax;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 px-2.5 py-2 rounded-md transition-colors ${cfg.bg} ${cfg.color}`}
                  >
                    <ErrorIcon type={err.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded font-mono opacity-60 border border-current/20">
                          {cfg.label}
                        </span>
                        {err.line !== undefined && (
                          <span className="text-[10px] font-mono opacity-50">
                            Ln {err.line}{err.column !== undefined ? `:${err.column}` : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono leading-relaxed break-words">
                        {err.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes errPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}