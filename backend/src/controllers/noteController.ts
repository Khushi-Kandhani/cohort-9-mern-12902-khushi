import Note from "../models/Note";
import asyncHandler from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import logger from "../middleware/logger";
import { emitToUser } from "../socket";
import { Response } from "express";

const createNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { title, content, category, tags } = req.body;
  const note = await Note.create({
    user: req.user.id,
    title,
    content,
    category: category || "",
    tags: tags || [],
  });
  logger.info({ userId: req.user.id, noteId: note._id }, "Note created");
  emitToUser(req.user.id, "note:created", note);
  res.status(201).json({ success: true, data: note });
});

const getNotes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: notes.length, data: notes });
});

const getNoteById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
  if (!note) {
    throw new AppError("Note not found", 404);
  }
  res.status(200).json({ success: true, data: note });
});

const updateNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { title, content, category, tags } = req.body;
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { title, content, category, tags },
    { new: true, runValidators: true }
  );
  if (!note) {
    throw new AppError("Note not found", 404);
  }
  logger.info({ userId: req.user.id, noteId: note._id }, "Note updated");
  emitToUser(req.user.id, "note:updated", note);
  res.status(200).json({ success: true, data: note });
});

const deleteNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!note) {
    throw new AppError("Note not found", 404);
  }
  logger.info({ userId: req.user.id, noteId: req.params.id }, "Note deleted");
  emitToUser(req.user.id, "note:deleted", { _id: req.params.id });
  res.status(200).json({ success: true, message: "Note deleted successfully" });
});

export { createNote, getNotes, getNoteById, updateNote, deleteNote };
