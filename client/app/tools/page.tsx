"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Wrench,
  FileSearch,
  BookOpen,
  Zap,
  Loader2,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLearningStore } from "@/lib/store";
import { summarizeDocumentApi, extractKeyConceptsApi, generateStudyPlanApi } from "@/lib/api";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { EmptyState } from "@/components/EmptyState";

type ActiveTool = "summarize" | "key-concepts" | "study-plan" | null;

export default function StudyToolsPage() {
  const router = useRouter();
  const { currentDocument, logActivity } = useLearningStore();

  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [loading, setLoading] = useState(false);
  const [resultContent, setResultContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const runTool = async (tool: "summarize" | "key-concepts" | "study-plan") => {
    if (!currentDocument) {
      router.push("/upload");
      return;
    }
    setActiveTool(tool);
    setLoading(true);
    setResultContent(null);

    try {
      if (tool === "summarize") {
        const res = await summarizeDocumentApi(currentDocument.id);
        setResultContent(res.summary);
        toast.success("Executive summary generated!");
      } else if (tool === "key-concepts") {
        const res = await extractKeyConceptsApi(currentDocument.id);
        setResultContent(res.key_concepts);
        toast.success("Key concepts extracted!");
      } else if (tool === "study-plan") {
        const res = await generateStudyPlanApi(currentDocument.id);
        setResultContent(res.study_plan);
        toast.success("5-Day Study Plan generated!");
      }

      logActivity({
        document_id: currentDocument.id,
        document_title: currentDocument.title,
        type: tool === "summarize" ? "summarize" : "study_plan",
        details: `Generated ${tool} for document`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tool processing failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultContent) return;
    navigator.clipboard.writeText(resultContent);
    setCopied(true);
    toast.success("Content copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <EmptyState
          icon={Wrench}
          title="No document selected for AI Tools"
          description="Upload or select a learning material to generate executive summaries, key concepts, and 5-day study plans."
          actionLabel="Upload Material"
          onAction={() => router.push("/upload")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20 text-xs">
            <Sparkles className="h-3 w-3 mr-1" /> EDU SUITE
          </Badge>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Wrench className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          AI Study Tools
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> Active Workspace: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentDocument.title}</span>
        </p>
      </div>

      {/* Tools Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tool 1: Summarize */}
        <div
          onClick={() => runTool("summarize")}
          className={`group cursor-pointer rounded-3xl border p-6 transition-all shadow-sm ${
            activeTool === "summarize"
              ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-indigo-500/10"
              : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-indigo-400/40"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
            <FileSearch className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            Executive Summarizer
          </h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Generate an executive summary, core takeaways, and essential terminology from your document.
          </p>
          <Button
            size="sm"
            disabled={loading && activeTool === "summarize"}
            className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs border-0"
          >
            {loading && activeTool === "summarize" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Zap className="h-3.5 w-3.5 mr-1.5" />
            )}
            Summarize Document
          </Button>
        </div>

        {/* Tool 2: Key Concepts */}
        <div
          onClick={() => runTool("key-concepts")}
          className={`group cursor-pointer rounded-3xl border p-6 transition-all shadow-sm ${
            activeTool === "key-concepts"
              ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-indigo-500/10"
              : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-indigo-400/40"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            Key Concepts Extractor
          </h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Extract formulas, definitions, terminology, and core principles organized with practical examples.
          </p>
          <Button
            size="sm"
            disabled={loading && activeTool === "key-concepts"}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs border-0"
          >
            {loading && activeTool === "key-concepts" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            )}
            Extract Key Concepts
          </Button>
        </div>

        {/* Tool 3: 5-Day Study Plan */}
        <div
          onClick={() => runTool("study-plan")}
          className={`group cursor-pointer rounded-3xl border p-6 transition-all shadow-sm ${
            activeTool === "study-plan"
              ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-indigo-500/10"
              : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-indigo-400/40"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            5-Day Study Roadmap
          </h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Generate a structured day-by-day learning plan with specific goals and mastery milestones.
          </p>
          <Button
            size="sm"
            disabled={loading && activeTool === "study-plan"}
            className="mt-6 w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs border-0"
          >
            {loading && activeTool === "study-plan" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Zap className="h-3.5 w-3.5 mr-1.5" />
            )}
            Create 5-Day Roadmap
          </Button>
        </div>
      </div>

      {/* Generated Result Output */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            EduMitra-AI is processing vector knowledge for your query...
          </p>
        </div>
      ) : resultContent ? (
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0c16] p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                Generated {activeTool?.replace("-", " ")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Based on document: {currentDocument.title}
              </p>
            </div>

            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="text-xs font-semibold border-slate-200 dark:border-white/10 gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Output"}
            </Button>
          </div>

          <MarkdownRenderer content={resultContent} />
        </div>
      ) : null}
    </div>
  );
}
