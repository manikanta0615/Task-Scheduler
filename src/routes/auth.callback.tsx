import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing in — Task Scheduler" },
      { name: "description", content: "Completing sign-in to Task Scheduler." },
      { property: "og:title", content: "Signing in — Task Scheduler" },
      { property: "og:description", content: "Completing sign-in to Task Scheduler." },
    ],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate({ to: "/tasks", replace: true });
      return;
    }
    if (loading) return;
    // Give the OAuth session a moment to be set, then fall back to login.
    const timer = setTimeout(() => navigate({ to: "/login", replace: true }), 4000);
    return () => clearTimeout(timer);
  }, [session, loading, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Completing sign-in…
      </div>
    </main>
  );
}
