import { useEffect } from "react";

export default function useAutoSave(
  code: string,
  format: string,
  surveyId: string
) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      await fetch(`/api/surveys/${surveyId}/autosave`, {
        method: "POST",
        body: JSON.stringify({ code, format }),
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [code, format, surveyId]);
}