import { useEffect } from "react";

export default function useAutoSave(
  code: string,
  format: string,
  surveyId: string
) {
  useEffect(() => {
    if (!surveyId) return;

    const timer = setTimeout(async () => {
      // Single call — autosave route now updates rawCode + format + versions
      await fetch(`/api/surveys/${surveyId}/autosave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, format }),
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [code, format, surveyId]);
}