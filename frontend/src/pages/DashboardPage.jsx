import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="border-b border-stone-200 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="font-serif text-xl font-medium text-stone-800">
            Notes
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-500">{user?.name}</span>
            <button
              onClick={logout}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-600 transition hover:border-stone-400 hover:bg-stone-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="font-serif text-2xl text-stone-800">
          Welcome back, {user?.name?.split(" ")[0]}
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Your notes will show up here.
        </p>
      </main>
    </div>
  );
}
