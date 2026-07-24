const { body, param } = require("express-validator");

const createNoteValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("content")
    .trim()
    .notEmpty().withMessage("Content is required"),
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
    .notEmpty().withMessage("Content cannot be empty"),
  body("tags")
    .optional()
    .isArray().withMessage("Tags must be an array"),
  body().custom((value, { req }) => {
    const allowedFields = ["title", "content", "tags"];
    const hasAtLeastOneField = allowedFields.some(
      (field) => req.body[field] !== undefined
    );
    if (!hasAtLeastOneField) {
      throw new Error(
        "Request body must include at least one of: title, content, tags"
      );
    }
    return true;
  }),
];

const noteIdValidator = [
  param("id").isMongoId().withMessage("Invalid note ID"),
];

module.exports = {
  createNoteValidator,
  updateNoteValidator,
  noteIdValidator,
};
