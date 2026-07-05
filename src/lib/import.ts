import { marked } from "marked";
import { sanitizeDocumentHtml } from "@/lib/sanitize";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function textToHtml(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return "<p></p>";

  return paragraphs
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function convertImportedFileToHtml(filename: string, text: string): string {
  const isMarkdown = filename.toLowerCase().endsWith(".md");
  const html = isMarkdown ? (marked.parse(text) as string) : textToHtml(text);
  return sanitizeDocumentHtml(html);
}

export function titleFromFilename(filename: string): string {
  return filename.replace(/\.(txt|md)$/i, "").trim() || "Imported Document";
}
