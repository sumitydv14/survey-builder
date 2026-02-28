export interface ParseError {
  message: string;
  line?: number;
  column?: number;
  type: "syntax" | "structure" | "attribute" | "text";
}

export class XMLParseError extends Error {
  errors: ParseError[];
  constructor(errors: ParseError[]) {
    super(errors[0]?.message ?? "Invalid XML");
    this.errors = errors;
  }
}

export function parseXML(xml: string) {
  const errors: ParseError[] = [];

  // ── 1. Parse XML ──────────────────────────────────────────────────────────
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");

  // DOMParser puts a <parsererror> element on failure
  const parseErr = doc.querySelector("parsererror");
  if (parseErr) {
    // Extract the human-readable message from the parsererror node
    const raw = parseErr.textContent ?? "XML syntax error";

    // Try to pull out line/column numbers (browsers format varies)
    const lineMatch = raw.match(/[Ll]ine[^\d]*(\d+)/);
    const colMatch = raw.match(/[Cc]ol(?:umn)?[^\d]*(\d+)/);

    // Build a clean message
    const msg = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 2)
      .join(" — ");

    errors.push({
      type: "syntax",
      message: msg,
      line: lineMatch ? Number(lineMatch[1]) : undefined,
      column: colMatch ? Number(colMatch[1]) : undefined,
    });

    throw new XMLParseError(errors);
  }

  // ── 2. Root must be <survey> ───────────────────────────────────────────────
  const root = doc.documentElement;
  if (root.tagName !== "survey") {
    errors.push({
      type: "structure",
      message: `Root element must be <survey>, got <${root.tagName}>`,
    });
    throw new XMLParseError(errors);
  }

  // ── 3. Stray text directly inside <survey> ────────────────────────────────
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? "").trim();
      if (text.length > 0) {
        errors.push({
          type: "text",
          message: `Unexpected text content inside <survey>: "${text.slice(0, 40)}"`,
        });
      }
    }
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node as Element).tagName !== "question"
    ) {
      errors.push({
        type: "structure",
        message: `Unexpected element <${(node as Element).tagName}> inside <survey>. Only <question> is allowed.`,
      });
    }
  });

  // ── 4. Validate each <question> ───────────────────────────────────────────
  const questions = Array.from(doc.querySelectorAll("question"));

  questions.forEach((q, idx) => {
    const num = idx + 1;

    // Required attributes
    const id = q.getAttribute("id");
    const type = q.getAttribute("type");

    if (!id) {
      errors.push({
        type: "attribute",
        message: `Question #${num}: missing required attribute "id"`,
      });
    }
    if (!type) {
      errors.push({
        type: "attribute",
        message: `Question #${num} (${id ?? "?"}): missing required attribute "type"`,
      });
    }

    // Valid types
    const validTypes = ["single-select", "multi-select", "text", "rating", "textarea"];
    if (type && !validTypes.includes(type)) {
      errors.push({
        type: "attribute",
        message: `Question ${id ?? `#${num}`}: unknown type "${type}". Expected: ${validTypes.join(", ")}`,
      });
    }

    // Must have a <label>
    const label = q.querySelector("label");
    if (!label || !label.textContent?.trim()) {
      errors.push({
        type: "structure",
        message: `Question ${id ?? `#${num}`}: missing or empty <label>`,
      });
    }

    // Stray text directly inside <question>
    q.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.textContent ?? "").trim();
        if (text.length > 0) {
          errors.push({
            type: "text",
            message: `Question ${id ?? `#${num}`}: unexpected text "${text.slice(0, 40)}" inside <question>`,
          });
        }
      }
    });

    // select-type questions should have at least 2 options
    if (type === "single-select" || type === "multi-select") {
      const options = Array.from(q.querySelectorAll("option"));
      if (options.length < 2) {
        errors.push({
          type: "structure",
          message: `Question ${id ?? `#${num}`} (${type}): needs at least 2 <option> elements, found ${options.length}`,
        });
      }
    }
  });

  if (errors.length > 0) {
    throw new XMLParseError(errors);
  }

  // ── 5. Build and return the clean schema ──────────────────────────────────
  return {
    questions: questions.map((q) => ({
      id: q.getAttribute("id"),
      type: q.getAttribute("type"),
      label: q.querySelector("label")?.textContent?.trim(),
      options: Array.from(q.querySelectorAll("option")).map(
        (o) => o.textContent?.trim()
      ),
    })),
  };
}