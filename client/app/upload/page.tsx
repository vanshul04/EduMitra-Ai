"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Upload,
  Link as LinkIcon,
  FileText,
  Loader2,
  CheckCircle2,
  Youtube,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Brain,
  AlertTriangle,
  RotateCcw,
  Layers,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { processVideo, processPdf } from "@/lib/api";
import { useLearningStore } from "@/lib/store";

type ProcessingState = "idle" | "processing" | "success" | "error";

interface ProcessedDocDetails {
  id: string;
  title: string;
  source_type: "pdf" | "youtube";
  chunk_count: number;
}

export default function UploadPage() {
  const router = useRouter();
  const { setCurrentDocument, addDocumentToList, resetAll, logActivity } = useLearningStore();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [status, setStatus] = useState<ProcessingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processedDoc, setProcessedDoc] = useState<ProcessedDocDetails | null>(null);

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim() || status === "processing") return;

    setStatus("processing");
    setErrorMessage(null);

    try {
      const result = await processVideo(youtubeUrl.trim());

      const docInfo = {
        id: result.document_id,
        title: result.title,
        source_type: "youtube" as const,
        chunk_count: result.chunk_count,
      };

      resetAll();
      setCurrentDocument(docInfo);
      addDocumentToList(docInfo);
      setProcessedDoc(docInfo);
      setStatus("success");
      toast.success("YouTube video processed successfully!", { description: result.title });

      logActivity({
        document_id: result.document_id,
        document_title: result.title,
        type: "upload",
        details: "Processed YouTube video transcript",
      });
    } catch (err: unknown) {
      console.error("YouTube upload processing failed:", err);
      setStatus("error");
      const msg = err instanceof Error ? err.message : "Unable to process this YouTube video. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Please upload a valid PDF file.");
        return;
      }

      setStatus("processing");
      setErrorMessage(null);

      try {
        const result = await processPdf(file);

        const docInfo = {
          id: result.document_id,
          title: result.title,
          source_type: "pdf" as const,
          chunk_count: result.chunk_count,
        };

        resetAll();
        setCurrentDocument(docInfo);
        addDocumentToList(docInfo);
        setProcessedDoc(docInfo);
        setStatus("success");
        toast.success("PDF processed successfully!", {
          description: `${result.page_count} pages · ${result.chunk_count} chunks`,
        });

        logActivity({
          document_id: result.document_id,
          document_title: result.title,
          type: "upload",
          details: `Processed PDF (${result.page_count} pages)`,
        });
      } catch (err: unknown) {
        console.error("PDF upload processing failed:", err);
        setStatus("error");
        const msg = err instanceof Error ? err.message : "Unable to process this PDF file. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    },
    [setCurrentDocument, addDocumentToList, resetAll, logActivity]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const isProcessing = status === "processing";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="mb-8 text-center max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 mb-3">
          <Sparkles className="h-3.5 w-3.5" /> EduMitra-AI Knowledge Ingestion
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Upload Learning Material
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Paste a YouTube URL or upload a PDF document. EduMitra-AI will extract, chunk, embed, and prepare your AI study companion.
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0e19] p-8 shadow-xl space-y-6">
        {status !== "success" ? (
          <>
            <Tabs defaultValue="youtube">
              <TabsList className="mb-6 grid w-full grid-cols-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                <TabsTrigger value="youtube" className="gap-2 font-semibold text-xs py-2.5" disabled={isProcessing}>
                  <Youtube className="h-4 w-4 text-red-500" />
                  YouTube Video
                </TabsTrigger>
                <TabsTrigger value="pdf" className="gap-2 font-semibold text-xs py-2.5" disabled={isProcessing}>
                  <FileText className="h-4 w-4 text-rose-500" />
                  Upload PDF
                </TabsTrigger>
              </TabsList>

              {/* YouTube Tab */}
              <TabsContent value="youtube">
                <form onSubmit={handleVideoSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Paste YouTube URL
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="pl-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                        disabled={isProcessing}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Supported: Public YouTube videos with captions/subtitles enabled.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing || !youtubeUrl.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold border-0 py-2.5 disabled:opacity-40"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Video...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Process Video
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* PDF Tab */}
              <TabsContent value="pdf">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isProcessing) setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-12 transition-all cursor-pointer ${
                    dragOver
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-slate-300 dark:border-white/10 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <FileText className="h-7 w-7" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Drop your PDF here or browse files
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Maximum allowed PDF size: 20MB</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    disabled={isProcessing}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* REAL-TIME PROCESSING INDICATOR (Controlled by actual API response) */}
            {isProcessing && (
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Processing your learning material...
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Extracting content, generating RAG embeddings, and storing in Supabase vector database.
                  </p>
                </div>
              </div>
            )}

            {/* ERROR STATE */}
            {status === "error" && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      Processing Failed
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                      {errorMessage || "An unexpected error occurred while processing your material."}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setStatus("idle");
                    setErrorMessage(null);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold gap-1.5 flex-shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Try Again
                </Button>
              </div>
            )}
          </>
        ) : (
          /* SUCCESS STATE */
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Your learning material is ready!
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                &quot;{processedDoc?.title}&quot; has been processed and indexed into EduMitra-AI vector knowledge base.
              </p>
            </div>

            {/* Document Details Metadata */}
            {processedDoc && (
              <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5">
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-indigo-500" />
                  Type: {processedDoc.source_type.toUpperCase()}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-indigo-500" />
                  {processedDoc.chunk_count} Chunks Indexed
                </span>
              </div>
            )}

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link href="/chat">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 border-0 gap-2 shadow-md shadow-indigo-600/20">
                  <MessageSquare className="h-4 w-4" /> Start AI Chat
                </Button>
              </Link>

              <Link href="/quiz">
                <Button variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 font-semibold text-xs px-4 py-2 gap-2">
                  <HelpCircle className="h-4 w-4" /> Generate Quiz
                </Button>
              </Link>

              <Link href="/flashcards">
                <Button variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20 font-semibold text-xs px-4 py-2 gap-2">
                  <Brain className="h-4 w-4" /> Create Flashcards
                </Button>
              </Link>
            </div>

            <button
              onClick={() => {
                setStatus("idle");
                setProcessedDoc(null);
                setYoutubeUrl("");
              }}
              className="mt-4 text-xs text-slate-400 hover:underline"
            >
              + Upload another document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
