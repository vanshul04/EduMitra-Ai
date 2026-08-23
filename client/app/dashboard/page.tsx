"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  HelpCircle,
  FileText,
  Flame,
  ArrowRight,
  Plus,
  Sparkles,
  CheckCircle2,
  Award,
  Compass,
  Mic,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLearningStore } from "@/lib/store";
import { DocumentCard } from "@/components/DocumentCard";
import { useAuth } from "@/auth/useAuth";
import { calculateStudyStreak } from "@/lib/utils";
import { ProductSystemVisualization } from "@/components/ProductSystemVisualization";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const {
    currentDocument,
    documentsList,
    quizAttempts,
    flashcardSessions,
    notes,
    activities,
  } = useLearningStore();

  const [promptInput, setPromptInput] = useState("");

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Learner";

  const totalDocs = documentsList.length;
  const totalQuizAttempts = quizAttempts.length;
  const avgQuizScore =
    totalQuizAttempts > 0
      ? Math.round(
          quizAttempts.reduce((acc, q) => acc + (q.percentage || 0), 0) / totalQuizAttempts
        )
      : null;

  const totalCardsReviewed = flashcardSessions.reduce(
    (acc, s) => acc + (s.cards_reviewed || 0),
    0
  );

  const totalNotesCount = notes.length;

  const allTimestamps = [
    ...activities.map((a) => a.timestamp),
    ...quizAttempts.map((q) => q.completed_at),
    ...flashcardSessions.map((f) => f.completed_at),
    ...notes.map((n) => n.created_at),
    ...documentsList.map((d) => d.created_at),
  ].filter(Boolean) as (string | number | Date)[];

  const streakInfo = calculateStudyStreak(allTimestamps);

  const handleGlobalPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    if (currentDocument) {
      router.push(`/chat?q=${encodeURIComponent(promptInput.trim())}`);
    } else {
      router.push("/upload");
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
            <Sparkles className="h-3.5 w-3.5" /> EduMitra-AI SaaS Platform
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {displayName} 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Continue learning and master your uploaded knowledge materials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/upload">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 border-0 shadow-md shadow-indigo-600/20 gap-2">
              <Plus className="h-4 w-4" /> Upload Material
            </Button>
          </Link>
        </div>
      </div>

      {/* Global AI Quick Bar */}
      <form
        onSubmit={handleGlobalPromptSubmit}
        className="relative flex items-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md px-4 py-3 shadow-lg group focus-within:border-indigo-500 transition-colors"
      >
        <Sparkles className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder={
            currentDocument
              ? `Ask EduMitra-AI anything about "${currentDocument.title}"...`
              : "Upload a document or YouTube video to ask questions..."
          }
          className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="ml-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1 shadow-sm"
        >
          Ask AI <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* Active Document Hero Card */}
      {currentDocument ? (
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-black/40 backdrop-blur-md p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs font-semibold uppercase">
                  Currently Learning
                </Badge>
                <Badge variant="outline" className="text-[10px] text-slate-300 border-white/20">
                  {currentDocument.source_type.toUpperCase()}
                </Badge>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-1">
                {currentDocument.title}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed">
                Indexed in EduMitra vector knowledge base. Grounded RAG chat, quizzes, flashcards, AI notes, and viva interviews ready.
              </p>

              <div className="pt-2 flex items-center gap-3 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Ready for AI Tutoring & Practice
              </div>
            </div>

            <div className="flex flex-wrap md:flex-col gap-2.5 flex-shrink-0">
              <Link href="/chat">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 border-0 gap-2 shadow-md">
                  <BookOpen className="h-4 w-4" /> Continue Chat
                </Button>
              </Link>
              <div className="flex gap-2">
                <Link href="/notes">
                  <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 font-semibold text-xs px-3 gap-1">
                    <FileText className="h-3.5 w-3.5" /> Notes
                  </Button>
                </Link>
                <Link href="/quiz">
                  <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 font-semibold text-xs px-3 gap-1">
                    <HelpCircle className="h-3.5 w-3.5" /> Quiz
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-white/10 bg-black/30 backdrop-blur-md p-6 sm:p-8 text-center space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            No active learning workspace
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Upload a YouTube video or PDF document to start grounded AI tutoring, quizzes, flashcards, and notes.
          </p>
          <Link href="/upload" className="inline-block pt-2">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold">
              Upload Material →
            </Button>
          </Link>
        </div>
      )}

      {/* Real Analytics Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-md p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Study Streak</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {streakInfo.streakCount} {streakInfo.streakCount === 1 ? "Day" : "Days"}
          </p>
          <p className={`text-[11px] font-semibold ${streakInfo.streakCount > 0 ? "text-emerald-500" : "text-slate-400"}`}>
            {streakInfo.streakCount > 0 ? "🔥 Active streak" : "Start studying to build your streak 🔥"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-md p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Library Material</span>
            <BookOpen className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalDocs}</p>
          <p className="text-[11px] text-slate-400">
            {totalDocs > 0 ? `${totalDocs} indexed material${totalDocs === 1 ? "" : "s"}` : "Upload your first material"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-md p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Quiz Accuracy</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {avgQuizScore !== null ? `${avgQuizScore}%` : "—"}
          </p>
          <p className="text-[11px] text-slate-400">
            {totalQuizAttempts > 0 ? `${totalQuizAttempts} attempt${totalQuizAttempts === 1 ? "" : "s"} taken` : "No quizzes completed"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-md p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Cards & Notes</span>
            <Brain className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalCardsReviewed + totalNotesCount}</p>
          <p className="text-[11px] text-slate-400">
            {totalCardsReviewed + totalNotesCount > 0 ? "Cards reviewed & AI notes" : "No cards or notes yet"}
          </p>
        </div>
      </div>

      {/* SaaS Feature Quick Access Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          EduMitra AI Learning Suite
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/chat">
            <div className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-md p-5 hover:border-indigo-500/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                Grounded AI Chat
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Conversational RAG tutor with source citations and code syntax highlighting.
              </p>
            </div>
          </Link>

          <Link href="/notes">
            <div className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-md p-5 hover:border-indigo-500/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                AI Notes Studio
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Generate Exam Notes, Cheat Sheets, and Markdown summaries with PDF exports.
              </p>
            </div>
          </Link>

          <Link href="/learning-paths">
            <div className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-md p-5 hover:border-indigo-500/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
                <Compass className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                Learning Paths
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Sequenced curriculum roadmaps with prerequisite tracking and topic checklists.
              </p>
            </div>
          </Link>

          <Link href="/viva">
            <div className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-md p-5 hover:border-indigo-500/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
                <Mic className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                AI Viva / Interview
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Technical interview evaluation with scoring out of 10 and detailed feedback.
              </p>
            </div>
          </Link>

          <Link href="/flashcards">
            <div className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-md p-5 hover:border-emerald-500/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                <Brain className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Spaced Repetition Decks
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Interactive 3D flashcards with Leitner spaced repetition review intervals.
              </p>
            </div>
          </Link>

          <Link href="/quiz">
            <div className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-md p-5 hover:border-violet-500/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 mb-3 group-hover:scale-105 transition-transform">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400">
                Adaptive MCQ Quizzes
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Custom difficulty quizzes with detailed explanations and score tracking.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Trust & Value Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-black/30 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="h-4 w-4" /> Security & Platform Value
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Why Students & Educators Trust EduMitra-AI
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Enterprise-grade data isolation, grounded RAG precision, and real-time study analytics built for academic success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 p-4 space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              100% Multi-User Data Isolation
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Enforced by Supabase Row Level Security (RLS). Your documents, notes, streak, and quiz scores are accessible only to your authenticated user account.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 p-4 space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Grounded Vector RAG Accuracy
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              768-dimensional embeddings match your exact document chunks to deliver grounded answers, citations, and quizzes without hallucination.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/30 p-4 space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <Award className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Real Activity & Streak Metrics
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Zero fake statistics. Streaks, quiz accuracy, and viva scores are computed dynamically from your actual study timeline and quiz attempts.
            </p>
          </div>
        </div>
      </div>

      {/* Product Visualization, Differentiation & Final CTA */}
      <ProductSystemVisualization />

      {/* Recent Documents Grid */}
      {documentsList.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Materials ({documentsList.length})
            </h3>
            <Link href="/my-learning" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentsList.slice(0, 3).map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
