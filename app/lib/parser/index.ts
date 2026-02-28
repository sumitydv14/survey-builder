import { parseXML } from "./xmlParser";
import { parseJSON } from "./jsonParser";
import { parseYAML } from "./yamlParser";


export function parseSurvey(
  code: string,
  format: string
) {
  try {
    if (format === "xml") return parseXML(code);
    if (format === "json") return parseJSON(code);
    if (format === "yaml") return parseYAML(code);
  } catch (e) {
    return null;
  }
}