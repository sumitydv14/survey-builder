export function parseXML(xml: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");

  const questions = Array.from(
    doc.querySelectorAll("question")
  ).map((q) => ({
    id: q.getAttribute("id"),
    type: q.getAttribute("type"),
    label: q.querySelector("label")?.textContent,
    options: Array.from(q.querySelectorAll("option")).map(
      (o) => o.textContent
    ),
  }));

  return { questions };
}