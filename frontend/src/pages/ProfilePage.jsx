import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, ArrowLeft, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition mb-6 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg px-1"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-indigo-400" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user?.name || 'User'}</h1>
              <p className="text-sm text-slate-400">Your account details</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                <User className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Name</p>
                <p className="text-sm text-slate-100">{user?.name || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                <Mail className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</p>
                <p className="text-sm text-slate-100">{user?.email || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                <Shield className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Account Status</p>
                <p className="text-sm text-slate-100">Active</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:text-white bg-red-950/40 hover:bg-red-600 border border-red-900/60 hover:border-red-500 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
