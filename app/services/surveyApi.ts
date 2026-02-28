export async function createSurvey(data: {
  title: string;
  description: string;
  product: string;
}) {
  const res = await fetch("/api/surveys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function getSurveys() {
  const res = await fetch("/api/surveys");
  return res.json();
}