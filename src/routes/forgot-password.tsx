import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout, FieldError } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Forgot Password — Task Scheduler" },
      { name: "description", content: "Reset your Task Scheduler password." },
      { property: "og:title", content: "Forgot Password — Task Scheduler" },
      { property: "og:description", content: "Reset your Task Scheduler password." },
    ],
  }),
  component: ForgotPasswordPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!email.trim()) return setError("Email is required.");
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address.");
    setError(undefined);
    setLoading(true);
    const err = await resetPassword(email.trim());
    setLoading(false);
    if (err) {
      setError("Could not send the reset link. Please try again.");
      return;
    }
    setSent(true);
  }

  return (
    <AuthLayout title="Forgot Password" subtitle="We'll email you a link to reset it">
      {sent ? (
        <div className="flex flex-col items-center text-center">
          <MailCheck className="mb-3 h-10 w-10 text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
              aria-describedby="email-error"
            />
            <FieldError id="email-error" message={error} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
}
