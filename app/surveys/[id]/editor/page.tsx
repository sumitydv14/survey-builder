"use client";

import { useEffect, useMemo, useState } from "react";
import EditorLayout from '../../../components/editor/EditorLayout';
import MonacoEditorPanel from "../../../components/editor/MonacoEditorPanel";
import ChatAIPanel from "../../../components/chatAI/ChatAIPanel";
import ErrorPanel from "@/app/components/editor/ErrorPanel";
import { parseSurvey } from "../../../lib/parser";
import { smartInsertQuestions } from "../../../lib/parser/smartInsert";
import useAutoSave from "../../../hooks/useAutoSave";
import { useParams } from "next/navigation";

import {
    schemaToXML,
    schemaToJSON,
    schemaToYAML,
} from "../../../lib/parser/formatter";

export default function SurveyEditor() {
    const params = useParams();
    const surveyId = params?.id as string;
    const [format, setFormat] = useState("xml");
    const [addedRange, setAddedRange] = useState<any>(null);
    const [code, setCode] = useState(`<survey>\n</survey>`);

    // parseSurvey now returns { schema, errors[] }
    const { schema, errors: schemaErrors } = useMemo(
        () => parseSurvey(code, format),
        [code, format]
    );

    const schemaError = schema === null;

    // ✅ Hook always called unconditionally
    useAutoSave(code, format, surveyId ?? "");

    useEffect(() => {
        const loadSurvey = async () => {
            if (!surveyId) return;
            const res = await fetch(`/api/surveys/${surveyId}`);
            const data = await res.json();
            if (data?.survey?.schemaJson) {
                setCode(data.survey.schemaJson);
            }
        };
        loadSurvey();
    }, [surveyId]);

    const handleFormatChange = (newFormat: string) => {
        const { schema: currentSchema } = parseSurvey(code, format);
        if (!currentSchema) return;

        let newCode = code;
        if (newFormat === "xml") newCode = schemaToXML(currentSchema);
        if (newFormat === "json") newCode = schemaToJSON(currentSchema);
        if (newFormat === "yaml") newCode = schemaToYAML(currentSchema);

        setFormat(newFormat);
        setCode(newCode);
    };

    const getNextQuestionId = (schema: any) => {
        const ids = schema?.questions?.map((q: any) => Number(q.id?.replace("q", ""))) || [];
        if (!ids.length) return "q1";
        return `q${Math.max(...ids) + 1}`;
    };

    const handleKeep = (schemaFromAI: any) => {
        const { schema: currentSchema } = parseSurvey(code, format);
        if (!currentSchema) return;

        let nextIndex = getNextQuestionId(currentSchema);

        const aiQuestions = schemaFromAI.questions?.map((q: any) => {
            const newQ = { ...q, id: nextIndex };
            const num = Number(nextIndex.replace("q", "")) + 1;
            nextIndex = `q${num}`;
            return newQ;
        }) || [];

        const merged = smartInsertQuestions(currentSchema, aiQuestions);

        let newCode = code;
        if (format === "xml") newCode = schemaToXML(merged);
        if (format === "json") newCode = schemaToJSON(merged);
        if (format === "yaml") newCode = schemaToYAML(merged);

        setCode(newCode);
    };

    return (
        <EditorLayout
            editor={
                <div className="h-full flex flex-col">
                    <div className="flex-1 min-h-0">
                        <MonacoEditorPanel
                            code={code}
                            format={format}
                            setCode={setCode}
                            addedRange={addedRange}
                            schemaError={schemaError}
                            onFormatChange={handleFormatChange}
                            surveyId={surveyId}
                        />
                    </div>
                    {/* Always visible — passes real errors array */}
                    <ErrorPanel errors={schemaErrors} />
                </div>
            }
            chat={<ChatAIPanel onKeep={handleKeep} />}
        />
    );
}