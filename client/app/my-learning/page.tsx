"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FolderKanban, Search, Plus, FileText, Youtube, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLearningStore } from "@/lib/store";
import { fetchDocuments } from "@/lib/api";
import { DocumentCard } from "@/components/DocumentCard";
import { EmptyState } from "@/components/EmptyState";
import { Document } from "@/lib/types";

export default function MyLearningPage() {
  const { documentsList, setDocumentsList } = useLearningStore();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pdf" | "youtube">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await fetchDocuments();
      setDocumentsList(docs);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const filteredDocs = documentsList
    .filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterType === "all" || doc.source_type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="min-h-screen px-6 py-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <FolderKanban className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            My Learning Library
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Browse and manage all your uploaded PDFs and YouTube video study materials.
          </p>
        </div>

        <Link href="/upload">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 border-0 gap-2 shadow-md shadow-indigo-600/20">
            <Plus className="h-4 w-4" /> Upload New Material
          </Button>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search learning materials by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* Tabs Filter */}
        <Tabs
          value={filterType}
          onValueChange={(val) => setFilterType(val as "all" | "pdf" | "youtube")}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-slate-100 dark:bg-white/10 text-xs">
            <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
            <TabsTrigger value="pdf" className="text-xs px-3 gap-1">
              <FileText className="h-3 w-3 text-rose-500" /> PDF
            </TabsTrigger>
            <TabsTrigger value="youtube" className="text-xs px-3 gap-1">
              <Youtube className="h-3 w-3 text-red-500" /> YouTube
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "title")}
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b0c14] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="title">Sort: Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid of Documents */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-200/50 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Your learning library is empty"
          description="Upload your first PDF or YouTube video and let EduMitra-AI turn it into an interactive learning experience."
          actionLabel="Upload Learning Material"
          onAction={() => (window.location.href = "/upload")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} onDeleted={loadDocuments} />
          ))}
        </div>
      )}
    </div>
  );
}
