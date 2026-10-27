"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  BarChart3,
  ListTodo,
  Plus,
  LogOut,
  LogIn,
} from "lucide-react";
import { UserProfile } from "@/types/todo";

interface HeaderProps {
  currentTab: "planner" | "analytics";
  setCurrentTab: (tab: "planner" | "analytics") => void;
  onOpenNewModal: () => void;
  todayCount: number;
  completedCount: number;
  selectedDate: string;
  userProfile?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export default function Header({
  currentTab,
  setCurrentTab,
  onOpenNewModal,
  todayCount,
  completedCount,
  userProfile,
  onOpenAuthModal,
  onLogout,
}: HeaderProps) {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Progress ring for today's stats
  const pct = todayCount > 0 ? Math.round((completedCount / todayCount) * 100) : 0;
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (pct / 100) * circumference;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-2.5">

        {/* ── 1. Left Zone: User Identity & Date (Balanced flex-1) ── */}
        <div className="flex flex-1 items-center justify-start gap-3 min-w-0">
          {userProfile ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs uppercase shrink-0">
                {userProfile.name ? userProfile.name[0] : "U"}
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-xs font-semibold text-white truncate">
                  Hi, {userProfile.name}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono truncate">
                  @{userProfile.username}
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition shrink-0"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              )}
            </div>
          ) : onOpenAuthModal ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-indigo-500 hover:text-white transition"
            >
              <LogIn className="h-3.5 w-3.5 text-indigo-400" />
              <span>Sign In</span>
            </button>
          ) : null}

          {/* Divider & Date */}
          <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-zinc-800/80">
            <Calendar className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs font-medium text-zinc-300 whitespace-nowrap">
              {dateStr || "Loading..."}
            </span>
          </div>
        </div>

        {/* ── 2. Center Zone: Navigation Tabs (Always Dead Center) ── */}
        <div className="flex shrink-0 items-center justify-center">
          <div className="flex rounded-full bg-zinc-900/90 p-[3px] border border-zinc-800 shadow-inner">
            <button
              onClick={() => setCurrentTab("planner")}
              className={`flex items-center gap-1.5 rounded-full px-4 sm:px-5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                currentTab === "planner"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ListTodo className="h-3.5 w-3.5" />
              <span>Planner</span>
            </button>
            <button
              onClick={() => setCurrentTab("analytics")}
              className={`flex items-center gap-1.5 rounded-full px-4 sm:px-5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                currentTab === "analytics"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* ── 3. Right Zone: Clock, Stats & CTA (Balanced flex-1) ── */}
        <div className="flex flex-1 items-center justify-end gap-3 min-w-0">
          {/* Live Clock Pill */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-zinc-800/80 bg-zinc-900/60 px-2.5 py-1">
            <Clock className="h-3 w-3 text-zinc-500" />
            <span className="font-mono text-[11px] font-medium text-zinc-300 tabular-nums whitespace-nowrap">
              {timeStr || "--:--:--"}
            </span>
          </div>

          {/* Mini progress ring + count */}
          {todayCount > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <svg width="22" height="22" className="-rotate-90">
                  <circle
                    cx="11" cy="11" r={radius}
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="11" cy="11" r={radius}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - strokeDash}
                    className="transition-all duration-500"
                  />
                </svg>
              </div>
              <span className="text-xs font-medium text-zinc-400 whitespace-nowrap">
                <strong className="text-white">{completedCount}</strong>/{todayCount}
              </span>
            </div>
          )}

          {/* New Plan CTA Button */}
          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-1.5 rounded-full bg-indigo-600 pl-3 pr-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95 transition-all shrink-0"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New Plan</span>
          </button>
        </div>

      </div>
    </header>
  );
}
