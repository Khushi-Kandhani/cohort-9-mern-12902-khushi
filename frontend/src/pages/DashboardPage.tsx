import { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import type { NoteFormData } from '../components/NoteModal';
import DeleteModal from '../components/DeleteModal';
import { fetchNotesApi, createNoteApi, updateNoteApi, deleteNoteApi } from '../api/notesApi';
import { getSocket } from '../socket';
import { Plus, Search, Notebook, Loader2, LayoutGrid, List, Download, Upload } from 'lucide-react';

interface Note {
  title?: string;
  content?: string;
  description?: string;
  category?: string;
  tags?: string[];
  updatedAt?: string;
  createdAt?: string;
  _id: string;
}

interface ImportedNote {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

function isImportedNote(value: unknown): value is ImportedNote {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.title !== 'string' || !candidate.title.trim()) return false;
  if (typeof candidate.content !== 'string' || !candidate.content.trim()) return false;
  if (candidate.category !== undefined && typeof candidate.category !== 'string') return false;
  if (candidate.tags !== undefined) {
    if (!Array.isArray(candidate.tags)) return false;
    if (!candidate.tags.every((t) => typeof t === 'string')) return false;
  }
  return true;
}

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadNotes = async () => {
    try {
      const res = await fetchNotesApi();
      const notesData = res.data || [];
      setNotes(Array.isArray(notesData) ? notesData : []);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // Live sync: if this same user has another tab/device open, creating,
  // editing, or deleting a note there updates this tab instantly too,
  // without needing a manual refresh.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleCreated = (note: Note) => {
      setNotes((prev) => {
        if (prev.some((n) => n._id === note._id)) return prev;
        return [note, ...prev];
      });
    };

    const handleUpdated = (note: Note) => {
      setNotes((prev) => prev.map((n) => (n._id === note._id ? note : n)));
    };

    const handleDeleted = (payload: { _id: string }) => {
      setNotes((prev) => prev.filter((n) => n._id !== payload._id));
    };

    socket.on('note:created', handleCreated);
    socket.on('note:updated', handleUpdated);
    socket.on('note:deleted', handleDeleted);

    return () => {
      socket.off('note:created', handleCreated);
      socket.off('note:updated', handleUpdated);
      socket.off('note:deleted', handleDeleted);
    };
  }, []);

  const categories = useMemo(() => {
    const cats = notes.map(n => n.category).filter((c): c is string => typeof c === 'string');
    return Array.from(new Set(cats));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const query = searchQuery.toLowerCase();
      const title = (note.title || '').toLowerCase();
      const content = (note.content || note.description || '').toLowerCase();
      const category = (note.category || '').toLowerCase();

      const matchesSearch = title.includes(query) || content.includes(query) || category.includes(query);
      const matchesCategory = !activeCategory || category === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [notes, searchQuery, activeCategory]);

  const handleOpenCreateModal = () => {
    setSelectedNote(null);
    setIsNoteModalOpen(true);
  };

  const handleOpenEditModal = (note: Note) => {
    setSelectedNote(note);
    setIsNoteModalOpen(true);
  };

  const handleOpenDeleteModal = (note: Note) => {
    setSelectedNote(note);
    setIsDeleteModalOpen(true);
  };

  const handleSaveNote = async (formData: NoteFormData) => {
    try {
      if (selectedNote) {
        if (!selectedNote._id) {
          toast.error('Note ID is missing');
          return;
        }
        await updateNoteApi(selectedNote._id, formData);
        toast.success('Note updated');
      } else {
        await createNoteApi(formData);
        toast.success('Note created');
      }
      setIsNoteModalOpen(false);
      await loadNotes();
    } catch (err) {
      toast.error(selectedNote ? 'Failed to update note' : 'Failed to create note');
      throw err;
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    try {
      if (!selectedNote._id) {
        toast.error('Note ID is missing');
        return;
      }
      await deleteNoteApi(selectedNote._id);
      toast.success('Note deleted');
      setIsDeleteModalOpen(false);
      await loadNotes();
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const handleExportNotes = () => {
    if (notes.length === 0) {
      toast.error('No notes to export');
      return;
    }

    const exportData = notes.map(({ title, content, category, tags }) => ({
      title,
      content,
      category: category || '',
      tags: tags || [],
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${exportData.length} note${exportData.length === 1 ? '' : 's'}`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        throw new Error('File must contain a JSON array of notes');
      }

      let successCount = 0;
      let failCount = 0;

      for (const item of parsed) {
        if (!isImportedNote(item)) {
          failCount++;
          continue;
        }
        try {
          await createNoteApi({
            title: item.title,
            content: item.content,
            category: item.category || '',
            tags: item.tags || [],
          });
          successCount++;
        } catch {
          failCount++;
        }
      }

      await loadNotes();

      if (successCount > 0) {
        toast.success(`Imported ${successCount} note${successCount === 1 ? '' : 's'}`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} note${failCount === 1 ? '' : 's'} failed to import`);
      }
    } catch (err) {
      console.error('Import failed:', err);
      toast.error('Invalid file - could not import notes');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by title, content, or tag..."
              aria-label="Search notes"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800"
              role="group"
              aria-label="View options"
            >
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-slate-800 text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
                }`}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <LayoutGrid className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-slate-800 text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
                }`}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <button
              onClick={handleExportNotes}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Export notes as JSON"
              aria-label="Export notes"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
              title="Import notes from JSON"
              aria-label="Import notes"
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
              aria-hidden="true"
            />

            <button
              onClick={handleOpenCreateModal}
              className="py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Create Note</span>
            </button>
          </div>
        </div>

        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter notes by category">
            <span className="text-xs font-medium text-slate-500 shrink-0">Categories:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-600/20'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
                aria-label={`Filter by ${cat}`}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-300">Loading your notes...</p>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                : 'flex flex-col gap-4'
            }
          >
            {filteredNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                className={viewMode === 'list' ? 'w-full' : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl">
            <div className="p-4 rounded-full bg-slate-900 text-slate-600">
              <Notebook className="w-8 h-8" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-300">
                {searchQuery || activeCategory ? 'No notes matched your filters' : 'No notes created yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {searchQuery || activeCategory
                  ? 'Try adjusting your search or category filter.'
                  : 'Click the "Create Note" button above to get started with your first note!'}
              </p>
            </div>
          </div>
        )}
      </main>

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        initialData={selectedNote}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteNote}
        noteTitle={selectedNote?.title || ''}
      />
    </div>
  );
}
