import Note from "../models/Note";
import asyncHandler from "../utils/asyncHandler";
import { AppError } from "../middleware/errorHandler";
import logger from "../middleware/logger";
import { Request, Response } from "express";

const createNote = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, tags } = req.body;

  const note = await Note.create({
    user: (req as any).user.id,
    title,
    content,
    tags: tags || [],
  });

  logger.info({ userId: (req as any).user.id, noteId: note._id }, "Note created");

  res.status(201).json({ success: true, data: note });
});

const getNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = await Note.find({ user: (req as any).user.id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: notes.length, data: notes });
});

const getNoteById = asyncHandler(async (req: Request, res: Response) => {
  const note = await Note.findOne({ _id: req.params.id, user: (req as any).user.id });

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  res.status(200).json({ success: true, data: note });
});

const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, tags } = req.body;

  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: (req as any).user.id },
    { title, content, tags },
    { new: true, runValidators: true }
  );

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  logger.info({ userId: (req as any).user.id, noteId: note._id }, "Note updated");

  res.status(200).json({ success: true, data: note });
});

const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: (req as any).user.id });

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  logger.info({ userId: (req as any).user.id, noteId: req.params.id }, "Note deleted");

  res.status(200).json({ success: true, message: "Note deleted successfully" });
});

export { createNote, getNotes, getNoteById, updateNote, deleteNote };