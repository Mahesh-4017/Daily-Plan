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
import { AlertCircle, Loader2, ListTodo, UserPlus } from "lucide-react";

export default function Home() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<"planner" | "analytics">("planner");

  // User Profile & Authentication State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
        // If not logged in on first visit, open the sign-in modal
        setAuthModalOpen(true);
      }
    } catch (e) {
      console.warn("Could not restore user session:", e);
    }
  }, []);

  // 2. Real-time Firestore subscription isolated to the active username
  useEffect(() => {
    const username = userProfile?.username || "guest";
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
  };

  const currentUsername = userProfile?.username || "guest";
  const effective = selectedDate || todayStr;
  const dayTodos = todos.filter((t) => t.date === effective);
  const dayCompleted = dayTodos.filter((t) => t.completed).length;
  const todayTodos = todos.filter((t) => t.date === todayStr);

  const openNew = () => { setEditingTodo(null); setModalOpen(true); };
  const openEdit = (t: TodoItem) => { setEditingTodo(t); setModalOpen(true); };

  const handleSave = async (data: Omit<TodoItem, "id">, editId?: string) => {
    editId
      ? await updateTodo(currentUsername, editId, data)
      : await addTodo(currentUsername, data);
  };

  const handleToggle = async (id: string, cur: boolean) => {
    await toggleTodo(currentUsername, id, !cur);
  };

  const handleDelete = async (id: string) => {
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
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6">
        {/* Guest Banner if not signed in */}
        {!userProfile && (
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400">
                <UserPlus className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Viewing as Guest</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Sign in with your username so all your plans and analytics are saved under your personal account.
                </p>
              </div>
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 whitespace-nowrap transition"
            >
              Sign In / Choose Username
            </button>
          </div>
        )}

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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm text-zinc-500">Loading your plans...</p>
          </div>
        ) : currentTab === "planner" ? (
          <div className="space-y-5">
            {/* Planner Section Header & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-bold text-white flex items-center gap-2">
                  <ListTodo className="h-4.5 w-4.5 text-indigo-400" />
                  Daily Planner
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Schedule, organize, and check off your daily plans
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
          <AnalyticsDashboard
            todos={todos}
            onSelectDate={(d) => { setSelectedDate(d); setCurrentTab("planner"); }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 text-[11px] text-zinc-600">
          <span>TODO Plan</span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
            <span>Live</span>
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
      />
    </div>
  );
}
