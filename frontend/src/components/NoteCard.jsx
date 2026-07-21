import { Edit3, Trash2, Tag, Calendar } from 'lucide-react';

export default function NoteCard({ note, onEdit, onDelete, className }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <article
      className={`group w-full bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 ${className || ''}`}
      aria-label={note.title || 'Note'}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-slate-100 text-base group-hover:text-indigo-300 transition-colors line-clamp-1">
            {note.title}
          </h3>
          {note.category && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-normal px-2.5 py-1 rounded-md bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shrink-0"
              aria-label={`Category: ${note.category}`}
            >
              <Tag className="w-3 h-3" aria-hidden="true" />
              {note.category}
            </span>
          )}
        </div>

        <p className="text-slate-300 text-sm leading-relaxed line-clamp-4 whitespace-pre-line">
          {note.content || note.description}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>{formatDate(note.updatedAt || note.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(note)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition cursor-pointer"
            title="Edit Note"
            aria-label={`Edit note: ${note.title || 'Untitled'}`}
          >
            <Edit3 className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => onDelete(note)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition cursor-pointer"
            title="Delete Note"
            aria-label={`Delete note: ${note.title || 'Untitled'}`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
