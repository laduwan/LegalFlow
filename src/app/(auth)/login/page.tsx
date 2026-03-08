"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const registered = searchParams.get("registered");
  const autoDemo = searchParams.get("demo") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setError("");
    setIsDemoLoading(true);
    try {
      const result = await signIn("credentials", {
        email: "demo@legalflow.app",
        password: "demo",
        redirect: false,
      });
      if (result?.error) {
        setError("Demo login failed. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  useEffect(() => {
    if (autoDemo) {
      handleDemoLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDemo]);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="text-sm text-slate-400">
          Sign in to your account to continue
        </p>
      </div>

      {registered && (
        <div className="rounded-md border border-emerald-800 bg-emerald-950/50 p-3 text-sm text-emerald-400">
          Registration successful! Please sign in with your credentials.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-800 bg-red-950/50 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@lawfirm.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-600 text-white hover:bg-amber-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-2 text-slate-500">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={isDemoLoading || isLoading}
        className="w-full border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
        onClick={handleDemoLogin}
      >
        {isDemoLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading demo...
          </>
        ) : (
          "Try Demo — No account needed"
        )}
      </Button>

      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-amber-500 hover:text-amber-400"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
