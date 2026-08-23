"use client";

import EduMitraGrid from "@/components/ui/edumitra-grid";

export default function EduMitraGridDemo() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 dark:bg-slate-950">
      <EduMitraGrid />
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4 pointer-events-none mix-blend-difference text-white">
        <h1 className="font-mono text-6xl md:text-9xl font-black tracking-tighter uppercase leading-none">
          EduMitra
        </h1>
        <p className="mt-4 font-mono text-xs md:text-sm max-w-lg opacity-70">
          High-velocity dynamic mesh. Sweep your cursor quickly across the grid
          to unleash kinetic shockwaves.
        </p>
      </div>
    </div>
  );
}
