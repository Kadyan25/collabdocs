import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = ["p", "h1", "h2", "ul", "ol", "li", "strong", "em", "u", "br"];

export function sanitizeDocumentHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {},
  });
}
