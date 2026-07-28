const Note = require("../models/Note");
const asyncHandler = require("../utils/asyncHandler");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../middleware/logger");

// POST /api/notes
const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;

  const note = await Note.create({
    user: req.user.id,
    title,
    content,
    tags: tags || [],
  });

  logger.info({ userId: req.user.id, noteId: note._id }, "Note created");

  res.status(201).json({ success: true, data: note });
});

// GET /api/notes
const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: notes.length, data: notes });
});

// GET /api/notes/:id
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id });

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  res.status(200).json({ success: true, data: note });
});

// PUT /api/notes/:id
const updateNote = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;

  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { title, content, tags },
    { new: true, runValidators: true }
  );

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  logger.info({ userId: req.user.id, noteId: note._id }, "Note updated");

  res.status(200).json({ success: true, data: note });
});

// DELETE /api/notes/:id
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  logger.info({ userId: req.user.id, noteId: req.params.id }, "Note deleted");

  res.status(200).json({ success: true, message: "Note deleted successfully" });
});

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote };
