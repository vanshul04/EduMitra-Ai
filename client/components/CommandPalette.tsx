"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Upload,
  MessageSquare,
  Brain,
  HelpCircle,
  FileText,
  Compass,
  Mic,
  Bookmark,
  Wrench,
  History,
  BarChart3,
  Settings,
  BookOpen,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLearningStore } from "@/lib/store";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { documentsList, setCurrentDocument } = useLearningStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigateTo = (path: string) => {
    setOpen(false);
    setSearch("");
    router.push(path);
  };

  const selectDocAndNavigate = (doc: any, path: string) => {
    setCurrentDocument({ id: doc.id, title: doc.title, source_type: doc.source_type });
    setOpen(false);
    setSearch("");
    router.push(path);
  };

  const filteredDocs = search.trim()
    ? documentsList.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()))
    : documentsList.slice(0, 4);

  const pages = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "My Learning Library", icon: FolderKanban, path: "/my-learning" },
    { title: "Upload Content", icon: Upload, path: "/upload" },
    { title: "AI Chat Tutor", icon: MessageSquare, path: "/chat" },
    { title: "Flashcard Decks", icon: Brain, path: "/flashcards" },
    { title: "Adaptive Quizzes", icon: HelpCircle, path: "/quiz" },
    { title: "AI Notes", icon: FileText, path: "/notes" },
    { title: "Learning Paths", icon: Compass, path: "/learning-paths" },
    { title: "Viva / Interview Mode", icon: Mic, path: "/viva" },
    { title: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
    { title: "AI Study Tools", icon: Wrench, path: "/tools" },
    { title: "Study History", icon: History, path: "/history" },
    { title: "Analytics", icon: BarChart3, path: "/analytics" },
    { title: "Settings", icon: Settings, path: "/settings" },
  ];

  const filteredPages = search.trim()
    ? pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : pages;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0 border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d19] overflow-hidden rounded-3xl shadow-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-200 dark:border-white/10 px-4 py-3.5">
          <Search className="h-5 w-5 text-indigo-500 mr-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search documents, pages, tools... (Esc to exit)"
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs">
          {/* Documents Section */}
          {filteredDocs.length > 0 && (
            <div>
              <p className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400">
                Documents & Materials ({filteredDocs.length})
              </p>
              <div className="space-y-1 mt-1">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => selectDocAndNavigate(doc, "/chat")}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium truncate max-w-md">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                      {doc.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      Open Chat →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Pages Section */}
          <div>
            <p className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">
              Quick Navigation
            </p>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {filteredPages.map((p) => (
                <div
                  key={p.title}
                  onClick={() => navigateTo(p.path)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer font-medium transition-colors"
                >
                  <p.icon className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span>{p.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Use <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded border font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded border font-mono">↓</kbd> to navigate
          </span>
          <span>
            Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded border font-mono">Ctrl + K</kbd> anytime
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
