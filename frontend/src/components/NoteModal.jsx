import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Save } from 'lucide-react';

export default function NoteModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({ title: '', content: '', category: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localOpen, setLocalOpen] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isClosingRef.current = false;
      setLocalOpen(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    } else if (localOpen && !isClosingRef.current) {
      isClosingRef.current = true;
      setIsVisible(false);
      const timer = setTimeout(() => {
        setLocalOpen(false);
        isClosingRef.current = false;
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [isOpen, localOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || initialData.description || '',
        category: initialData.category || '',
      });
    } else if (!isOpen) {
      setFormData({ title: '', content: '', category: '' });
    }
  }, [initialData, isOpen]);

  if (!localOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-220 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(2, 6, 23, 0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={initialData ? 'Edit Note' : 'Create New Note'}
        className={`w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl transition-all duration-220 ease-out ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-[0.97]'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-700/80 p-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {initialData ? 'Edit Note' : 'Create New Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="note-title" className="text-xs font-bold uppercase tracking-widest text-slate-100">
              Title
            </label>
            <input
              id="note-title"
              type="text"
              maxLength={120}
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Note title..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              aria-describedby="title-counter"
            />
            <span id="title-counter" className="text-[11px] font-medium text-slate-400">
              {formData.title.length}/120
            </span>
          </div>

          <div className="space-y-2">
            <label htmlFor="note-category" className="text-xs font-bold uppercase tracking-widest text-slate-100">
              Category / Tag
            </label>
            <input
              id="note-category"
              type="text"
              maxLength={40}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Work, Personal, Ideas"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              aria-describedby="category-counter"
            />
            <span id="category-counter" className="text-[11px] font-medium text-slate-400">
              {formData.category.length}/40
            </span>
          </div>

          <div className="space-y-2">
            <label htmlFor="note-content" className="text-xs font-bold uppercase tracking-widest text-slate-100">
              Content
            </label>
            <textarea
              id="note-content"
              rows={5}
              required
              maxLength={800}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your note here..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
              aria-describedby="content-counter"
            />
            <span id="content-counter" className="text-[11px] font-medium text-slate-400">
              {formData.content.length}/800
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-700/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{initialData ? 'Update' : 'Save'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
