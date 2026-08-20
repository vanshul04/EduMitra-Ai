"use client";

import React from "react";
import Link from "next/link";
import { History, BookOpen, HelpCircle, Brain, MessageSquare, Upload, Sparkles, Clock, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLearningStore } from "@/lib/store";
import { EmptyState } from "@/components/EmptyState";

export default function StudyHistoryPage() {
  const { activities, quizAttempts, flashcardSessions } = useLearningStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "chat":
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4 text-violet-500" />;
      case "flashcards":
        return <Brain className="h-4 w-4 text-emerald-500" />;
      case "upload":
        return <Upload className="h-4 w-4 text-rose-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          <History className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          Study Activity History
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          A comprehensive timeline of your document studies, quiz attempts, flashcard sessions, and chat interactions.
        </p>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
            Quiz Sessions
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {quizAttempts.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
            Flashcard Sessions
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {flashcardSessions.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
            Total Activities Logged
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {activities.length}
          </p>
        </div>
      </div>

      {/* Activity Timeline */}
      {activities.length === 0 && quizAttempts.length === 0 ? (
        <EmptyState
          icon={History}
          title="No study history recorded yet"
          description="Start interacting with documents via AI Chat, Quizzes, or Flashcards and your activity timeline will appear here."
          actionLabel="Go to Dashboard"
          onAction={() => (window.location.href = "/")}
        />
      ) : (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Chronological Timeline
          </h2>

          <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-4 pl-6 space-y-6">
            {activities.map((act) => (
              <div key={act.id} className="relative group">
                {/* Timeline Dot Icon */}
                <div className="absolute -left-[35px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
                  {getIcon(act.type)}
                </div>

                {/* Content Box */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {act.type}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(act.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {act.document_title}
                  </h3>

                  {act.details && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {act.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
