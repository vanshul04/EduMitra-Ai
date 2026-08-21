"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** Size variant: sm (sidebar), md (auth pages), lg (hero) */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: "h-10 w-10", img: 28 },
  md: { container: "h-12 w-12", img: 34 },
  lg: { container: "h-14 w-14", img: 40 },
};

export function BrandLogo({ size = "md", className }: BrandLogoProps) {
  const s = sizeMap[size];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-xl overflow-hidden shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform",
        s.container,
        className
      )}
    >
      <Image
        src="/logo.png"
        alt="EduMitra-AI"
        width={s.img}
        height={s.img}
        className="object-contain"
        priority
      />
    </div>
  );
}
