"use client";

import Editor, { loader } from "@monaco-editor/react";
import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// Fix syntax highlighting: configure Monaco to load from CDN with proper workers
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs",
  },
});

interface Props {
  code: string;
  format: string;
  setCode: (v: string) => void;
  addedRange?: { start: number; end: number } | null;
  schemaError?: boolean;
  onFormatChange: (f: string) => void;
  surveyId?: string;
}

const FORMATS = ["xml", "json", "yaml"];

// Map format to Monaco language (yaml isn't built-in, use 'yaml' which Monaco supports)
function getMonacoLanguage(format: string) {
  if (format === "xml") return "xml";
  if (format === "json") return "json";
  if (format === "yaml") return "yaml";
  return "plaintext";
}

export default function MonacoEditorPanel({
  code,
  format,
  setCode,
  addedRange,
  schemaError,
  onFormatChange,
  surveyId,
}: Props) {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationIdsRef = useRef<string[]>([]);

  const handleMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Set a professional dark theme
    monaco.editor.defineTheme("surveyDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "tag", foreground: "7ee787" },
        { token: "attribute.name", foreground: "79c0ff" },
        { token: "attribute.value", foreground: "a5d6ff" },
        { token: "delimiter.angle", foreground: "7ee787" },
        { token: "string", foreground: "a5d6ff" },
        { token: "keyword", foreground: "ff7b72" },
        { token: "number", foreground: "79c0ff" },
        { token: "comment", foreground: "8b949e", fontStyle: "italic" },
        { token: "key", foreground: "7ee787" },
        { token: "string.yaml", foreground: "a5d6ff" },
        { token: "number.yaml", foreground: "79c0ff" },
        { token: "keyword.yaml", foreground: "ff7b72" },
      ],
      colors: {
        "editor.background": "#0d1117",
        "editor.foreground": "#e6edf3",
        "editorLineNumber.foreground": "#484f58",
        "editorLineNumber.activeForeground": "#e6edf3",
        "editor.selectionBackground": "#264f78",
        "editor.lineHighlightBackground": "#161b22",
        "editorCursor.foreground": "#58a6ff",
        "editorIndentGuide.background": "#21262d",
        "editorIndentGuide.activeBackground": "#30363d",
        "scrollbarSlider.background": "#30363d80",
        "scrollbarSlider.hoverBackground": "#484f58",
        "editorWidget.background": "#161b22",
        "editorSuggestWidget.background": "#161b22",
        "editorSuggestWidget.border": "#30363d",
      },
    });

    monaco.editor.setTheme("surveyDark");
  };

  // Undo
  const handleUndo = useCallback(() => {
    editorRef.current?.trigger("keyboard", "undo", null);
    editorRef.current?.focus();
  }, []);

  // Redo
  const handleRedo = useCallback(() => {
    editorRef.current?.trigger("keyboard", "redo", null);
    editorRef.current?.focus();
  }, []);

  // Copy all
  const handleCopy = useCallback(() => {
    const value = editorRef.current?.getValue() || "";
    navigator.clipboard.writeText(value).catch(() => {});
  }, []);

  // Highlight added range
  useEffect(() => {
    if (!addedRange) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const decorations = [];
    for (let line = addedRange.start; line <= addedRange.end; line++) {
      decorations.push({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: "addedXmlHighlight",
        },
      });
    }
    decorationIdsRef.current = editor.deltaDecorations(
      decorationIdsRef.current,
      decorations
    );
  }, [addedRange]);

  // Schema error markers
  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    if (!schemaError) {
      monacoRef.current.editor.setModelMarkers(model, "owner", []);
      return;
    }

    monacoRef.current.editor.setModelMarkers(model, "owner", [
      {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 5,
        message: "Invalid Schema",
        severity: monacoRef.current.MarkerSeverity.Error,
      },
    ]);
  }, [schemaError]);

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[#21262d] bg-[#161b22] flex-shrink-0">
        {/* Format Switcher */}
        <div className="flex items-center gap-1 mr-3">
          {FORMATS.map((f) => (
            <button
              key={f}
              onClick={() => onFormatChange(f)}
              className={`px-3 py-1 text-xs font-mono font-semibold rounded transition-all duration-150 ${
                format === f
                  ? "bg-[#238636] text-white shadow"
                  : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[#30363d] mx-1" />

        {/* Undo */}
        <ToolbarButton onClick={handleUndo} title="Undo (Ctrl+Z)">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.22 6.22a.75.75 0 0 1 1.06 0L4 7.94V4.5a5.5 5.5 0 0 1 11 0v1a.75.75 0 0 1-1.5 0v-1a4 4 0 0 0-8 0v3.44l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </ToolbarButton>

        {/* Redo */}
        <ToolbarButton onClick={handleRedo} title="Redo (Ctrl+Y)">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M14.78 6.22a.75.75 0 0 0-1.06 0L12 7.94V4.5a5.5 5.5 0 0 0-11 0v1a.75.75 0 0 0 1.5 0v-1a4 4 0 0 1 8 0v3.44l-1.72-1.72a.75.75 0 1 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 0 0 0-1.06Z" />
          </svg>
        </ToolbarButton>

        {/* Divider */}
        <div className="w-px h-5 bg-[#30363d] mx-1" />

        {/* Copy */}
        <ToolbarButton onClick={handleCopy} title="Copy all">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
          </svg>
        </ToolbarButton>

        {/* Preview button */}
        {surveyId && (
          <ToolbarButton
            onClick={() => router.push(`/surveys/${surveyId}/preview`)}
            title={schemaError ? "Fix errors before previewing" : "Open preview"}
            disabled={schemaError}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.671 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.329 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z" />
            </svg>
          </ToolbarButton>
        )}

        {/* Right side: status */}
        <div className="ml-auto flex items-center gap-2">
          {schemaError && (
            <span className="text-xs text-red-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              Schema Error
            </span>
          )}
          {!schemaError && (
            <span className="text-xs text-green-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Valid
            </span>
          )}
          <span className="text-xs text-[#484f58] font-mono uppercase">{format}</span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={getMonacoLanguage(format)}
          value={code}
          onMount={handleMount}
          onChange={(val) => setCode(val || "")}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: "line",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            padding: { top: 12, bottom: 12 },
            wordWrap: "on",
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  title,
  children,
  disabled,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded transition-all duration-150 ${
        disabled
          ? "text-[#30363d] cursor-not-allowed"
          : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]"
      }`}
    >
      {children}
    </button>
  );
}