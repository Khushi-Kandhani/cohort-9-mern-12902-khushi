import axiosClient from "./axiosClient";
import type { NoteFormData } from "../components/NoteModal";

interface Note {
  _id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

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

const request = async <T>(requestFn: () => Promise<{ data: T }>): Promise<T> => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

// Fetch all notes for the logged-in user
export const fetchNotesApi = async (): Promise<ApiResponse<Note[]>> => {
  return request(() => axiosClient.get<ApiResponse<Note[]>>("/notes"));
};

// Create a new note
export const createNoteApi = async (noteData: NoteFormData): Promise<ApiResponse<Note>> => {
  return request(() => axiosClient.post<ApiResponse<Note>>("/notes", noteData));
};

// Update an existing note
export const updateNoteApi = async (
  id: string,
  noteData: Partial<NoteFormData>
): Promise<ApiResponse<Note>> => {
  return request(() => axiosClient.put<ApiResponse<Note>>(`/notes/${id}`, noteData));
};

// Delete a note
export const deleteNoteApi = async (id: string): Promise<ApiResponse<null>> => {
  return request(() => axiosClient.delete<ApiResponse<null>>(`/notes/${id}`));
};
