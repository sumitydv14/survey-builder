import { parseXML, XMLParseError, ParseError } from "./xmlParser";
import { parseJSON } from "./jsonParser";
import { parseYAML } from "./yamlParser";

export interface SurveyParseResult {
  schema: any | null;
  errors: ParseError[];
}

export function parseSurvey(code: string, format: string): SurveyParseResult {
  try {
    if (format === "xml") {
      const schema = parseXML(code);
      return { schema, errors: [] };
    }
    if (format === "json") {
      const schema = parseJSON(code);
      return { schema, errors: [] };
    }
    if (format === "yaml") {
      const schema = parseYAML(code);
      return { schema, errors: [] };
    }
    return { schema: null, errors: [{ type: "syntax", message: `Unknown format: ${format}` }] };
  } catch (e) {
    if (e instanceof XMLParseError) {
      return { schema: null, errors: e.errors };
    }
    // JSON / YAML parse errors
    const msg = e instanceof Error ? e.message : String(e);
    // Try to extract line number from JSON errors
    const lineMatch = msg.match(/line (\d+)/i);
    return {
      schema: null,
      errors: [
        {
          type: "syntax",
          message: msg,
          line: lineMatch ? Number(lineMatch[1]) : undefined,
        },
      ],
    };
  }
}