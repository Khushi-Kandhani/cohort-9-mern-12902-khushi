import mongoose, { Schema, Document } from "mongoose";

interface INote extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

const noteSchema = new Schema<INote>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Note content is required"],
      maxlength: [50000, "Content cannot exceed 50,000 characters"],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [40, "Category cannot exceed 40 characters"],
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

const Note = mongoose.model<INote>("Note", noteSchema);
export default Note;
