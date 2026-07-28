import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, Loader2, StickyNote } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-500 via-accent-600 to-stone-750 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_50%)]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-[28rem] h-[28rem] bg-accent-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between w-full p-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <StickyNote className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-serif text-xl text-white">Notes</span>
          </div>

          <div className="max-w-md">
            <h1 className="font-serif text-5xl text-white leading-tight">
              Capture your thoughts, organize your life
            </h1>
            <p className="mt-6 text-lg text-white/75 leading-relaxed">
              A minimal, focused space for your ideas. Write, reflect, and stay
              productive with a notes experience designed for clarity.
            </p>
          </div>

          <div className="text-sm text-white/50">
            Built with care for people who think deeply.
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-cream-50 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-500 text-white mb-4">
              <StickyNote className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h1 className="font-serif text-2xl text-stone-800">Notes</h1>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl text-stone-800">Welcome back</h2>
            <p className="mt-2 text-sm text-stone-500">
              Log in to continue to your notes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-accent-400 focus:ring-4 focus:ring-accent-100"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-11 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-accent-400 focus:ring-4 focus:ring-accent-100"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 transition-colors hover:text-stone-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-accent-500 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-accent-600 hover:shadow-md hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-stone-500">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-accent-600 hover:text-accent-700 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
