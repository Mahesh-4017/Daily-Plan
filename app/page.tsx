"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import DateSelector from "@/components/DateSelector";
import TodoList from "@/components/TodoList";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import TodoFormModal from "@/components/TodoFormModal";
import AuthModal from "@/components/AuthModal";
import { TodoItem, UserProfile } from "@/types/todo";
import {
  subscribeToTodos,
  addTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
} from "@/lib/firestore-todos";
import {
  AlertCircle,
  Loader2,
  ListTodo,
  ShieldCheck,
  Lock,
  CalendarDays,
  BarChart2,
  ArrowRight,
  UserPlus,
  LogIn,
} from "lucide-react";

export default function Home() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<"planner" | "analytics">("planner");

  // User Profile & Authentication State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");

  // Deferred client-side date init (Next.js 16 prerender safe)
  const [todayStr, setTodayStr] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  // 1. Client-side initialization & session restore
  useEffect(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setTodayStr(today);
    setSelectedDate(today);

    try {
      const saved = localStorage.getItem("todo_user_session");
      if (saved) {
        setUserProfile(JSON.parse(saved));
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.warn("Could not restore user session:", e);
      setLoading(false);
    }
  }, []);

  // 2. Real-time Firestore subscription strictly isolated to logged-in user
  useEffect(() => {
    const username = userProfile?.username;
    if (!username) {
      setTodos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToTodos(
      username,
      (loaded) => {
        setTodos(loaded);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Unable to load plans. Please check your connection.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.username]);

  // 3. Dynamic browser tab title
  useEffect(() => {
    document.title =
      currentTab === "planner"
        ? "Daily Planner | TODO Plan"
        : "Analytics Dashboard | TODO Plan";
  }, [currentTab]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("todo_user_session");
    } catch {}
    setUserProfile(null);
    setTodos([]);
  };

  const openAuth = (mode: "signin" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const currentUsername = userProfile?.username || "";
  const effective = selectedDate || todayStr;
  const dayTodos = todos.filter((t) => t.date === effective);
  const dayCompleted = dayTodos.filter((t) => t.completed).length;
  const todayTodos = todos.filter((t) => t.date === todayStr);

  const openNew = () => {
    if (!userProfile) {
      openAuth("signin");
      return;
    }
    setEditingTodo(null);
    setModalOpen(true);
  };

  const openEdit = (t: TodoItem) => {
    setEditingTodo(t);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<TodoItem, "id">, editId?: string) => {
    if (!currentUsername) {
      openAuth("signin");
      return;
    }
    editId
      ? await updateTodo(currentUsername, editId, data)
      : await addTodo(currentUsername, data);
  };

  const handleToggle = async (id: string, cur: boolean) => {
    if (!currentUsername) return;
    await toggleTodo(currentUsername, id, !cur);
  };

  const handleDelete = async (id: string) => {
    if (!currentUsername) return;
    await deleteTodo(currentUsername, id);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewModal={openNew}
        todayCount={todayTodos.length}
        completedCount={todayTodos.filter((t) => t.completed).length}
        selectedDate={effective}
        userProfile={userProfile}
        onOpenAuthModal={() => openAuth("signin")}
        onLogout={handleLogout}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6">
        {/* Connection issue banner */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-xs text-zinc-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Connection Issue</p>
              <p className="mt-0.5 text-zinc-400">{error}</p>
            </div>
          </div>
        )}

        {/* ── Condition A: User NOT Logged In (Landing / Auth Required Gate) ── */}
        {!userProfile ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16">
            <div className="w-full max-w-xl text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-400 mb-6">
                <ShieldCheck className="h-4 w-4" />
                <span>Private & Isolated Accounts</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Your Personal Daily Planner
              </h1>
              <p className="mt-3 text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Sign in with your username and password, or register a new account. Every user has their own completely isolated plans and analytics.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => openAuth("signin")}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all active:scale-95"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In to Account</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-xs font-bold text-zinc-200 hover:border-indigo-500 hover:text-white transition-all active:scale-95"
                >
                  <UserPlus className="h-4 w-4 text-indigo-400" />
                  <span>Register New Account</span>
                </button>
              </div>

              {/* Feature Cards Grid */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 mb-3">
                    <Lock className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Private Storage</h3>
                  <p className="mt-1 text-[11px] text-zinc-400 leading-normal">
                    Your plans are saved strictly under your username. No other user can view or edit your tasks.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 mb-3">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Time Scheduling</h3>
                  <p className="mt-1 text-[11px] text-zinc-400 leading-normal">
                    Schedule items by time and category (Work, Study, Health). Stay organized every day.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 mb-3">
                    <BarChart2 className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Visual Analytics</h3>
                  <p className="mt-1 text-[11px] text-zinc-400 leading-normal">
                    Track completion rates, weekly rhythm schedules, and category breakdowns automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : loading ? (
          /* ── Condition B: Loading User's Plans ── */
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm text-zinc-500">Loading {userProfile.name}&apos;s plans...</p>
          </div>
        ) : currentTab === "planner" ? (
          /* ── Condition C: Logged In - Planner View ── */
          <div className="space-y-5">
            {/* Planner Section Header & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-bold text-white flex items-center gap-2">
                  <ListTodo className="h-4.5 w-4.5 text-indigo-400" />
                  Daily Planner
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Schedule, organize, and check off your personal daily plans
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  {dayTodos.length} {dayTodos.length === 1 ? "plan" : "plans"} scheduled
                </span>
              </div>
            </div>

            <DateSelector
              selectedDate={effective}
              setSelectedDate={setSelectedDate}
              dayTaskCount={dayTodos.length}
              dayCompletedCount={dayCompleted}
              todayStr={todayStr}
            />
            <TodoList
              todos={dayTodos}
              selectedDate={effective}
              onToggleComplete={handleToggle}
              onEdit={openEdit}
              onDelete={handleDelete}
              onOpenNewModal={openNew}
            />
          </div>
        ) : (
          /* ── Condition D: Logged In - Analytics View ── */
          <AnalyticsDashboard
            todos={todos}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setCurrentTab("planner");
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 text-[11px] text-zinc-600">
          <span>TODO Plan</span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
            <span>{userProfile ? `Signed in as @${userProfile.username}` : "Not signed in"}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TodoFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingTodo={editingTodo}
        defaultDate={effective || todayStr}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(profile) => setUserProfile(profile)}
        currentProfile={userProfile}
        initialMode={authMode}
      />
    </div>
  );
}
