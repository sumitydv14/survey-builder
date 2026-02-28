import yaml from "js-yaml";

export function parseYAML(code: string) {
  return yaml.load(code);
}