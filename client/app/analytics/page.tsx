"use client";

import React from "react";
import {
  BarChart3,
  Flame,
  Clock,
  BookOpen,
  Award,
  Brain,
  FileText,
  Mic,
  TrendingUp,
  Target,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLearningStore } from "@/lib/store";
import { calculateStudyStreak } from "@/lib/utils";

export default function AnalyticsPage() {
  const {
    documentsList,
    quizAttempts,
    flashcardSessions,
    notes,
    vivaSessions,
    activities,
  } = useLearningStore();

  const totalDocs = documentsList.length;
  const totalQuizzes = quizAttempts.length;
  const avgQuizScore =
    totalQuizzes > 0
      ? Math.round(
          quizAttempts.reduce((acc: number, q) => acc + (q.percentage || 0), 0) / totalQuizzes
        )
      : 0;

  const totalCards = flashcardSessions.reduce((acc: number, s) => acc + (s.cards_reviewed || 0), 0);
  const totalNotes = notes.length;
  const totalViva = vivaSessions.length;

  const avgVivaScore =
    totalViva > 0
      ? (vivaSessions.reduce((acc: number, v) => acc + (v.evaluation?.score || 0), 0) / totalViva).toFixed(1)
      : "N/A";

  const allTimestamps = [
    ...activities.map((a) => a.timestamp),
    ...quizAttempts.map((q) => q.completed_at),
    ...flashcardSessions.map((f) => f.completed_at),
    ...notes.map((n) => n.created_at),
    ...documentsList.map((d) => d.created_at),
  ].filter(Boolean) as (string | number | Date)[];

  const streakInfo = calculateStudyStreak(allTimestamps);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          Learning Analytics & Intelligence
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Real database analytics computed from your document study sessions, quiz attempts, and viva evaluations.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Streak</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {streakInfo.streakCount} {streakInfo.streakCount === 1 ? "Day" : "Days"}
          </p>
          <p className={`text-[11px] font-semibold ${streakInfo.streakCount > 0 ? "text-emerald-500" : "text-slate-400"}`}>
            {streakInfo.streakCount > 0 ? "🔥 Consistent learner" : "No study activity today"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Quiz Performance</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalQuizzes > 0 ? `${avgQuizScore}%` : "No attempts"}
          </p>
          <p className="text-[11px] text-slate-400">{totalQuizzes} quizzes completed</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Viva Interview Score</span>
            <Mic className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {avgVivaScore} <span className="text-xs font-normal text-slate-400">/ 10</span>
          </p>
          <p className="text-[11px] text-slate-400">{totalViva} viva sessions</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Materials</span>
            <BookOpen className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalDocs}</p>
          <p className="text-[11px] text-slate-400">{totalNotes} AI notes generated</p>
        </div>
      </div>

      {/* Quiz Attempt History Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0c16] p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="h-4 w-4 text-indigo-500" /> Quiz Attempt History ({totalQuizzes})
        </h3>

        {totalQuizzes === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No quiz attempts recorded yet. Complete a quiz to view performance metrics here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/10 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Document Title</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Percentage</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {quizAttempts.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">{q.document_title}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{q.score} / {q.total_questions}</td>
                    <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">{q.percentage}%</td>
                    <td className="py-3">
                      <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] uppercase font-semibold">
                        {q.difficulty || "medium"}
                      </Badge>
                    </td>
                    <td className="py-3 text-slate-400">{new Date(q.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0c16] p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-500" /> Recent Learning Activity Log ({activities.length})
        </h3>

        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No activities logged yet. Activities will automatically record here as you study.
          </p>
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 8).map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs">
                <div className="flex items-center gap-3">
                  <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 uppercase text-[9px] font-semibold">
                    {act.type}
                  </Badge>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{act.document_title}</p>
                    {act.details && <p className="text-[11px] text-slate-400">{act.details}</p>}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
