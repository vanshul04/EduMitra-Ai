"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("Year 1");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signedUpSuccess, setSignedUpSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password strength logic
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Empty", color: "bg-slate-200" };
    if (pass.length < 6) return { score: 1, label: "Weak", color: "bg-rose-500" };
    if (pass.length < 8) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) && pass.length >= 8) {
      return { score: 4, label: "Strong", color: "bg-emerald-500" };
    }
    return { score: 3, label: "Good", color: "bg-indigo-500" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password || loading) return;

    if (password.length < 8) {
      const msg = "Password must be at least 8 characters long.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = "Passwords do not match. Please verify your password.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { user, error } = await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        college: college.trim(),
        course: course.trim(),
        year_of_study: yearOfStudy,
      });

      if (error) {
        let msg = error.message;
        const lower = msg.toLowerCase();
        if (lower.includes("rate limit") || lower.includes("rate_limit")) {
          msg = "Too many email requests. Please wait a while before trying again.";
        } else if (lower.includes("already registered") || lower.includes("already exists")) {
          msg = "An account with this email already exists. Try logging in.";
        }
        setErrorMessage(msg);
        toast.error(msg);
      } else {
        setSignedUpSuccess(true);
        toast.success("Account created successfully!");
      }
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : "Signup failed.";
      if (msg.toLowerCase().includes("rate limit")) {
        msg = "Too many email requests. Please wait a while before trying again.";
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (signedUpSuccess) {
    return (
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-indigo-500/30 bg-white/90 dark:bg-[#0c0d19]/90 backdrop-blur-xl p-8 shadow-2xl text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 mx-auto animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Verify Your Email Address
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            We have sent a verification link to <strong className="text-slate-900 dark:text-white">{email}</strong>. Please check your inbox and confirm your email to activate your EduMitra-AI account.
          </p>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-600 dark:text-indigo-300 font-medium">
            🔒 Protected application data remains isolated until email verification is complete.
          </div>

          <div className="pt-2">
            <Link href="/login">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5">
                Proceed to Login →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Header */}
      <div className="mb-6 text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <BrandLogo size="md" />
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            EduMitra<span className="text-indigo-600 dark:text-indigo-400">-AI</span>
          </span>
        </Link>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Create your personalized AI learning account
        </p>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0c0d19]/90 backdrop-blur-xl p-8 shadow-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Create your EduMitra account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join thousands of students mastering complex subjects with AI.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  required
                  placeholder="Alex Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 text-xs bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address *
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
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password * (Min 8 chars)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 text-xs bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 text-xs bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Password Strength Bar */}
          {password && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span>Password Strength</span>
                <span className="capitalize text-slate-600 dark:text-slate-300">{strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${(strength.score / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Optional Academic Fields */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
            <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Academic Details (Optional)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">College / Uni</label>
                <Input
                  type="text"
                  placeholder="IIT / Stanford"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-white/5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">Course / Major</label>
                <Input
                  type="text"
                  placeholder="Computer Science"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-white/5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">Year of Study</label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b0c14] px-2.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                  <option value="Postgrad">Postgrad</option>
                </select>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !fullName.trim() || !email.trim() || !password}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 border-0 gap-2 shadow-lg shadow-indigo-600/20 rounded-2xl"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
