"use client";

import { useEffect, useMemo, useState } from "react";
import EditorLayout from '../../../components/editor/EditorLayout';
import MonacoEditorPanel from "../../../components/editor/MonacoEditorPanel";
import FormatSwitcher from "../../../components/editor/FormatSwitcher";
import ChatAIPanel from "../../../components/chatAI/ChatAIPanel";
import { parseSurvey } from "../../../lib/parser";
import { smartInsertQuestions } from "../../../lib/parser/smartInsert";
import useAutoSave from "../../../hooks/useAutoSave";
import { useParams } from "next/navigation";

import {
    schemaToXML,
    schemaToJSON,
    schemaToYAML,
} from "../../../lib/parser/formatter";

import dynamic from "next/dynamic";
import ErrorPanel from "@/app/components/editor/ErrorPanel";

const SurveyPreview = dynamic(
  () => import("../../../components/preview/SurveyPreview"),
  { ssr: false }
);

export default function SurveyEditor() {
    const params = useParams();
    const surveyId = params?.id as string;
    const [format, setFormat] = useState("xml");
    const [addedRange, setAddedRange] = useState<any>(null);

    const [code, setCode] = useState(`<survey>
</survey>`);

const schema = useMemo(() => {
  try {
    return parseSurvey(code, format);
  } catch {
    return null;
  }
}, [code, format]);
    const schemaError = !schema;
    const handleFormatChange = (newFormat: string) => {
        const schema = parseSurvey(code, format);

        if (!schema) return;

        let newCode = code;

        if (newFormat === "xml") newCode = schemaToXML(schema);
        if (newFormat === "json") newCode = schemaToJSON(schema);
        if (newFormat === "yaml") newCode = schemaToYAML(schema);

        setFormat(newFormat);
        setCode(newCode);
    };

    const getNextQuestionIdFromSchema = (schema: any) => {
        const ids =
            schema?.questions?.map((q: any) =>
                Number(q.id?.replace("q", ""))
            ) || [];

        if (!ids.length) return "q1";

        return `q${Math.max(...ids) + 1}`;
    };

    const handleKeep = (schemaFromAI: any) => {
        const currentSchema = parseSurvey(code, format);

        if (!currentSchema) return;

        // 👉 next id calculate
        let nextIndex = getNextQuestionIdFromSchema(currentSchema);

        const aiQuestions =
            schemaFromAI.questions?.map((q: any) => {
                const newQ = {
                    ...q,
                    id: nextIndex,
                };

                // increment id for next question
                const num = Number(nextIndex.replace("q", "")) + 1;
                nextIndex = `q${num}`;

                return newQ;
            }) || [];

        const merged = smartInsertQuestions(
            currentSchema,
            aiQuestions
        );

        let newCode = code;

        if (format === "xml") newCode = schemaToXML(merged);
        if (format === "json") newCode = schemaToJSON(merged);
        if (format === "yaml") newCode = schemaToYAML(merged);

        setCode(newCode);
    };

    if (surveyId) {
  useAutoSave(code, format, surveyId);
}

useEffect(() => {
  const loadSurvey = async () => {
    if (!surveyId) return;

    const res = await fetch(`/api/surveys/${surveyId}`);
    const data = await res.json();

    // ⭐ IMPORTANT
    if (data?.survey?.rawCode) {
      setCode(data.survey.rawCode);
    }
  };

  loadSurvey();
}, [surveyId]);

    return (
        <EditorLayout
            editor={
                <div className="h-full flex flex-col">
                    <FormatSwitcher
                        format={format}
                        setFormat={handleFormatChange}
                    />

                    <MonacoEditorPanel
                        code={code}
                        format={format}
                        setCode={setCode}
                        addedRange={addedRange}
                        schemaError={schemaError}
                    />
                <ErrorPanel error={schemaError ? "Invalid Schema" : null} />
                </div>
            }
            chat={<ChatAIPanel onKeep={handleKeep} />}
            preview={<SurveyPreview schema={schema} />}
        />
    );
}