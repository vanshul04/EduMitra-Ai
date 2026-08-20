"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Download,
  Shuffle,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Eye,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { generateFlashcards } from "@/lib/api";
import { useLearningStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { downloadFlashcardsPDF } from "@/lib/pdfExport";
import { Flashcard } from "@/lib/types";

export default function FlashcardsPage() {
  const router = useRouter();
  const {
    currentDocument,
    flashcards,
    setFlashcards,
    recordFlashcardSession,
    logActivity,
  } = useLearningStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewed, setViewed] = useState<Set<number>>(new Set([0]));
  const [ratings, setRatings] = useState<Record<number, "again" | "hard" | "good" | "easy">>({});

  const handleGenerate = async () => {
    if (!currentDocument) {
      router.push("/upload");
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateFlashcards(currentDocument.id);
      setFlashcards(result.flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setViewed(new Set([0]));
      setRatings({});
      toast.success(`Generated ${result.count} flashcards!`);

      logActivity({
        document_id: currentDocument.id,
        document_title: currentDocument.title,
        type: "flashcards",
        details: `Generated ${result.count} flashcards`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate flashcards";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const goTo = useCallback(
    (idx: number) => {
      const safe = Math.max(0, Math.min(idx, flashcards.length - 1));
      setCurrentIndex(safe);
      setIsFlipped(false);
      setViewed((prev) => new Set(prev).add(safe));
    },
    [flashcards.length]
  );

  const prev = useCallback(() => goTo(Math.max(0, currentIndex - 1)), [goTo, currentIndex]);
  const next = useCallback(() => goTo(Math.min(flashcards.length - 1, currentIndex + 1)), [goTo, currentIndex, flashcards.length]);
  const flip = useCallback(() => setIsFlipped((prev) => !prev), []);

  const rateCard = (rating: "again" | "hard" | "good" | "easy") => {
    setRatings((prev) => ({ ...prev, [currentIndex]: rating }));
    const labels = {
      again: "Review tomorrow",
      hard: "Review in 3 days",
      good: "Review in 5 days",
      easy: "Mastered! Review in 7 days",
    };
    toast.success(`Rated as ${rating.toUpperCase()} (${labels[rating]})`);
    if (currentIndex < flashcards.length - 1) next();
  };

  const shuffleCards = () => {
    if (flashcards.length < 2) return;
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.success("Flashcards shuffled");
  };

  const handleDownloadPDF = () => {
    if (!currentDocument || flashcards.length === 0) return;
    downloadFlashcardsPDF(currentDocument.title, flashcards);
    toast.success("Flashcards PDF downloaded successfully!");
  };

  // Keyboard Shortcuts (Space = Flip, Left = Prev, Right = Next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        flip();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flip, prev, next]);

  // Record session on completion
  useEffect(() => {
    if (flashcards.length > 0 && viewed.size === flashcards.length && currentDocument) {
      recordFlashcardSession({
        document_id: currentDocument.id,
        document_title: currentDocument.title,
        cards_reviewed: viewed.size,
        total_cards: flashcards.length,
      });
    }
  }, [viewed.size, flashcards.length, currentDocument]);

  const easyCount = Object.values(ratings).filter((r) => r === "easy" || r === "good").length;
  const reviewCount = Object.values(ratings).filter((r) => r === "again" || r === "hard").length;

  if (!currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <EmptyState
          icon={Brain}
          title="No document selected for Flashcards"
          description="Upload or select a document to generate AI flashcard study decks."
          actionLabel="Upload Material"
          onAction={() => router.push("/upload")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto space-y-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              <Brain className="h-6 w-6 text-emerald-500" />
              Spaced Repetition Flashcards
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> {currentDocument.title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {flashcards.length > 0 && (
              <>
                <Button
                  onClick={shuffleCards}
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold border-slate-200 dark:border-white/10 gap-1.5"
                  title="Shuffle cards"
                >
                  <Shuffle className="h-3.5 w-3.5" /> Shuffle
                </Button>

                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20 gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </Button>
              </>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 border-0 gap-1.5 shadow-md shadow-indigo-600/20"
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {flashcards.length > 0 ? "Regenerate" : "Generate Cards"}
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {flashcards.length === 0 && !isLoading && (
          <EmptyState
            icon={Brain}
            title="No flashcard deck created yet"
            description="Click 'Generate Cards' to create an interactive 3D study deck based on your document."
            actionLabel="Generate Flashcards"
            onAction={handleGenerate}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              EduMitra-AI is synthesizing key concepts into flashcards...
            </p>
          </div>
        )}

        {/* FLASHCARD DISPLAY */}
        {flashcards.length > 0 && !isLoading && (
          <div className="mt-8 flex flex-col items-center space-y-6">
            {/* Top Deck Stats Bar */}
            <div className="w-full max-w-2xl flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                <Eye className="h-3.5 w-3.5" /> {viewed.size} of {flashcards.length} Reviewed
              </span>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {easyCount} Mastered
                </span>
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" /> {reviewCount} Due Soon
                </span>
              </div>
            </div>

            <Progress
              value={Math.round((viewed.size / flashcards.length) * 100)}
              className="w-full max-w-2xl h-1.5 bg-slate-200 dark:bg-white/10 [&>div]:bg-indigo-600"
            />

            {/* 3D Flip Card */}
            <div
              onClick={flip}
              className="w-full max-w-2xl cursor-pointer"
              style={{ perspective: "1000px" }}
            >
              <div
                className="relative h-80 w-full transition-transform duration-500 shadow-2xl rounded-3xl"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* FRONT (QUESTION) */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-between rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-indigo-950/60 dark:to-slate-900 p-8 text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="flex items-center justify-between w-full">
                    <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30 text-xs">
                      Question / Concept
                    </Badge>
                    <span className="text-xs font-bold text-slate-400">
                      #{currentIndex + 1} / {flashcards.length}
                    </span>
                  </div>

                  <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-relaxed max-w-lg">
                    {flashcards[currentIndex]?.question}
                  </p>

                  <p className="text-xs text-slate-400 font-medium">
                    Click or press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded border text-[10px]">Space</kbd> to flip card 🔄
                  </p>
                </div>

                {/* BACK (ANSWER) */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-between rounded-3xl border border-emerald-500/40 bg-slate-50 dark:bg-gradient-to-br dark:from-emerald-950/60 dark:to-slate-900 p-8 text-center"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 text-xs">
                      Answer / Explanation
                    </Badge>
                    <span className="text-xs font-bold text-slate-400">
                      #{currentIndex + 1} / {flashcards.length}
                    </span>
                  </div>

                  <p className="text-base md:text-lg font-semibold text-slate-900 dark:text-emerald-100 leading-relaxed max-w-lg">
                    {flashcards[currentIndex]?.answer}
                  </p>

                  <p className="text-xs text-slate-400 font-medium">
                    Click or press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded border text-[10px]">Space</kbd> to flip back 🔄
                  </p>
                </div>
              </div>
            </div>

            {/* Spaced Repetition Ratings Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                onClick={() => rateCard("again")}
                size="sm"
                variant="outline"
                className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold px-3 gap-1"
              >
                Again <span className="text-[10px] text-slate-400">(1d)</span>
              </Button>

              <Button
                onClick={() => rateCard("hard")}
                size="sm"
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 text-xs font-semibold px-3 gap-1"
              >
                Hard <span className="text-[10px] text-slate-400">(3d)</span>
              </Button>

              <Button
                onClick={() => rateCard("good")}
                size="sm"
                variant="outline"
                className="border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 text-xs font-semibold px-3 gap-1"
              >
                Good <span className="text-[10px] text-slate-400">(5d)</span>
              </Button>

              <Button
                onClick={() => rateCard("easy")}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 border-0 gap-1"
              >
                Easy <span className="text-[10px] text-emerald-200">(7d)</span>
              </Button>
            </div>

            {/* Navigation & Shortcuts Bar */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <Button
                onClick={prev}
                disabled={currentIndex === 0}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-slate-200 dark:border-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[80px] text-center">
                {currentIndex + 1} of {flashcards.length}
              </span>

              <Button
                onClick={next}
                disabled={currentIndex === flashcards.length - 1}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-slate-200 dark:border-white/10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
