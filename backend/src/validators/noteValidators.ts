import { body, param } from "express-validator";

// Tiptap sends "<p></p>" for an empty editor, which passes notEmpty() as a string
// but is actually blank content - strip tags AND common whitespace entities
// (e.g. "&nbsp;", which Tiptap sometimes inserts) before checking.
function hasRealContent(value: string): boolean {
  if (typeof value !== "string") return false;
  const stripped = value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/g, " ")
    .replace(/&#xa0;/gi, " ")
    .trim();
  return stripped.length > 0;
}

export const createNoteValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("content")
    .trim()
    .notEmpty().withMessage("Content is required")
    .isLength({ max: 50000 }).withMessage("Content cannot exceed 50,000 characters")
    .custom((value) => hasRealContent(value))
    .withMessage("Content cannot be empty"),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 40 }).withMessage("Category cannot exceed 40 characters"),
  body("tags")
    .optional()
    .isArray().withMessage("Tags must be an array"),
];

export const updateNoteValidator = [
  param("id").isMongoId().withMessage("Invalid note ID"),
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("Title cannot be empty")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("content")
    .optional()
    .trim()
    .notEmpty().withMessage("Content cannot be empty")
    .isLength({ max: 50000 }).withMessage("Content cannot exceed 50,000 characters")
    .custom((value) => hasRealContent(value))
    .withMessage("Content cannot be empty"),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 40 }).withMessage("Category cannot exceed 40 characters"),
  body("tags")
    .optional()
    .isArray().withMessage("Tags must be an array"),
  body().custom((value) => {
    const editableFields = ["title", "content", "category", "tags"];
    const hasAtLeastOneField = editableFields.some((field) =>
      Object.prototype.hasOwnProperty.call(value, field)
    );
    if (!hasAtLeastOneField) {
      throw new Error(
        "At least one field (title, content, category, or tags) must be provided"
      );
    }
    return true;
  }),
];

export const noteIdValidator = [
  param("id").isMongoId().withMessage("Invalid note ID"),
];
