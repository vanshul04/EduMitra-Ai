import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface StreakInfo {
  streakCount: number;
  hasActivityToday: boolean;
}

/**
 * Calculates continuous study streak in days based on user activity timestamps.
 */
export function calculateStudyStreak(timestamps: (string | number | Date)[]): StreakInfo {
  if (!timestamps || timestamps.length === 0) {
    return { streakCount: 0, hasActivityToday: false };
  }

  const dateSet = new Set<string>();
  timestamps.forEach((ts) => {
    if (!ts) return;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return;
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dateSet.add(dateStr);
  });

  if (dateSet.size === 0) {
    return { streakCount: 0, hasActivityToday: false };
  }

  const today = new Date();
  const getFormattedDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const todayStr = getFormattedDate(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getFormattedDate(yesterday);

  const hasActivityToday = dateSet.has(todayStr);
  const hasActivityYesterday = dateSet.has(yesterdayStr);

  if (!hasActivityToday && !hasActivityYesterday) {
    return { streakCount: 0, hasActivityToday: false };
  }

  let streakCount = 0;
  let checkDate = new Date(hasActivityToday ? today : yesterday);

  while (true) {
    const checkStr = getFormattedDate(checkDate);
    if (dateSet.has(checkStr)) {
      streakCount++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { streakCount, hasActivityToday };
}
