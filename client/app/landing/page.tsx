"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, BookOpen, Brain, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductSystemVisualization } from "@/components/ProductSystemVisualization";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/BrandLogo";

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-[#06060a] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* ─── PUBLIC TOP HEADER ─── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06060a]/80 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandLogo size="sm" />
          <span className="text-xl font-extrabold tracking-tight text-white">
            EduMitra<span className="text-indigo-400">-AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 border-0 shadow-md">
              Create Workspace →
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-16">
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Next-Generation AI Study Companion
          </div>

          <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Turn any PDF or YouTube lecture into an active learning workspace.
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop passively reading slides. EduMitra-AI extracts 768-D vector embeddings from your course material to generate grounded RAG chat, exam notes, flashcards, quizzes, and AI viva interview practice.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-8 py-3.5 border-0 shadow-xl shadow-indigo-600/30 gap-2 rounded-2xl">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 text-sm font-semibold px-6 py-3.5 rounded-2xl">
                Sign In to Existing Account
              </Button>
            </Link>
          </div>
        </section>

        {/* ─── SECTIONS 8, 9, 10 VISUALIZATION & DIFFERENTIATOR & CTA ─── */}
        <ProductSystemVisualization />
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/10 bg-[#040407] py-8 text-center text-xs text-slate-500">
        <p>© 2026 EduMitra-AI. Personal AI Learning & Exam Prep System.</p>
      </footer>
    </div>
  );
}
