"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Moon,
  Sun,
  ShieldCheck,
  Building,
  BookOpen,
  Calendar,
  Save,
  LogOut,
  Trash2,
  AlertTriangle,
  Loader2,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { useAuth } from "@/auth/useAuth";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, profile, updateProfile, updatePassword, signOut } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [college, setCollege] = useState(profile?.college || "");
  const [course, setCourse] = useState(profile?.course || "");
  const [yearOfStudy, setYearOfStudy] = useState(profile?.year_of_study || "Year 1");

  const [savingProfile, setSavingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setCollege(profile.college || "");
      setCourse(profile.course || "");
      setYearOfStudy(profile.year_of_study || "Year 1");
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const { error } = await updateProfile({
        full_name: fullName.trim(),
        college: college.trim(),
        course: course.trim(),
        year_of_study: yearOfStudy,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || savingPassword) return;

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-8 max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          <SettingsIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          Settings & Account Management
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Manage your personal profile, academic information, password, and system preferences.
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d19] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-white/5">
          <User className="h-4 w-4 text-indigo-500" /> Learner Profile Information
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-white/5"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address (Read-only)
              </label>
              <Input
                type="email"
                disabled
                value={user?.email || ""}
                className="text-xs bg-slate-100 dark:bg-white/10 opacity-70 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                College / University
              </label>
              <Input
                type="text"
                placeholder="IIT / Stanford"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-white/5"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Course / Major
              </label>
              <Input
                type="text"
                placeholder="Computer Science"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-white/5"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Year of Study
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b0c14] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
                <option value="Postgrad">Postgrad</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={savingProfile}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 border-0 gap-1.5"
            >
              {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d19] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-white/5">
          <Key className="h-4 w-4 text-indigo-500" /> Security & Password
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Password (Min 8 chars)
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-white/5"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-white/5"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={savingPassword || !newPassword}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 border-0 gap-1.5"
            >
              {savingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Appearance & Engine Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d19] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Interface Theme Mode
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Toggle between Dark and Light visual identity modes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setTheme("dark")}
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              className="text-xs font-semibold gap-1"
            >
              <Moon className="h-3.5 w-3.5" /> Dark
            </Button>
            <Button
              onClick={() => setTheme("light")}
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              className="text-xs font-semibold gap-1"
            >
              <Sun className="h-3.5 w-3.5" /> Light
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Danger Zone
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Delete your account and remove all your stored documents, notes, quizzes, and chat history.
            </p>
          </div>

          <Button
            onClick={() => setDeleteModalOpen(true)}
            variant="outline"
            className="border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Account
          </Button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {deleteModalOpen && (
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="max-w-md p-6 border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d19] rounded-3xl space-y-4">
            <div className="space-y-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-500 mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Confirm Account Deletion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This action is <strong className="text-rose-500">permanent</strong> and will delete all your documents, quizzes, flashcards, notes, and activity history.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Type <span className="font-mono font-bold text-rose-500">DELETE</span> to confirm:
              </label>
              <Input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-white/5 border-rose-500/30"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                disabled={deleteConfirmText !== "DELETE"}
                onClick={async () => {
                  toast.error("Account deletion requested.");
                  await signOut();
                }}
                size="sm"
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold border-0 disabled:opacity-40"
              >
                Permanently Delete Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
