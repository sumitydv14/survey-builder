export function smartInsertQuestions(
  currentSchema: any,
  aiQuestions: any[]
) {
  if (!currentSchema?.questions) {
    return {
      ...currentSchema,
      questions: aiQuestions,
    };
  }

  const existing = [...currentSchema.questions];

  aiQuestions.forEach((aiQ) => {
    const lastIndex = [...existing]
      .map((q, i) => ({ q, i }))
      .filter((x) => x.q.type === aiQ.type)
      .pop();

    if (lastIndex) {
      existing.splice(lastIndex.i + 1, 0, aiQ);
    } else {
      existing.push(aiQ);
    }
  });

  return {
    ...currentSchema,
    questions: existing,
  };
}