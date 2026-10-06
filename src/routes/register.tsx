import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout, FieldError, OrDivider } from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/tasks" });
  },
  head: () => ({
    meta: [
      { title: "Create Account — Task Scheduler" },
      { name: "description", content: "Create a Task Scheduler account to organize your day." },
      { property: "og:title", content: "Create Account — Task Scheduler" },
      { property: "og:description", content: "Create a Task Scheduler account to organize your day." },
    ],
  }),
  component: RegisterPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

type Errors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirm?: string;
  form?: string;
};

function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    const next: Errors = {};
    if (!fullName.trim()) next.fullName = "Full name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < MIN_PASSWORD)
      next.password = `Password must be at least ${MIN_PASSWORD} characters.`;
    if (!confirm) next.confirm = "Please confirm your password.";
    else if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const result = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (result.error) {
      const msg = /already registered|already exists/i.test(result.error)
        ? "An account with this email already exists."
        : /pwned|leaked|weak/i.test(result.error)
          ? "This password is too weak or has appeared in a data breach. Choose another."
          : "Registration failed. Please try again.";
      setErrors({ form: msg });
      return;
    }
    if (result.needsConfirmation) {
      setConfirmationSentTo(email.trim());
      return;
    }
    navigate({ to: "/tasks", replace: true });
  }

  if (confirmationSentTo) {
    return (
      <AuthLayout title="Check your email">
        <div className="flex flex-col items-center text-center">
          <MailCheck className="mb-3 h-10 w-10 text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{confirmationSentTo}</span>. Click it to
            activate your account, then log in.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link to="/login">Back to Login</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create Account" subtitle="Start organizing your day">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={!!errors.fullName}
            aria-describedby="fullName-error"
          />
          <FieldError id="fullName-error" message={errors.fullName} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
          />
          <FieldError id="email-error" message={errors.email} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
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
            aria-invalid={!!errors.confirm}
            aria-describedby="confirm-error"
          />
          <FieldError id="confirm-error" message={errors.confirm} />
        </div>
        {errors.form ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {errors.form}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Create Account
        </Button>
      </form>
      <OrDivider />
      <GoogleButton disabled={loading} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
