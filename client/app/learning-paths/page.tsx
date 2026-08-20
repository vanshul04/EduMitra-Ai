"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Compass,
  CheckCircle2,
  Circle,
  Loader2,
  RefreshCw,
  BookOpen,
  Sparkles,
  Clock,
  Award,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLearningStore } from "@/lib/store";
import { generateLearningPathApi } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { LearningPath } from "@/lib/types";

export default function LearningPathsPage() {
  const router = useRouter();
  const { currentDocument, learningPaths, setLearningPathForDoc, toggleTopicCompletion, logActivity } = useLearningStore();

  const [loading, setLoading] = useState(false);

  const currentPath: LearningPath | undefined = currentDocument
    ? learningPaths[currentDocument.id]
    : undefined;

  const handleGeneratePath = async () => {
    if (!currentDocument) {
      router.push("/upload");
      return;
    }
    setLoading(true);

    try {
      const result = await generateLearningPathApi(currentDocument.id);
      setLearningPathForDoc(currentDocument.id, result.path);
      toast.success("AI Learning Path generated successfully!");

      logActivity({
        document_id: currentDocument.id,
        document_title: currentDocument.title,
        type: "learning_path",
        details: "Generated structured AI Learning Path",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate learning path";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total topic completion
  let totalTopicsCount = 0;
  let completedTopicsCount = 0;

  if (currentPath?.modules) {
    currentPath.modules.forEach((mod) => {
      totalTopicsCount += mod.topics.length;
      completedTopicsCount += mod.completed_topics?.length || 0;
    });
  }

  const completionPct = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  if (!currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <EmptyState
          icon={Compass}
          title="No document selected for Learning Path"
          description="Upload or select a document to generate a structured step-by-step curriculum with prerequisites and milestone tracking."
          actionLabel="Upload Material"
          onAction={() => router.push("/upload")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <Compass className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            AI Learning Path Architect
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> Active Workspace: {currentDocument.title}
          </p>
        </div>

        <Button
          onClick={handleGeneratePath}
          disabled={loading}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 border-0 gap-1.5 shadow-md shadow-indigo-600/20"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {currentPath ? "Regenerate Path" : "Generate Learning Path"}
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            EduMitra-AI is structuring your learning path curriculum...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!currentPath && !loading && (
        <EmptyState
          icon={Compass}
          title="No Learning Path generated yet"
          description="Click 'Generate Learning Path' to extract prerequisites, module sequences, and interactive topic checklists."
          actionLabel="Generate Curriculum"
          onAction={handleGeneratePath}
        />
      )}

      {/* LEARNING PATH DASHBOARD */}
      {currentPath && !loading && (
        <div className="space-y-6">
          {/* Path Header Hero */}
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-900/40 via-violet-900/30 to-slate-900/50 p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs font-semibold uppercase tracking-wider mb-2">
                  Curriculum Roadmap
                </Badge>
                <h2 className="text-2xl font-bold text-white">
                  {currentPath.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-white/10 text-white border-white/20 text-xs px-3 py-1 font-semibold">
                  <Award className="h-3.5 w-3.5 mr-1 text-amber-400" /> {currentPath.difficulty}
                </Badge>

                <Badge className="bg-white/10 text-white border-white/20 text-xs px-3 py-1 font-semibold">
                  <Clock className="h-3.5 w-3.5 mr-1 text-indigo-300" /> ~{currentPath.estimated_hours} Hours
                </Badge>
              </div>
            </div>

            {/* Prerequisites */}
            {currentPath.prerequisites && currentPath.prerequisites.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
                  Recommended Prerequisites:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentPath.prerequisites.map((p, idx) => (
                    <span key={idx} className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-slate-200 border border-white/10">
                      • {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Completion Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Curriculum Mastery Progress</span>
                <span className="text-emerald-400">{completionPct}% ({completedTopicsCount}/{totalTopicsCount} topics)</span>
              </div>
              <Progress value={completionPct} className="h-2.5 bg-white/10 [&>div]:bg-emerald-500" />
            </div>
          </div>

          {/* Module Sequence Flow */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-500" /> Sequenced Learning Modules ({currentPath.modules.length})
            </h3>

            <div className="space-y-4">
              {currentPath.modules.map((mod, modIdx) => {
                const completedSet = new Set(mod.completed_topics || []);
                const isModuleDone = mod.topics.length > 0 && completedSet.size === mod.topics.length;

                return (
                  <div
                    key={modIdx}
                    className={`rounded-3xl border p-6 transition-all shadow-sm ${
                      isModuleDone
                        ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10"
                        : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white ${
                          isModuleDone ? "bg-emerald-600" : "bg-indigo-600"
                        }`}>
                          {mod.module_number || modIdx + 1}
                        </span>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {mod.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {mod.description}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/5">
                        ~{mod.estimated_minutes} mins
                      </span>
                    </div>

                    {/* Interactive Topics Checklist */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Topics to Master:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mod.topics.map((topic, topicIdx) => {
                          const isDone = completedSet.has(topic);
                          return (
                            <button
                              key={topicIdx}
                              onClick={() => toggleTopicCompletion(currentDocument.id, modIdx, topic)}
                              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs text-left font-medium transition-all border ${
                                isDone
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold"
                                  : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                              )}
                              <span className={isDone ? "line-through" : ""}>{topic}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
