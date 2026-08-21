"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Brain,
  HelpCircle,
  Mic,
  Compass,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Zap,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SYSTEM_NODES = [
  {
    id: "chat",
    title: "Grounded AI Chat",
    icon: MessageSquare,
    tag: "RAG Tutor",
    color: "indigo",
    desc: "Conversational RAG assistant with strict page & video timestamp citations.",
    detail: "Never guesses or hallucinates. Answers cite exact source lines.",
  },
  {
    id: "notes",
    title: "AI Notes Studio",
    icon: FileText,
    tag: "Exam Prep",
    color: "violet",
    desc: "Generates Exam Notes, Cheat Sheets, and Markdown summaries with PDF export.",
    detail: "Formatted cleanly for last-minute revision before midterms and finals.",
  },
  {
    id: "flashcards",
    title: "Spaced Repetition Decks",
    icon: Brain,
    tag: "Active Recall",
    color: "emerald",
    desc: "Interactive 3D flashcards using Leitner review intervals for long-term memory.",
    detail: "Automatically extracts key terms, formulas, and definitions.",
  },
  {
    id: "quiz",
    title: "Adaptive MCQ Quizzes",
    icon: HelpCircle,
    tag: "Self Test",
    color: "amber",
    desc: "Custom difficulty quizzes with instant scoring and detailed explanations.",
    detail: "Adapts to your weak areas based on previous quiz attempts.",
  },
  {
    id: "viva",
    title: "AI Viva & Interview",
    icon: Mic,
    tag: "Oral Practice",
    color: "rose",
    desc: "Technical oral exam simulation with scoring out of 10 and feedback.",
    detail: "Tests your conceptual depth before real lab vivas and technical interviews.",
  },
  {
    id: "paths",
    title: "Learning Paths",
    icon: Compass,
    tag: "Roadmaps",
    color: "cyan",
    desc: "Sequenced curriculum roadmaps with prerequisite tracking and checklists.",
    detail: "Breaks complex subjects down into digestible step-by-step topics.",
  },
];

export function ProductSystemVisualization() {
  const [activeNode, setActiveNode] = useState<string>("chat");

  const selectedNode = SYSTEM_NODES.find((n) => n.id === activeNode) || SYSTEM_NODES[0];

  return (
    <div className="space-y-16 py-8">
      {/* ─── SECTION 8: PRODUCT VISUALIZATION ─── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-[#06060a] p-6 sm:p-10 text-white shadow-2xl space-y-10">
        {/* Subtle grid background texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        <div className="relative z-10 text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <Layers className="h-3.5 w-3.5" /> Product Architecture
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            One document. An entire learning system.
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Upload a single PDF or YouTube video. Watch EduMitra-AI automatically index and branch it into 6 interconnected, active recall study modes.
          </p>
        </div>

        {/* Node Branching System */}
        <div className="relative z-10 space-y-8">
          {/* Central Root Document Node */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group cursor-pointer rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-900/90 px-6 py-4 shadow-xl shadow-indigo-500/10 hover:border-indigo-400 transition-all text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-indigo-400">
                <BookOpen className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Uploaded Learning Material</span>
              </div>
              <p className="text-sm font-bold text-white">PDF Document or YouTube Video Transcript</p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px]">
                  768-D Vector Embeddings
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  Grounded Vector Store
                </Badge>
              </div>
            </div>

            {/* Connecting Animated Line Downward */}
            <div className="h-8 w-0.5 bg-gradient-to-b from-indigo-500 to-transparent my-1" />
          </div>

          {/* 6 Branching System Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {SYSTEM_NODES.map((node) => {
              const Icon = node.icon;
              const isSelected = activeNode === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setActiveNode(node.id)}
                  className={`group relative cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                      : "border-slate-200/60 dark:border-white/10 bg-white/5 hover:border-indigo-500/40 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-slate-400 border-white/10 font-mono">
                      {node.tag}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {node.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {node.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected Node Deep Dive Box */}
          {selectedNode && (
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px]">
                    {selectedNode.tag} Feature Highlight
                  </Badge>
                  <span className="text-xs font-bold text-white">{selectedNode.title}</span>
                </div>
                <p className="text-xs text-slate-300">{selectedNode.detail}</p>
              </div>

              <Link href="/signup">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 border-0 shadow-md gap-1.5 flex-shrink-0">
                  Try {selectedNode.title} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── SECTION 9: WHY EDUMITRA-AI IS DIFFERENT ─── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Zap className="h-4 w-4" /> Why EduMitra-AI is Different
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Not another generic chatbot. A grounded workspace for your own material.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Generic AI models guess answers based on internet noise. EduMitra-AI anchors every response, flashcard, and quiz question strictly in your syllabus, lecture slides, and video transcripts.
          </p>
        </div>

        {/* 4 Differentiators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d19] p-6 space-y-3 shadow-sm hover:border-indigo-500/30 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Grounded Learning & Zero Hallucinations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every AI answer includes exact page numbers and video timestamps. You never have to worry about fake code methods or hallucinated facts during exam preparation.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d19] p-6 space-y-3 shadow-sm hover:border-indigo-500/30 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Active Recall & Spaced Repetition Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Don't just re-read notes passively. Convert textbook chapters into 3D Leitner flashcards and adaptive quizzes to maximize long-term retention.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d19] p-6 space-y-3 shadow-sm hover:border-indigo-500/30 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Continuous Technical Viva Evaluation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Simulate actual lab vivas and technical interviews before test day. The AI examiner evaluates your conceptual depth and provides scoring out of 10.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d19] p-6 space-y-3 shadow-sm hover:border-indigo-500/30 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              One Unified Workspace
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Stop switching between separate flashcard apps, note-taking software, and chat tools. All 6 study modes synchronize automatically under each document.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 10: FINAL CTA ─── */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs uppercase font-semibold">
            Ready to Upgrade Your Study Workflow?
          </Badge>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Your next study session could be smarter.
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
            Join thousands of students turning complex lecture materials into high-scoring exam preparation with EduMitra-AI.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/signup">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-8 py-3.5 border-0 shadow-xl shadow-indigo-600/30 gap-2 rounded-2xl transition-transform hover:scale-105">
              Create Your Learning Workspace →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
