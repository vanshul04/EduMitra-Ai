"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bookmark, Search, Trash2, Copy, Check, MessageSquare, Brain, FileText, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLearningStore } from "@/lib/store";
import { fetchBookmarksApi, deleteBookmarkApi } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { Bookmark as BookmarkType, BookmarkCategory } from "@/lib/types";

export default function BookmarksPage() {
  const { bookmarks, setBookmarks, deleteBookmark } = useLearningStore();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookmarksApi().then((data) => {
      setBookmarks(data || []);
    });
  }, [setBookmarks]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Bookmark text copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBookmarkApi(id);
      deleteBookmark(id);
      toast.success("Bookmark removed");
    } catch {
      deleteBookmark(id);
      toast.success("Bookmark removed");
    }
  };

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          <Bookmark className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          My Saved Bookmarks
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Save important AI explanations, chat citations, key concepts, and flashcards for quick revision.
        </p>
      </div>

      {/* Search & Category Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search saved bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
          />
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="bg-slate-100 dark:bg-white/10 text-xs">
            <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
            <TabsTrigger value="chat" className="text-xs px-3">Chat</TabsTrigger>
            <TabsTrigger value="concept" className="text-xs px-3">Concepts</TabsTrigger>
            <TabsTrigger value="flashcard" className="text-xs px-3">Flashcards</TabsTrigger>
            <TabsTrigger value="note" className="text-xs px-3">Notes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks saved yet"
          description="Bookmark important AI explanations during chat sessions or key concept extractions."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookmarks.map((b) => (
            <div
              key={b.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] uppercase font-semibold">
                    {b.category}
                  </Badge>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(b.id)}
                    className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                    title="Delete bookmark"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {b.title}
                </h3>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4 font-mono bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-100 dark:border-white/5">
                  {b.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400">
                <span>{b.source_info || "Saved item"}</span>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(b.id, b.content)}
                  className="h-7 px-2 text-xs text-slate-500 hover:text-indigo-500 gap-1"
                >
                  {copiedId === b.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  {copiedId === b.id ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
