"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileText,
  Sparkles,
  Loader2,
  BookOpen,
  Copy,
  Check,
  Download,
  Save,
  Plus,
  Trash2,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLearningStore } from "@/lib/store";
import { generateNotesApi, fetchNotesApi, saveNoteApi } from "@/lib/api";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { EmptyState } from "@/components/EmptyState";
import { Note, NoteType } from "@/lib/types";
import { downloadNotesPDF } from "@/lib/pdfExport";

export default function NotesPage() {
  const router = useRouter();
  const { currentDocument, notes, setNotes, addNote, deleteNote, logActivity } = useLearningStore();

  const [activeTab, setActiveTab] = useState<NoteType>("exam");
  const [loading, setLoading] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchNotesApi().then((data) => {
      setNotes(data || []);
    });
  }, [setNotes]);

  const handleGenerateNotes = async (type: NoteType) => {
    if (!currentDocument) {
      router.push("/upload");
      return;
    }
    setActiveTab(type);
    setLoading(true);

    try {
      const result = await generateNotesApi(currentDocument.id, type);
      const newNote: Note = {
        id: `note-${Date.now()}`,
        document_id: currentDocument.id,
        title: result.title,
        note_type: type as NoteType,
        content: result.content,
        created_at: new Date().toISOString(),
      };

      setCurrentNote(newNote);
      addNote(newNote);
      setIsEditing(false);
      toast.success("AI Notes generated successfully!");

      logActivity({
        document_id: currentDocument.id,
        document_title: currentDocument.title,
        type: "notes",
        details: `Generated ${type} notes`,
      });

      // Save to Supabase
      saveNoteApi({
        document_id: currentDocument.id,
        title: newNote.title,
        note_type: type,
        content: newNote.content,
      }).catch((e) => console.error("Could not persist note to DB:", e));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate notes";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = () => {
    if (!currentNote) return;
    const updated: Note = {
      ...currentNote,
      title: editTitle,
      content: editContent,
    };
    setCurrentNote(updated);
    addNote(updated);
    setIsEditing(false);
    toast.success("Note saved!");
    saveNoteApi({
      document_id: updated.document_id,
      title: updated.title,
      note_type: updated.note_type,
      content: updated.content,
    });
  };

  const startEdit = () => {
    if (!currentNote) return;
    setEditTitle(currentNote.title);
    setEditContent(currentNote.content);
    setIsEditing(true);
  };

  const handleCopy = () => {
    if (!currentNote) return;
    navigator.clipboard.writeText(currentNote.content);
    setCopied(true);
    toast.success("Note content copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    if (!currentNote) return;
    const blob = new Blob([currentNote.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentNote.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    a.click();
    toast.success("Markdown file downloaded");
  };

  const handleExportPDF = () => {
    if (!currentNote || !currentDocument) return;
    downloadNotesPDF(
      currentNote.title,
      currentDocument.title,
      currentNote.note_type,
      currentNote.content
    );
    toast.success("Notes PDF downloaded");
  };

  if (!currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <EmptyState
          icon={FileText}
          title="No document selected for AI Notes"
          description="Upload or select a document to generate Exam Preparation Notes, Revision Cheat Sheets, and Executive Summaries."
          actionLabel="Upload Material"
          onAction={() => router.push("/upload")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            AI Notes Studio
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> Active Workspace: {currentDocument.title}
          </p>
        </div>

        {/* Generate Tabs */}
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={(v) => handleGenerateNotes(v as NoteType)}>
            <TabsList className="bg-slate-100 dark:bg-white/5 text-xs p-1">
              <TabsTrigger value="exam" className="text-xs px-3 font-semibold">Exam Notes</TabsTrigger>
              <TabsTrigger value="cheat_sheet" className="text-xs px-3 font-semibold">Cheat Sheet</TabsTrigger>
              <TabsTrigger value="summary" className="text-xs px-3 font-semibold">Executive Summary</TabsTrigger>
              <TabsTrigger value="detailed" className="text-xs px-3 font-semibold">Detailed Notes</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            EduMitra-AI is synthesizing grounded notes...
          </p>
        </div>
      ) : currentNote ? (
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0c16] p-8 shadow-xl space-y-6">
          {/* Note Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
            {isEditing ? (
              <Input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-base font-bold bg-slate-50 dark:bg-white/5"
              />
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20 text-xs font-semibold capitalize">
                    {currentNote.note_type.replace("_", " ")}
                  </Badge>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {currentNote.title}
                </h2>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <Button onClick={handleSaveEdit} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1">
                  <Save className="h-3.5 w-3.5" /> Save Edits
                </Button>
              ) : (
                <Button onClick={startEdit} variant="outline" size="sm" className="text-xs font-semibold border-slate-200 dark:border-white/10 gap-1">
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </Button>
              )}

              <Button onClick={handleCopy} variant="outline" size="sm" className="text-xs font-semibold border-slate-200 dark:border-white/10 gap-1">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>

              <Button onClick={handleExportMarkdown} variant="outline" size="sm" className="text-xs font-semibold border-slate-200 dark:border-white/10 gap-1">
                <Download className="h-3.5 w-3.5" /> Export .MD
              </Button>

              <Button onClick={handleExportPDF} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs border-0 gap-1">
                <Download className="h-3.5 w-3.5" /> Export PDF
              </Button>
            </div>
          </div>

          {/* Editor vs Markdown View */}
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={16}
              className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          ) : (
            <MarkdownRenderer content={currentNote.content} />
          )}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No notes generated yet"
          description="Select a note type above to generate structured Exam Preparation Notes or Revision Cheat Sheets."
          actionLabel="Generate Exam Notes"
          onAction={() => handleGenerateNotes("exam")}
        />
      )}

      {/* Saved Notes History List */}
      {notes.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Saved Notes Library ({notes.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {notes.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  setCurrentNote(n);
                  setIsEditing(false);
                }}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 cursor-pointer hover:border-indigo-500/40 transition-all shadow-sm"
              >
                <div>
                  <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] uppercase font-semibold mb-2">
                    {n.note_type}
                  </Badge>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {n.title}
                  </h4>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400">
                  <span>{n.created_at ? new Date(n.created_at).toLocaleDateString() : "Saved"}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(n.id);
                      toast.success("Note removed");
                    }}
                    className="h-6 w-6 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
