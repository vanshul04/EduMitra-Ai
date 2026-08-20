"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Trophy,
  ChevronDown,
  Download,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  X,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { generateQuiz } from "@/lib/api";
import { useLearningStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { QuizQuestion } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { downloadQuizPDF } from "@/lib/pdfExport";

type UserAnswers = Record<number, string>;
type QuizState = "idle" | "taking" | "submitted";

export default function QuizPage() {
  const router = useRouter();
  const { currentDocument, quizQuestions, setQuizQuestions, recordQuizAttempt, logActivity } = useLearningStore();

  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "adaptive">("medium");
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>(
    quizQuestions.length > 0 ? "taking" : "idle"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

  const handleGenerate = async () => {
    if (!currentDocument) {
      router.push("/upload");
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateQuiz(currentDocument.id);
      setQuizQuestions(result.questions);
      setUserAnswers({});
      setCurrentQIndex(0);
      setQuizState("taking");
      setShowExplanations({});
      toast.success(`Generated ${result.count} ${difficulty.toUpperCase()} MCQ quiz questions!`);

      logActivity({
        document_id: currentDocument.id,
        document_title: currentDocument.title,
        type: "quiz",
        details: `Generated ${result.count} ${difficulty} questions`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate quiz";
      toast.error(msg);
    } fontFinally: {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < quizQuestions.length) {
      toast.warning("Please answer all questions before submitting.");
      return;
    }

    const score = quizQuestions.filter((q, i) => userAnswers[i] === q.correct_answer).length;
    const percentage = Math.round((score / quizQuestions.length) * 100);

    setQuizState("submitted");
    recordQuizAttempt({
      document_id: currentDocument!.id,
      document_title: currentDocument!.title,
      score,
      total_questions: quizQuestions.length,
      percentage,
      difficulty,
    });

    toast.success(`Quiz completed! Score: ${score}/${quizQuestions.length} (${percentage}%)`);
  };

  const handleDownloadPDF = () => {
    if (!currentDocument || quizQuestions.length === 0) return;
    const score = quizQuestions.filter((q, i) => userAnswers[i] === q.correct_answer).length;
    downloadQuizPDF(currentDocument.title, quizQuestions, quizState === "submitted" ? score : undefined);
    toast.success("Quiz PDF downloaded successfully!");
  };

  const score = quizQuestions.filter((q, i) => userAnswers[i] === q.correct_answer).length;
  const scorePercent = quizQuestions.length > 0 ? Math.round((score / quizQuestions.length) * 100) : 0;
  const optionKeys: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];

  if (!currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <EmptyState
          icon={HelpCircle}
          title="No document selected for Quiz"
          description="Upload or select a document to generate adaptive MCQ quizzes with detailed explanations."
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
            <HelpCircle className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            EduMitra Adaptive Quizzes
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> Active Workspace: {currentDocument.title}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {quizState === "idle" && (
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b0c14] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="adaptive">Adaptive AI</option>
            </select>
          )}

          {quizQuestions.length > 0 && (
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              size="sm"
              className="text-xs font-semibold border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Download Quiz PDF
            </Button>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 border-0 gap-1.5 shadow-md shadow-indigo-600/20"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {quizQuestions.length > 0 ? "Regenerate" : "Generate Quiz"}
          </Button>
        </div>
      </div>

      {/* Idle State */}
      {quizState === "idle" && !isLoading && (
        <EmptyState
          icon={HelpCircle}
          title="No quiz generated yet"
          description="Click 'Generate Quiz' to extract key concepts and test your understanding with MCQ questions."
          actionLabel="Generate Quiz Now"
          onAction={handleGenerate}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            EduMitra-AI is generating {difficulty.toUpperCase()} MCQ questions...
          </p>
        </div>
      )}

      {/* RESULTS DASHBOARD (Submitted State) */}
      {quizState === "submitted" && (
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-900/40 via-violet-900/30 to-slate-900/50 p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={cn(
                "flex h-16 w-16 items-center justify-center rounded-2xl text-white font-bold shadow-lg",
                scorePercent >= 80 ? "bg-amber-500" : scorePercent >= 50 ? "bg-indigo-500" : "bg-rose-500"
              )}>
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {scorePercent >= 80 ? "Outstanding Mastery!" : scorePercent >= 50 ? "Good Attempt!" : "Needs Revision"}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  You scored <span className="font-bold text-white">{score}</span> out of <span className="font-bold text-white">{quizQuestions.length}</span> ({scorePercent}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setUserAnswers({});
                  setQuizState("taking");
                  setCurrentQIndex(0);
                }}
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 font-semibold text-xs gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Retake Quiz
              </Button>

              <Button
                onClick={handleDownloadPDF}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs border-0 gap-1.5 shadow-lg shadow-indigo-600/30"
              >
                <Download className="h-3.5 w-3.5" /> Download PDF
              </Button>
            </div>
          </div>

          <Progress value={scorePercent} className="h-2.5 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-emerald-400" />

          {/* Adaptive Topic Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                <Check className="h-4 w-4" /> Core Concepts Understood ({score})
              </h4>
              <p className="text-xs text-emerald-200 leading-relaxed">
                Great job! You demonstrated strong comprehension of the core principles tested in these questions.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                <Target className="h-4 w-4" /> Recommended Revisions ({quizQuestions.length - score})
              </h4>
              <p className="text-xs text-amber-200 leading-relaxed">
                Review the detailed explanations below to reinforce your knowledge before moving forward.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ QUESTION CARDS (Taking or Submitted) */}
      {(quizState === "taking" || quizState === "submitted") && !isLoading && (
        <div className="space-y-6">
          {/* Question Index Progress Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2">
            <span className="font-semibold">
              Question {currentQIndex + 1} of {quizQuestions.length}
            </span>
            <span>
              {Object.keys(userAnswers).length} / {quizQuestions.length} answered
            </span>
          </div>

          {/* Active Question Box */}
          {(() => {
            const q = quizQuestions[currentQIndex];
            if (!q) return null;

            const userAnswer = userAnswers[currentQIndex];
            const showResult = quizState === "submitted";
            const isCorrect = userAnswer === q.correct_answer;

            return (
              <div
                className={cn(
                  "rounded-3xl border p-6 md:p-8 transition-all shadow-md",
                  showResult
                    ? isCorrect
                      ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10"
                      : "border-rose-500/40 bg-rose-500/5 dark:bg-rose-500/10"
                    : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5"
                )}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md">
                      {currentQIndex + 1}
                    </span>
                    <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                      {q.question}
                    </h3>
                  </div>

                  {showResult && (
                    <Badge className={isCorrect ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : "bg-rose-500/20 text-rose-500 border-rose-500/30"}>
                      {isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-3 pl-2">
                  {optionKeys.map((key) => {
                    const isSelected = userAnswer === key;
                    const isCorrectOption = q.correct_answer === key;
                    const optionText = q.options[key];

                    return (
                      <button
                        key={key}
                        onClick={() => {
                          if (quizState === "taking") {
                            setUserAnswers((prev) => ({ ...prev, [currentQIndex]: key }));
                          }
                        }}
                        disabled={quizState === "submitted"}
                        className={cn(
                          "flex w-full items-center gap-3.5 rounded-2xl px-5 py-4 text-left text-xs font-medium transition-all border",
                          showResult
                            ? isCorrectOption
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-800 dark:text-emerald-200 font-bold"
                              : isSelected && !isCorrectOption
                              ? "bg-rose-500/20 border-rose-500/50 text-rose-800 dark:text-rose-200 font-bold"
                              : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400"
                            : isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-bold"
                            : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                            isSelected && quizState === "taking"
                              ? "bg-white/20 text-white"
                              : showResult && isCorrectOption
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                          )}
                        >
                          {key}
                        </span>
                        <span className="flex-1">{optionText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Detailed Explanation */}
                {showResult && (
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                    <button
                      onClick={() =>
                        setShowExplanations((prev) => ({
                          ...prev,
                          [currentQIndex]: !prev[currentQIndex],
                        }))
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showExplanations[currentQIndex] && "rotate-180")} />
                      {showExplanations[currentQIndex] ? "Hide Explanation" : "Show Detailed Explanation"}
                    </button>

                    {showExplanations[currentQIndex] && (
                      <div className="mt-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                          Pedagogical Explanation:
                        </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
            <Button
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 border-slate-200 dark:border-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Previous
            </Button>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Question {currentQIndex + 1} of {quizQuestions.length}
            </span>

            {currentQIndex < quizQuestions.length - 1 ? (
              <Button
                onClick={() => setCurrentQIndex((prev) => Math.min(quizQuestions.length - 1, prev + 1))}
                variant="outline"
                size="sm"
                className="text-xs font-semibold gap-1.5 border-slate-200 dark:border-white/10"
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : quizState === "taking" ? (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(userAnswers).length < quizQuestions.length}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs border-0 px-5"
              >
                Submit Quiz
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
