"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Tag, AlertCircle } from "lucide-react";
import { TodoItem, CategoryType } from "@/types/todo";

interface TodoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todoData: Omit<TodoItem, "id">, editId?: string) => Promise<void>;
  editingTodo: TodoItem | null;
  defaultDate: string;
}

const CATEGORIES: CategoryType[] = ["Work", "Personal", "Study", "Health", "Finance", "General"];

export default function TodoFormModal({
  isOpen,
  onClose,
  onSave,
  editingTodo,
  defaultDate,
}: TodoFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("09:00");
  const [category, setCategory] = useState<CategoryType>("Work");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || "");
      setDate(editingTodo.date || defaultDate);
      setTime(editingTodo.time || "09:00");
      setCategory(editingTodo.category || "Work");
    } else {
      setTitle("");
      setDescription("");
      setDate(defaultDate);
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(Math.floor(now.getMinutes() / 15) * 15).padStart(2, "0");
      setTime(`${h}:${m}`);
      setCategory("Work");
    }
    setError("");
  }, [editingTodo, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(
        {
          title: title.trim(),
          description: description.trim(),
          date: date || defaultDate,
          time: time || "09:00",
          completed: editingTodo ? editingTodo.completed : false,
          priority: editingTodo?.priority || "medium",
          category,
        },
        editingTodo?.id
      );
      onClose();
    } catch {
      setError("Failed to save plan. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl animate-slideIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
          <h2 className="text-sm font-bold text-white">
            {editingTodo ? "Edit Plan" : "New Plan"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200">
              <AlertCircle className="h-3.5 w-3.5 text-indigo-400" />
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Title <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="What's the plan?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="Optional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                <Calendar className="h-3 w-3 text-indigo-400" /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                <Clock className="h-3 w-3 text-indigo-400" /> Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              <Tag className="h-3 w-3 text-indigo-400" /> Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                    category === c
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : editingTodo ? "Update" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
