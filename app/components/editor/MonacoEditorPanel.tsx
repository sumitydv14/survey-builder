"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";

interface Props {
  code: string;
  format: string;
  setCode: (v: string) => void;
  addedRange?: { start: number; end: number } | null;
  schemaError?: boolean;
}

export default function MonacoEditorPanel({
  code,
  format,
  setCode,
  addedRange,
  schemaError,
}: Props) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationIdsRef = useRef<string[]>([]);

  const handleMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

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

  useEffect(() => {
  if (!monacoRef.current || !editorRef.current) return;

  const model = editorRef.current.getModel();

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
    <div className="h-full">
      <Editor
        height="100%"
        language={format}
        value={code}
        onMount={handleMount}
        onChange={(val) => setCode(val || "")}
      />
    </div>
  );
}