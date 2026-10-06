import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout, FieldError } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set New Password — Task Scheduler" },
      { name: "description", content: "Choose a new password for your Task Scheduler account." },
      { property: "og:title", content: "Set New Password — Task Scheduler" },
      { property: "og:description", content: "Choose a new password for your Task Scheduler account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { updatePassword, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    const next: typeof errors = {};
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    const err = await updatePassword(password);
    setLoading(false);
    if (err) {
      setErrors({ form: "Could not update your password. The link may have expired." });
      return;
    }
    toast.success("Password updated.");
    navigate({ to: "/tasks", replace: true });
  }

  if (!authLoading && !session) {
    return (
      <AuthLayout title="Link expired">
        <p className="text-center text-sm text-muted-foreground">
          This reset link is invalid or has expired. Please request a new one.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link to="/forgot-password">Request new link</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set New Password">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="password-error"
          />
          <FieldError id="password-error" message={errors.password} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-describedby="confirm-error"
          />
          <FieldError id="confirm-error" message={errors.confirm} />
        </div>
        {errors.form ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {errors.form}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading || authLoading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Update Password
        </Button>
      </form>
    </AuthLayout>
  );
}
