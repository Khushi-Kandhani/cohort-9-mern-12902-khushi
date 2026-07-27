import axios from "axios";
import axiosClient from "./axiosClient";

const isAxiosError = (error: unknown): boolean =>
  typeof error === "object" && error !== null && "isAxiosError" in error;

const normalizeApiError = (error: unknown) => {
  if (isAxiosError(error)) {
    return error;
  }
  const message = "Something went wrong. Please try again.";
  const normalized = new Error(message) as Error & {
    response: { data: { message: string } };
  };
  normalized.response = { data: { message } };
  return normalized;
};

const request = async (requestFn: () => Promise<{ data: any }>): Promise<any> => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

// Fetch all notes for the logged-in user
export const fetchNotesApi = async () => {
  return request(() => axiosClient.get("/notes"));
};

// Create a new note
export const createNoteApi = async (noteData: Record<string, unknown>) => {
  return request(() => axiosClient.post("/notes", noteData));
};

// Update an existing note
export const updateNoteApi = async (id: string, noteData: Record<string, unknown>) => {
  return request(() => axiosClient.put(`/notes/${id}`, noteData));
};

// Delete a note
export const deleteNoteApi = async (id: string) => {
  return request(() => axiosClient.delete(`/notes/${id}`));
};