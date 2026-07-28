import { useAuth } from '../context/AuthContext';
import { NotebookPen, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header
      className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30"
      aria-label="App header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500/50 transition-transform duration-200 hover:scale-105 active:scale-95"
            aria-hidden="true"
          >
            <NotebookPen className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
            NotesApp
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 transition-colors hover:border-indigo-500/40">
            <User className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
            <span>{user?.name || 'User'}</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 bg-transparent hover:bg-red-950/60 border border-slate-700 hover:border-red-500/40 rounded-lg transition cursor-pointer"
            aria-label="Logout"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
