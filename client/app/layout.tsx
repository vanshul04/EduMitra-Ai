"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CommandPalette } from "@/components/CommandPalette";
import { AuthProvider } from "@/auth/AuthProvider";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const AUTH_PAGES = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/landing"];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex h-screen overflow-hidden bg-slate-50 dark:bg-[#06060a] text-slate-900 dark:text-slate-100 antialiased font-sans`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <ProtectedRoute>
              {isAuthPage ? (
                <main className="w-full h-screen overflow-y-auto bg-slate-50 dark:bg-[#06060a]">
                  {children}
                </main>
              ) : (
                <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-100/50 dark:bg-[#0b0c14] w-full">
                    {children}
                  </main>
                </div>
              )}
              {!isAuthPage && <CommandPalette />}
            </ProtectedRoute>
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
