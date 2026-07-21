import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import DeleteModal from '../components/DeleteModal';
import { fetchNotesApi, createNoteApi, updateNoteApi, deleteNoteApi } from '../api/notesApi';
import { Plus, Search, Notebook, Loader2, LayoutGrid, List } from 'lucide-react';

export default function DashboardPage() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [activeCategory, setActiveCategory] = useState(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const loadNotes = async () => {
    try {
      const res = await fetchNotesApi();
      const notesData = res.data?.notes || res.data || res || [];
      setNotes(Array.isArray(notesData) ? notesData : []);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const categories = useMemo(() => {
    const cats = notes.map(n => n.category).filter(Boolean);
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

  const handleOpenEditModal = (note) => {
    setSelectedNote(note);
    setIsNoteModalOpen(true);
  };

  const handleOpenDeleteModal = (note) => {
    setSelectedNote(note);
    setIsDeleteModalOpen(true);
  };

  const handleSaveNote = async (formData) => {
    if (selectedNote) {
      await updateNoteApi(selectedNote._id || selectedNote.id, formData);
    } else {
      await createNoteApi(formData);
    }
    await loadNotes();
  };

  const handleDeleteNote = async () => {
    if (selectedNote) {
      await deleteNoteApi(selectedNote._id || selectedNote.id);
      await loadNotes();
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

          <div className="flex items-center gap-3">
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
                key={note._id || note.id}
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
