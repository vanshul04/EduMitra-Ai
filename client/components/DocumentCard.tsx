"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Youtube, MessageSquare, HelpCircle, Brain, Trash2, ArrowRight, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLearningStore } from "@/lib/store";
import { Document } from "@/lib/types";
import { deleteDocumentApi } from "@/lib/api";

interface DocumentCardProps {
  doc: Document;
  onDeleted?: () => void;
}

export function DocumentCard({ doc, onDeleted }: DocumentCardProps) {
  const router = useRouter();
  const { currentDocument, setCurrentDocument, removeDocumentFromList, logActivity } = useLearningStore();

  const isCurrent = currentDocument?.id === doc.id;

  const handleSelect = () => {
    setCurrentDocument({ id: doc.id, title: doc.title, source_type: doc.source_type });
    logActivity({
      document_id: doc.id,
      document_title: doc.title,
      type: "upload",
      details: "Selected document for learning",
    });
  };

  const handleNavigate = (path: string, type: "chat" | "quiz" | "flashcards") => {
    setCurrentDocument({ id: doc.id, title: doc.title, source_type: doc.source_type });
    logActivity({
      document_id: doc.id,
      document_title: doc.title,
      type,
      details: `Opened ${type} session`,
    });
    router.push(path);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${doc.title}"?`)) return;

    try {
      await deleteDocumentApi(doc.id);
      removeDocumentFromList(doc.id);
      toast.success("Document deleted");
      if (onDeleted) onDeleted();
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const isPdf = doc.source_type === "pdf";

  return (
    <div
      onClick={handleSelect}
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 cursor-pointer p-5 ${
        isCurrent
          ? "border-indigo-500/50 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30"
          : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-indigo-400/40 dark:hover:border-indigo-500/30 hover:shadow-md"
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge
            variant="outline"
            className={`gap-1.5 font-medium ${
              isPdf
                ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {isPdf ? <FileText className="h-3.5 w-3.5" /> : <Youtube className="h-3.5 w-3.5" />}
            {isPdf ? "PDF Document" : "YouTube Video"}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
            title="Delete Document"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {doc.title}
        </h3>

        {/* Chunk / Date info */}
        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          {doc.chunk_count !== undefined && (
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              {doc.chunk_count} chunks
            </span>
          )}
          {doc.created_at && (
            <span>
              {new Date(doc.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate("/chat", "chat");
            }}
            className="h-8 px-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300"
            title="AI Chat"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Chat
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate("/quiz", "quiz");
            }}
            className="h-8 px-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-300"
            title="Quiz"
          >
            <HelpCircle className="h-3.5 w-3.5 mr-1" />
            Quiz
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate("/flashcards", "flashcards");
            }}
            className="h-8 px-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-300"
            title="Flashcards"
          >
            <Brain className="h-3.5 w-3.5 mr-1" />
            Cards
          </Button>
        </div>

        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate("/chat", "chat");
          }}
          className="h-8 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white border-0"
        >
          Open <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}
