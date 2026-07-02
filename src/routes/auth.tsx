import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import logo from "@/assets/nexmind-logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "NexMind — Sign in" },
      { name: "description", content: "Sign in to NexMind." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error("Email and a 6+ character password are required.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          // Auto-confirm is on; try signing in immediately as a safety net.
          const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
          if (e2) throw e2;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/hub" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
        extraParams: { prompt: "select_account" },
      });
      if (result.error) throw result.error;
      if (!result.redirected) navigate({ to: "/hub" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex flex-col items-center mb-8 gap-3">
          <img src={logo} alt="NexMind" width={56} height={56} className="rounded-xl shadow-lg" style={{ filter: "drop-shadow(0 0 24px oklch(0.6 0.2 240 / 0.4))" }} />
          <span className="text-2xl font-semibold tracking-tight">NexMind</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-lg font-semibold mb-1">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "signin" ? "Sign in to continue." : "It only takes a minute."}
          </p>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading}
            className="mb-4 w-full py-2.5 rounded-md text-sm font-medium border border-border bg-secondary hover:bg-accent transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md bg-input border border-border outline-none text-sm focus:border-ring"
              placeholder="Email"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md bg-input border border-border outline-none text-sm focus:border-ring"
              placeholder="Password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 w-full text-center text-xs text-muted-foreground hover:text-foreground transition"
          >
            {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#fff" d="M21.35 11.1H12v3.2h5.35c-.23 1.43-1.7 4.2-5.35 4.2-3.22 0-5.85-2.67-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.57-2.48C16.78 4.05 14.62 3.1 12 3.1 6.97 3.1 2.9 7.17 2.9 12.2s4.07 9.1 9.1 9.1c5.26 0 8.74-3.7 8.74-8.9 0-.6-.07-1.05-.15-1.5z"/></svg>
  );
}
