"use client";

import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  BarChart3,
  CheckCircle2,
  Calendar,
  Layers,
  TrendingUp,
  Activity,
  SlidersHorizontal,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  CalendarDays,
  Flame,
  Clock,
} from "lucide-react";
import { TodoItem } from "@/types/todo";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Chart.js global defaults for dark theme
ChartJS.defaults.color = "#71717a";
ChartJS.defaults.borderColor = "#27272a";
ChartJS.defaults.font.family = "system-ui, sans-serif";

interface AnalyticsDashboardProps {
  todos: TodoItem[];
  onSelectDate?: (date: string) => void;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AnalyticsDashboard({
  todos,
}: AnalyticsDashboardProps) {
  // View mode: 7d (Week), 14d, 30d (Month), Year (12m), or Custom days
  const [viewMode, setViewMode] = useState<"7d" | "14d" | "30d" | "year" | "custom">("7d");
  const [customInput, setCustomInput] = useState<string>("7");

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Daily breakdown of existing dates
    const dateMap: Record<string, { total: number; completed: number }> = {};
    todos.forEach((t) => {
      const d = t.date || "Unknown";
      if (!dateMap[d]) dateMap[d] = { total: 0, completed: 0 };
      dateMap[d].total++;
      if (t.completed) dateMap[d].completed++;
    });

    const daily = Object.entries(dateMap)
      .map(([date, v]) => ({
        date,
        total: v.total,
        completed: v.completed,
        pending: v.total - v.completed,
        rate: Math.round((v.completed / v.total) * 100),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const days = daily.length;
    const avgDaily = days > 0 ? (total / days).toFixed(1) : "0.0";

    // Category breakdown
    const catMap: Record<string, number> = {};
    todos.forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + 1;
    });

    // Time-of-day distribution (Morning, Afternoon, Evening, Night)
    const timeBlocks = [
      { key: "morning", label: "Morning", hours: "06:00 - 12:00", icon: Sunrise, total: 0, completed: 0 },
      { key: "afternoon", label: "Afternoon", hours: "12:00 - 17:00", icon: Sun, total: 0, completed: 0 },
      { key: "evening", label: "Evening", hours: "17:00 - 21:00", icon: Sunset, total: 0, completed: 0 },
      { key: "night", label: "Night", hours: "21:00 - 06:00", icon: Moon, total: 0, completed: 0 },
    ];

    todos.forEach((t) => {
      const time = t.time || "09:00";
      const [h] = time.split(":").map(Number);
      let idx = 0;
      if (h >= 6 && h < 12) idx = 0;
      else if (h >= 12 && h < 17) idx = 1;
      else if (h >= 17 && h < 21) idx = 2;
      else idx = 3;

      timeBlocks[idx].total++;
      if (t.completed) timeBlocks[idx].completed++;
    });

    // Day of the week rhythm (Mon - Sun)
    const rawRhythm = SHORT_WEEKDAYS.map((name) => ({ name, total: 0, completed: 0 }));

    todos.forEach((t) => {
      if (!t.date) return;
      const [y, m, d] = t.date.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      const dayIdx = dt.getDay();
      rawRhythm[dayIdx].total++;
      if (t.completed) rawRhythm[dayIdx].completed++;
    });

    // Reorder: Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const weekRhythm = [
      rawRhythm[1],
      rawRhythm[2],
      rawRhythm[3],
      rawRhythm[4],
      rawRhythm[5],
      rawRhythm[6],
      rawRhythm[0],
    ];

    let bestDay = "None";
    let maxTasks = 0;
    weekRhythm.forEach((d) => {
      if (d.total > maxTasks) {
        maxTasks = d.total;
        bestDay = d.name;
      }
    });

    let peakBlock = "Morning";
    let maxBlockTasks = 0;
    timeBlocks.forEach((b) => {
      if (b.total > maxBlockTasks) {
        maxBlockTasks = b.total;
        peakBlock = b.label;
      }
    });

    return {
      total,
      completed,
      pending,
      rate,
      daily,
      catMap,
      days,
      avgDaily,
      timeBlocks,
      weekRhythm,
      bestDay,
      peakBlock,
    };
  }, [todos]);

  // ---------- Calendar Timeline Generation ----------

  const chartData = useMemo(() => {
    const now = new Date();

    // 1. YEARLY MODE: 12 Months of Current Year (Jan - Dec)
    if (viewMode === "year") {
      const currentYear = now.getFullYear();
      const monthBuckets = MONTH_NAMES.map((name, idx) => {
        const monthTodos = todos.filter((t) => {
          if (!t.date) return false;
          const [y, m] = t.date.split("-").map(Number);
          return y === currentYear && m === idx + 1;
        });
        const comp = monthTodos.filter((t) => t.completed).length;
        const pend = monthTodos.length - comp;
        const rate = monthTodos.length > 0 ? Math.round((comp / monthTodos.length) * 100) : 0;
        return { label: name, completed: comp, pending: pend, rate };
      });

      return {
        labels: monthBuckets.map((b) => b.label),
        completed: monthBuckets.map((b) => b.completed),
        pending: monthBuckets.map((b) => b.pending),
        rates: monthBuckets.map((b) => b.rate),
        titleSuffix: `Yearly Overview (${currentYear})`,
        count: 12,
      };
    }

    // 2. DAILY MODES: 7d, 14d, 30d, or Custom days
    let numDays = 7;
    if (viewMode === "7d") numDays = 7;
    else if (viewMode === "14d") numDays = 14;
    else if (viewMode === "30d") numDays = 30;
    else if (viewMode === "custom") {
      const parsed = parseInt(customInput, 10);
      numDays = !isNaN(parsed) && parsed > 0 ? Math.min(parsed, 180) : 7;
    }

    // Generate real calendar dates ending on today
    const dayBuckets = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      const dayName = SHORT_WEEKDAYS[dt.getDay()];
      const m = dt.getMonth() + 1;
      const d = dt.getDate();

      const dayTodos = todos.filter((t) => t.date === dateStr);
      const comp = dayTodos.filter((t) => t.completed).length;
      const pend = dayTodos.length - comp;
      const rate = dayTodos.length > 0 ? Math.round((comp / dayTodos.length) * 100) : 0;

      // Show weekday name (e.g. "Tue 10/27") for up to 14 days; use "10/27" for longer spans
      const label = numDays <= 14 ? `${dayName} ${m}/${d}` : `${m}/${d}`;

      dayBuckets.push({
        date: dateStr,
        label,
        completed: comp,
        pending: pend,
        rate,
      });
    }

    const titleSuffix =
      viewMode === "7d"
        ? "Last 7 Days (Week)"
        : viewMode === "14d"
        ? "Last 14 Days"
        : viewMode === "30d"
        ? "Last 30 Days (Month)"
        : `Last ${numDays} Days`;

    return {
      labels: dayBuckets.map((b) => b.label),
      completed: dayBuckets.map((b) => b.completed),
      pending: dayBuckets.map((b) => b.pending),
      rates: dayBuckets.map((b) => b.rate),
      titleSuffix,
      count: dayBuckets.length,
    };
  }, [viewMode, customInput, todos]);

  // Bar chart: Completed vs Pending
  const barData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Completed",
        data: chartData.completed,
        backgroundColor: "#4f46e5",
        borderRadius: 4,
        barThickness: chartData.count <= 7 ? 22 : chartData.count <= 14 ? 14 : 7,
      },
      {
        label: "Pending",
        data: chartData.pending,
        backgroundColor: "#3f3f46",
        borderRadius: 4,
        barThickness: chartData.count <= 7 ? 22 : chartData.count <= 14 ? 14 : 7,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: { boxWidth: 10, font: { size: 11 }, color: "#a1a1aa" },
      },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: chartData.count > 14 ? 9 : 10 }, color: "#71717a", maxRotation: 45 },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 10 }, color: "#71717a" },
        grid: { color: "#1e1e1e" },
      },
    },
  };

  // Line chart: completion rate trend
  const lineData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Completion %",
        data: chartData.rates,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.12)",
        fill: true,
        tension: 0.35,
        pointRadius: chartData.count > 14 ? 2.5 : 4,
        pointBackgroundColor: "#ffffff",
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: chartData.count > 14 ? 9 : 10 }, color: "#71717a", maxRotation: 45 },
      },
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (v: unknown) => `${v}%`, font: { size: 10 }, color: "#71717a" },
        grid: { color: "#1e1e1e" },
      },
    },
  };

  // Doughnut: category distribution
  const catLabels = Object.keys(stats.catMap);
  const catColors = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#e4e4e7", "#71717a"];
  const doughnutData = {
    labels: catLabels,
    datasets: [
      {
        data: catLabels.map((c) => stats.catMap[c]),
        backgroundColor: catColors.slice(0, catLabels.length),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Title & Interactive Timeline Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
            Analytics Dashboard
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Plan performance, activity trends, and workload distribution
          </p>
        </div>

        {/* Timeline Switcher: 7d (Week), 14d, 30d (Month), Year (12m), Custom */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-zinc-900/90 p-1 border border-zinc-800">
            {[
              { key: "7d" as const, label: "7d (Week)" },
              { key: "14d" as const, label: "14d" },
              { key: "30d" as const, label: "30d (Month)" },
              { key: "year" as const, label: "Year (12m)" },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setViewMode(btn.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  viewMode === btn.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Custom Days Input */}
          <div
            onClick={() => setViewMode("custom")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 border text-xs cursor-pointer transition-all ${
              viewMode === "custom"
                ? "border-indigo-600 bg-indigo-600/15 text-white shadow-sm"
                : "border-zinc-800 bg-zinc-900/90 text-zinc-400"
            }`}
          >
            <SlidersHorizontal className="h-3 w-3 text-indigo-400" />
            <span>Custom:</span>
            <input
              type="number"
              min="1"
              max="180"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                setViewMode("custom");
              }}
              placeholder="Days"
              className="w-12 rounded bg-zinc-950 border border-zinc-700 px-1.5 py-0.5 text-center font-mono text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
            <span>days</span>
          </div>
        </div>
      </div>

      {/* KPI Cards: Total / Completed with %, Daily Avg Activity, Active Days */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Completed / Total with % */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Plans Completed
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/10">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight text-white">
              {stats.completed}
              <span className="text-sm font-normal text-zinc-500"> / {stats.total}</span>
            </p>
            <span className="rounded bg-indigo-600/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
              {stats.rate}%
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">{stats.pending} pending tasks</p>
        </div>

        {/* Card 2: Average Regular Daily Activity */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Avg Daily Activity
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/10">
              <Activity className="h-3.5 w-3.5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <p className="text-2xl font-bold tracking-tight text-white">{stats.avgDaily}</p>
            <span className="text-xs text-zinc-400">plans / day</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Average daily plans scheduled</p>
        </div>

        {/* Card 3: Active Days Logged */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Active Days Logged
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/10">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <p className="text-2xl font-bold tracking-tight text-white">{stats.days}</p>
            <span className="text-xs text-zinc-400">{stats.days === 1 ? "day" : "days"}</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Days with recorded activities</p>
        </div>

        {/* Card 4: Total Plans Volume */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Success Rate
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/10">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <p className="text-2xl font-bold tracking-tight text-white">{stats.rate}%</p>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Overall completion ratio</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart: Workload */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
              Workload — {chartData.titleSuffix}
            </h3>
          </div>
          <div className="h-56">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Line Chart: Completion Trend */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
              Completion Rate Trend — {chartData.titleSuffix}
            </h3>
          </div>
          <div className="h-56">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Section: Category Distribution & Productivity Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Category Distribution with Clean Breakdown */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              Category Breakdown
            </h3>
            <span className="text-[11px] text-zinc-500">{catLabels.length} active categories</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Doughnut Chart */}
            <div className="h-44 w-44 shrink-0 relative flex items-center justify-center">
              {catLabels.length > 0 ? (
                <>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-white">{stats.total}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Plans</span>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                  No data
                </div>
              )}
            </div>

            {/* Clean Category Progress List */}
            <div className="flex-1 w-full space-y-2.5">
              {catLabels.length === 0 ? (
                <p className="text-xs text-zinc-600 py-6 text-center">No categories recorded</p>
              ) : (
                catLabels.map((cat, i) => {
                  const count = stats.catMap[cat] || 0;
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  const color = catColors[i % catColors.length];
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium text-zinc-200">{cat}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">{count} plans</span>
                          <span className="font-mono text-[11px] text-zinc-400">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Productivity Habits & Rhythm */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col justify-between gap-5">
          {/* Section A: Weekly Activity Rhythm (Mon - Sun) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-indigo-400" />
                Weekly Activity Rhythm
              </h3>
              {stats.bestDay !== "None" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-600/20">
                  <Flame className="h-3 w-3" /> Peak: {stats.bestDay}
                </span>
              )}
            </div>

            {/* 7 Clean Horizontal Day Cards */}
            <div className="grid grid-cols-7 gap-1.5">
              {stats.weekRhythm.map((d) => {
                const isActive = d.total > 0;
                const isBest = d.name === stats.bestDay && d.total > 0;
                return (
                  <div
                    key={d.name}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 transition-all border ${
                      isBest
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25"
                        : isActive
                        ? "bg-zinc-800/90 text-white border-zinc-700"
                        : "bg-zinc-950/60 text-zinc-500 border-zinc-800/70"
                    }`}
                  >
                    <span className="text-[11px] font-bold tracking-tight">{d.name}</span>
                    <span
                      className={`mt-1 font-mono text-sm font-bold ${
                        isBest ? "text-white" : isActive ? "text-indigo-400" : "text-zinc-600"
                      }`}
                    >
                      {d.total}
                    </span>
                    <span className="text-[9px] opacity-70 mt-0.5">
                      {d.total === 1 ? "task" : "tasks"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Time of Day Schedule */}
          <div className="pt-4 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                Time of Day Schedule
              </h3>
              <span className="text-[11px] text-zinc-500">
                Peak: <strong className="text-white">{stats.peakBlock}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {stats.timeBlocks.map((b) => {
                const isPeak = b.label === stats.peakBlock && b.total > 0;
                return (
                  <div
                    key={b.key}
                    className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
                      isPeak
                        ? "border-indigo-600/60 bg-indigo-600/10 shadow-sm"
                        : "border-zinc-800/80 bg-zinc-950/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <b.icon className={`h-4 w-4 ${isPeak ? "text-indigo-400" : "text-zinc-500"}`} />
                      <span className="font-mono text-xs font-bold text-white">{b.total}</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-zinc-200">{b.label}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{b.hours}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
