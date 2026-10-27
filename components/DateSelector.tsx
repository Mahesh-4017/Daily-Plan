"use client";

import React from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface DateSelectorProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dayTaskCount: number;
  dayCompletedCount: number;
  todayStr: string;
}

export default function DateSelector({
  selectedDate,
  setSelectedDate,
  dayTaskCount,
  dayCompletedCount,
  todayStr,
}: DateSelectorProps) {
  const shiftDay = (days: number) => {
    if (!selectedDate) return;
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    setSelectedDate(
      `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
    );
  };

  const isToday = selectedDate === todayStr;
  const pct = dayTaskCount > 0 ? Math.round((dayCompletedCount / dayTaskCount) * 100) : 0;

  const formatDate = (s: string) => {
    if (!s) return "...";
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      {/* Left: navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => shiftDay(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="px-2">
          <p className="text-sm font-semibold text-white">{formatDate(selectedDate)}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {isToday && (
              <span className="rounded bg-indigo-600 px-1.5 py-px text-[10px] font-bold text-white uppercase tracking-wide">
                Today
              </span>
            )}
            <span className="text-[11px] text-zinc-500">
              {dayCompletedCount}/{dayTaskCount} done
              {dayTaskCount > 0 && <span className="ml-1 text-indigo-400 font-medium">({pct}%)</span>}
            </span>
          </div>
        </div>

        <button
          onClick={() => shiftDay(1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {!isToday && todayStr && (
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="ml-1 flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-700"
          >
            <RotateCcw className="h-3 w-3" />
            Today
          </button>
        )}
      </div>

      {/* Right: date picker */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 focus:border-indigo-500 [color-scheme:dark]"
      />
    </div>
  );
}
