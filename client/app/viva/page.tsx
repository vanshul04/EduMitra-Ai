"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Mic,
  Loader2,
  Sparkles,
  BookOpen,
  Award,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLearningStore } from "@/lib/store";
import { startVivaApi, evaluateVivaApi } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { VivaEvaluation } from "@/lib/types";

export default function VivaPage() {
  const router = useRouter();
  const { currentDocument, recordVivaSession, logActivity } = useLearningStore();

  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [sessionState, setSessionState] = useState<"idle" | "asking" | "evaluating" | "results">("idle");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [currentEvaluation, setCurrentEvaluation] = useState<VivaEvaluation | null>(null);

  const handleStartViva = async () => {
    if (!currentDocument) {
      router.push("/upload");
      return;
    }
    setLoading(true);
    try {
      const res = await startVivaApi(currentDocument.id, difficulty, 3);
      setQuestions(res.questions);
      setCurrentQIndex(0);
      setUserAnswer("");
      setCurrentEvaluation(null);
      setSessionState("asking");
      toast.success("Viva/Interview session started!");

      logActivity({
        document_id: currentDocument.id,
        document_title: currentDocument.title,
        type: "viva",
        details: `Started ${difficulty} viva session`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start viva session";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !currentDocument) return;
    const currentQ = questions[currentQIndex];

    setSessionState("evaluating");
    setLoading(true);

    try {
      const res = await evaluateVivaApi(currentDocument.id, currentQ, userAnswer.trim());
      setCurrentEvaluation(res.evaluation);
      setSessionState("results");

      recordVivaSession({
        id: `viva-${Date.now()}`,
        document_id: currentDocument.id,
        question: currentQ,
        user_answer: userAnswer.trim(),
        evaluation: res.evaluation,
        created_at: new Date().toISOString(),
      });

      toast.success(`Evaluation complete! Score: ${res.evaluation.score}/10`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to evaluate answer";
      toast.error(msg);
      setSessionState("asking");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setUserAnswer("");
      setCurrentEvaluation(null);
      setSessionState("asking");
    } else {
      toast.success("Viva interview completed!");
      setSessionState("idle");
    }
  };

  if (!currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <EmptyState
          icon={Mic}
          title="No document selected for Viva Mode"
          description="Upload or select a document to test your technical interview readiness with AI evaluation and scoring out of 10."
          actionLabel="Upload Material"
          onAction={() => router.push("/upload")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <Mic className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            AI Viva & Interview Examiner
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> Active Workspace: {currentDocument.title}
          </p>
        </div>

        {sessionState === "idle" && (
          <div className="flex items-center gap-2">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b0c14] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="easy">Easy Level</option>
              <option value="medium">Medium Level</option>
              <option value="hard">Hard / Technical Depth</option>
            </select>

            <Button
              onClick={handleStartViva}
              disabled={loading}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 border-0 gap-1.5 shadow-md shadow-indigo-600/20"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
              Start Viva Session
            </Button>
          </div>
        )}
      </div>

      {/* IDLE STATE */}
      {sessionState === "idle" && !loading && (
        <EmptyState
          icon={Mic}
          title="Ready to test your knowledge?"
          description="EduMitra-AI will act as a technical examiner, ask targeted questions based on your document, and evaluate your responses with detailed scoring out of 10."
          actionLabel="Start Viva Session"
          onAction={handleStartViva}
        />
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {sessionState === "evaluating"
              ? "EduMitra Examiner is evaluating technical accuracy & clarity..."
              : "EduMitra Examiner is preparing viva questions..."}
          </p>
        </div>
      )}

      {/* ASKING QUESTION STATE */}
      {sessionState === "asking" && !loading && (
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0c16] p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20 text-xs font-semibold">
              Question {currentQIndex + 1} of {questions.length} · {difficulty.toUpperCase()}
            </Badge>

            <span className="text-xs text-slate-400 font-semibold">
              EduMitra AI Examiner
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              &quot;{questions[currentQIndex]}&quot;
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Type your technical answer:
            </label>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Explain technical details, core principles, and examples clearly..."
              rows={6}
              className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:border-indigo-500 rounded-2xl"
            />
          </div>

          <Button
            onClick={handleSubmitAnswer}
            disabled={!userAnswer.trim() || loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 border-0 gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Send className="h-4 w-4" /> Submit Answer for Examiner Evaluation
          </Button>
        </div>
      )}

      {/* EVALUATION RESULTS STATE */}
      {sessionState === "results" && currentEvaluation && !loading && (
        <div className="rounded-3xl border border-indigo-500/30 bg-white dark:bg-[#0b0c16] p-8 shadow-xl space-y-6">
          {/* Header Score Banner */}
          <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-violet-900/30 to-slate-900/50 border border-indigo-500/30">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white font-bold text-xl shadow-lg">
                <Star className="h-7 w-7 fill-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Score: {currentEvaluation.score} / 10
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {currentEvaluation.correctness}
                </p>
              </div>
            </div>

            <Button
              onClick={handleNextQuestion}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 border-0 gap-1.5"
            >
              {currentQIndex < questions.length - 1 ? "Next Question" : "Complete Viva"} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Strengths Identified
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                {currentEvaluation.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Areas for Improvement
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                {currentEvaluation.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ideal Examiner Answer */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5 space-y-2">
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Ideal Examiner Answer:
            </h4>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {currentEvaluation.ideal_answer}
            </p>
          </div>

          {/* Examiner Tips */}
          {currentEvaluation.tips && (
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1.5">
                Actionable Tips to Improve:
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {currentEvaluation.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
