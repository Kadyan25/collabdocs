import { describe, expect, it } from "vitest";
import { htmlToMarkdown, slugifyFilename } from "../src/lib/export";

describe("htmlToMarkdown", () => {
  it("converts headings to atx-style markdown", () => {
    expect(htmlToMarkdown("<h1>Title</h1>")).toContain("# Title");
    expect(htmlToMarkdown("<h2>Subtitle</h2>")).toContain("## Subtitle");
  });

  it("converts bold and italic", () => {
    const md = htmlToMarkdown("<p><strong>bold</strong> and <em>italic</em></p>");
    expect(md).toContain("**bold**");
    expect(md).toContain("_italic_");
  });

  it("converts underline to inline <u> tags since markdown has no native underline", () => {
    expect(htmlToMarkdown("<p><u>underlined</u></p>")).toContain("<u>underlined</u>");
  });

  it("converts bulleted and numbered lists", () => {
    const bulleted = htmlToMarkdown("<ul><li>one</li><li>two</li></ul>");
    expect(bulleted).toContain("one");
    expect(bulleted).toContain("two");

    const numbered = htmlToMarkdown("<ol><li>first</li><li>second</li></ol>");
    expect(numbered).toContain("1.");
  });
});

describe("slugifyFilename", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugifyFilename("My Document Title")).toBe("my-document-title");
  });

  it("strips special characters", () => {
    expect(slugifyFilename("Q&A: Notes! (draft)")).toBe("q-a-notes-draft");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugifyFilename("--Untitled--")).toBe("untitled");
  });

  it("falls back to 'document' when the title has no usable characters", () => {
    expect(slugifyFilename("!!!")).toBe("document");
    expect(slugifyFilename("")).toBe("document");
  });
});
