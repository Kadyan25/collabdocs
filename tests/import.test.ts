import { describe, expect, it } from "vitest";
import { convertImportedFileToHtml, titleFromFilename } from "../src/lib/import";

describe("convertImportedFileToHtml", () => {
  it("converts markdown headings, bold, italic, and lists to HTML", () => {
    const md = "# Heading\n\n**bold** and *italic*\n\n- one\n- two";
    const html = convertImportedFileToHtml("notes.md", md);
    expect(html).toContain("<h1>Heading</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<li>one</li>");
  });

  it("strips a <script> tag embedded in imported markdown (XSS surface)", () => {
    const md = "# Title\n\n<script>alert('xss')</script>";
    const html = convertImportedFileToHtml("notes.md", md);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert(");
  });

  it("wraps plain text into paragraphs split on blank lines", () => {
    const text = "First paragraph.\n\nSecond paragraph.";
    const html = convertImportedFileToHtml("notes.txt", text);
    expect(html).toBe("<p>First paragraph.</p><p>Second paragraph.</p>");
  });

  it("escapes HTML special characters in plain text imports", () => {
    const text = "<script>alert('xss')</script>";
    const html = convertImportedFileToHtml("notes.txt", text);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("returns an empty paragraph for blank text input", () => {
    expect(convertImportedFileToHtml("notes.txt", "")).toBe("<p></p>");
  });
});

describe("titleFromFilename", () => {
  it("strips the .md and .txt extensions", () => {
    expect(titleFromFilename("My Notes.md")).toBe("My Notes");
    expect(titleFromFilename("draft.txt")).toBe("draft");
  });

  it("falls back to 'Imported Document' when the filename is empty after stripping", () => {
    expect(titleFromFilename(".md")).toBe("Imported Document");
  });
});
