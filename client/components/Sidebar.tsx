"use client";

import React, { useState } from "react";
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
  BookOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLearningStore } from "@/lib/store";
import { useAuth } from "@/auth/useAuth";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/BrandLogo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Learner";
  const displayEmail = user?.email || "";

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const renderNavContent = (onLinkClick?: () => void) => (
    <>
      {/* Brand Header */}
      <div className="mb-4 flex items-center justify-between px-2">
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex items-center gap-3 group"
        >
          <BrandLogo size="sm" />
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

        {onLinkClick && (
          <button
            onClick={onLinkClick}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg"
            aria-label="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

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
            onClick={onLinkClick}
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
              onClick={onLinkClick}
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

      {/* Footer Profile & Theme Switcher */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs flex-shrink-0">
            {displayName[0]?.toUpperCase() || "U"}
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
            onClick={() => {
              if (onLinkClick) onLinkClick();
              handleLogout();
            }}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ─── MOBILE TOP HEADER BAR (sm & md screens) ─── */}
      <div className="md:hidden flex h-14 w-full items-center justify-between border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#08080e]/80 backdrop-blur-md px-4 flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="sm" className="h-8 w-8" />
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              EduMitra<span className="text-indigo-600 dark:text-indigo-400">-AI</span>
            </span>
          </Link>
        </div>

        <Link
          href="/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs"
        >
          {displayName[0]?.toUpperCase() || "U"}
        </Link>
      </div>

      {/* ─── MOBILE DRAWER OVERLAY ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Sliding drawer panel */}
          <div className="relative flex h-full w-72 max-w-[80vw] flex-col bg-slate-50/90 dark:bg-[#08080e]/90 backdrop-blur-xl p-4 shadow-2xl z-50 border-r border-slate-200 dark:border-white/10">
            {renderNavContent(() => setMobileOpen(false))}
          </div>
        </div>
      )}

      {/* ─── DESKTOP SIDEBAR (md+ screens) ─── */}
      <aside className="hidden md:flex h-screen w-64 flex-shrink-0 flex-col border-r border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#08080e]/70 backdrop-blur-md px-4 py-5 transition-colors">
        {renderNavContent()}
      </aside>
    </>
  );
}
