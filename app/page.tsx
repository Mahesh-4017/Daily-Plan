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
import { AlertCircle, Loader2, ListTodo } from "lucide-react";

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

  useEffect(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setTodayStr(today);
    setSelectedDate(today);

    // Restore saved user profile session
    try {
      const saved = localStorage.getItem("todo_user_session");
      if (saved) {
        setUserProfile(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not restore user session:", e);
    }

    const unsubscribe = subscribeToTodos(
      (loaded) => {
        setTodos(loaded);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(
          "Unable to load plans. Please check your connection."
        );
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Update browser tab title dynamically based on active page
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

  const effective = selectedDate || todayStr;
  const dayTodos = todos.filter((t) => t.date === effective);
  const dayCompleted = dayTodos.filter((t) => t.completed).length;
  const todayTodos = todos.filter((t) => t.date === todayStr);

  const openNew = () => { setEditingTodo(null); setModalOpen(true); };
  const openEdit = (t: TodoItem) => { setEditingTodo(t); setModalOpen(true); };

  const handleSave = async (data: Omit<TodoItem, "id">, editId?: string) => {
    editId ? await updateTodo(editId, data) : await addTodo(data);
  };
  const handleToggle = async (id: string, cur: boolean) => { await toggleTodo(id, !cur); };
  const handleDelete = async (id: string) => { await deleteTodo(id); };

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
            <p className="text-sm text-zinc-500">Loading plans...</p>
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
