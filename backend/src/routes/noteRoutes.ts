import express from "express";
const router = express.Router();

import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "../controllers/noteController";

import {
  createNoteValidator,
  updateNoteValidator,
  noteIdValidator,
} from "../validators/noteValidators";

import validate from "../middleware/validate";
import authMiddleware from "../middleware/auth";

router.use(authMiddleware as express.RequestHandler);

router.post("/", createNoteValidator, validate, createNote);
router.get("/", getNotes);
router.get("/:id", noteIdValidator, validate, getNoteById);
router.put("/:id", updateNoteValidator, validate, updateNote);
router.delete("/:id", noteIdValidator, validate, deleteNote);

export default router;