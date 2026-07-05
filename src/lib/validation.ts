import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
});

export const updateDocumentSchema = z
  .object({
    title: z.string().trim().min(1, "Title cannot be empty").max(200).optional(),
    content: z.string().max(1_000_000).optional(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "Provide at least a title or content to update",
  });

export const shareDocumentSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  role: z.enum(["VIEWER", "EDITOR"]).default("EDITOR"),
});

export const loginSchema = z.object({
  userId: z.string().min(1),
});

export const createCommentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty").max(2_000),
});

export const ALLOWED_IMPORT_EXTENSIONS = [".txt", ".md"] as const;
export const MAX_IMPORT_SIZE_BYTES = 1_000_000;
