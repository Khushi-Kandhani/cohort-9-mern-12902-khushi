const express = require("express");
const router = express.Router();

const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

const {
  createNoteValidator,
  updateNoteValidator,
  noteIdValidator,
} = require("../validators/noteValidators");

const validate = require("../middleware/validate");
const authMiddleware = require("../middleware/auth");

// every route here requires a valid JWT
router.use(authMiddleware);

router.post("/", createNoteValidator, validate, createNote);
router.get("/", getNotes);
router.get("/:id", noteIdValidator, validate, getNoteById);
router.put("/:id", updateNoteValidator, validate, updateNote);
router.delete("/:id", noteIdValidator, validate, deleteNote);

module.exports = router;
