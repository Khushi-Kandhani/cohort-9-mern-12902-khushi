const { body, param } = require("express-validator");

// Tiptap sends "<p></p>" for an empty editor, which passes notEmpty() as a string
// but is actually blank content - strip tags before checking
function hasRealContent(value) {
  const stripped = value.replace(/<[^>]*>/g, "").trim();
  return stripped.length > 0;
}

const createNoteValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("content")
    .trim()
    .notEmpty().withMessage("Content is required")
    .custom((value) => hasRealContent(value))
    .withMessage("Content cannot be empty"),
  body("tags")
    .optional()
    .isArray().withMessage("Tags must be an array"),
];

const updateNoteValidator = [
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
    .custom((value) => hasRealContent(value))
    .withMessage("Content cannot be empty"),
  body("tags")
    .optional()
    .isArray().withMessage("Tags must be an array"),
  body().custom((value) => {
    if (!value.title && !value.content && !value.tags) {
      throw new Error("At least one field (title, content, or tags) must be provided");
    }
    return true;
  }),
];

const noteIdValidator = [
  param("id").isMongoId().withMessage("Invalid note ID"),
];

module.exports = { createNoteValidator, updateNoteValidator, noteIdValidator };
