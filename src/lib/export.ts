import TurndownService from "turndown";

const turndownService = new TurndownService({ headingStyle: "atx" });
turndownService.addRule("underline", {
  filter: ["u"],
  replacement: (content) => `<u>${content}</u>`,
});

export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html);
}

export function slugifyFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "document";
}
