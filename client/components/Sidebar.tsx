"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
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
  GraduationCap,
  Sparkles,
  BookOpen,
  UserCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLearningStore } from "@/lib/store";
import { useAuth } from "@/auth/useAuth";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-learning", label: "My Learning", icon: FolderKanban },
  { href: "/upload", label: "Upload Content", icon: Upload },
  { href: "/chat", label: "AI Chat", icon: MessageSquare, requiresDoc: true },
  { href: "/notes", label: "AI Notes", icon: FileText, requiresDoc: true },
  { href: "/learning-paths", label: "Learning Paths", icon: Compass, requiresDoc: true },
  { href: "/viva", label: "Viva / Interview", icon: Mic, requiresDoc: true },
  { href: "/flashcards", label: "Flashcards", icon: Brain, requiresDoc: true },
  { href: "/quiz", label: "Quizzes", icon: HelpCircle, requiresDoc: true },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/tools", label: "Study Tools", icon: Wrench, requiresDoc: true },
  { href: "/history", label: "Study History", icon: History },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentDocument } = useLearningStore();
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Learner";
  const displayEmail = user?.email || "";

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#08080e] px-4 py-5 transition-colors">
      {/* Brand Header */}
      <Link href="/" className="mb-6 flex items-center gap-3 px-2 group">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          <GraduationCap className="h-5 w-5" />
          <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-300 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              EduMitra<span className="text-indigo-600 dark:text-indigo-400">-AI</span>
            </span>
          </div>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            AI Learning Companion
          </p>
        </div>
      </Link>

      {/* Active Document Card */}
      {currentDocument ? (
        <div className="mb-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 dark:bg-indigo-500/15 p-3">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
            Active Workspace
          </p>
          <div className="flex items-start gap-2">
            <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" />
            <p className="line-clamp-2 text-xs font-medium text-slate-800 dark:text-indigo-100">
              {currentDocument.title}
            </p>
          </div>
          <Badge
            variant="outline"
            className="mt-2 border-indigo-500/30 bg-indigo-500/20 text-[9px] font-semibold text-indigo-600 dark:text-indigo-300 uppercase"
          >
            {currentDocument.source_type === "youtube" ? "YouTube" : "PDF"}
          </Badge>
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-dashed border-slate-300 dark:border-white/10 p-3 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">No active document</p>
          <Link
            href="/upload"
            className="mt-1 inline-block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Upload content
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {navItems.map(({ href, label, icon: Icon, requiresDoc }) => {
          const isActive = pathname === href;
          const isDisabled = Boolean(requiresDoc && !currentDocument);

          return (
            <Link
              key={href}
              href={isDisabled ? "/upload" : href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150",
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 dark:bg-indigo-600 dark:text-white"
                  : isDisabled
                  ? "cursor-not-allowed text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{label}</span>
              {isDisabled && (
                <span className="ml-auto text-[9px] font-normal text-slate-400 dark:text-slate-600">
                  Select doc
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Authenticated Profile & Theme Switcher */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs flex-shrink-0">
            {displayName[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
              {displayName}
            </p>
            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
              {displayEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
