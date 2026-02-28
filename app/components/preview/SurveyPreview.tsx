"use client";

interface Question {
  id: string;
  type: string;
  label?: string;
  options?: string[];
}

export default function SurveyPreview({
  schema,
}: {
  schema: any;
}) {
  if (!schema?.questions) {
    return <p className="text-gray-400">No Preview</p>;
  }

  return (
    <div className="p-4 space-y-4">
      {schema.questions.map((q: Question) => {
        if (q.type === "single-select") {
          return (
            <div key={q.id}>
              <p>{q.label}</p>
              {q.options?.map((opt) => (
                <label key={opt} className="block">
                  <input type="radio" name={q.id} /> {opt}
                </label>
              ))}
            </div>
          );
        }

        if (q.type === "multi-select") {
          return (
            <div key={q.id}>
              <p>{q.label}</p>
              {q.options?.map((opt) => (
                <label key={opt} className="block">
                  <input type="checkbox" /> {opt}
                </label>
              ))}
            </div>
          );
        }

        if (q.type === "text") {
          return (
            <div key={q.id}>
              <p>{q.label}</p>
              <input className="border p-2 w-full" />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}