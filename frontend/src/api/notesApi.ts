import axiosClient from "./axiosClient";

// Fetch all notes for the logged-in user
export const fetchNotesApi = async () => {
  const response = await axiosClient.get("/notes");
  return response.data;
};

// Create a new note
export const createNoteApi = async (noteData: Record<string, unknown>) => {
  const response = await axiosClient.post("/notes", noteData);
  return response.data;
};

// Update an existing note
export const updateNoteApi = async (id: string, noteData: Record<string, unknown>) => {
  const response = await axiosClient.put(`/notes/${id}`, noteData);
  return response.data;
};

// Delete a note
export const deleteNoteApi = async (id: string) => {
  const response = await axiosClient.delete(`/notes/${id}`);
  return response.data;
};