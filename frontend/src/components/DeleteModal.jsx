import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function DeleteModal({ isOpen, onClose, onConfirm, noteTitle }) {
  const [isDeleting, setIsDeleting] = useState(false);
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

  if (!localOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setIsDeleting(false);
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
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
        className={`w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center space-y-4 shadow-2xl transition-all duration-220 ease-out ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-[0.97]'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/50 text-red-300 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>

        <div className="space-y-1.5">
          <h3 id="delete-title" className="text-lg font-bold text-white">
            Delete Note?
          </h3>
          <p id="delete-desc" className="text-sm text-slate-300">
            Are you sure you want to delete <span className="text-slate-100 font-semibold">"{noteTitle}"</span>? This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
