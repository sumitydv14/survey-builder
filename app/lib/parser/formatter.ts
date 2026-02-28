import yaml from "js-yaml";

export function schemaToXML(schema: any) {
  if (!schema?.questions) return "<survey></survey>";

  const questions = schema.questions
    .map(
      (q: any) => `
  <question id="${q.id}" type="${q.type}">
    <label>${q.label}</label>
    ${
      q.options
        ?.map((o: string) => `<option>${o}</option>`)
        .join("\n") || ""
    }
  </question>`
    )
    .join("\n");

  return `<survey>${questions}
</survey>`;
}

export function schemaToJSON(schema: any) {
  return JSON.stringify(schema, null, 2);
}

export function schemaToYAML(schema: any) {
  return yaml.dump(schema);
}