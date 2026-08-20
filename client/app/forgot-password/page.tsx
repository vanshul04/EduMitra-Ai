"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { GraduationCap, Sparkles, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/useAuth";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        setErrorMessage(error.message);
        toast.error(error.message);
      } else {
        setSent(true);
        toast.success("Password reset email sent!");
      }
    } catch {
      setErrorMessage("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50 dark:bg-[#06060a]">
      {/* Brand Header */}
      <div className="mb-8 text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-6 w-6" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-300 animate-pulse" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            EduMitra<span className="text-indigo-600 dark:text-indigo-400">-AI</span>
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d19] p-8 shadow-2xl space-y-6">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Reset Link Sent!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              We have sent a password reset link to <strong className="text-slate-900 dark:text-white">{email}</strong>. Check your email inbox to update your password.
            </p>
            <Link href="/login" className="inline-block pt-2">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-4">
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Reset your password
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your email address and we will send you a password reset link.
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    required
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 text-xs bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 border-0 rounded-2xl"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Password Reset Link"}
              </Button>
            </form>

            <div className="text-center pt-2">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
