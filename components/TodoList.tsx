"use client";

import React, { useState } from "react";
import { Check, Clock, Edit2, Trash2, Plus, Calendar } from "lucide-react";
import { TodoItem } from "@/types/todo";

interface TodoListProps {
  todos: TodoItem[];
  selectedDate: string;
  onToggleComplete: (id: string, current: boolean) => Promise<void>;
  onEdit: (todo: TodoItem) => void;
  onDelete: (id: string) => Promise<void>;
  onOpenNewModal: () => void;
}

export default function TodoList({
  todos,
  selectedDate,
  onToggleComplete,
  onEdit,
  onDelete,
  onOpenNewModal,
}: TodoListProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = todos
    .filter((t) => {
      if (filter === "pending") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    })
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  const pending = todos.filter((t) => !t.completed).length;
  const completed = todos.filter((t) => t.completed).length;

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this plan?")) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
          {[
            { key: "all" as const, label: "All", count: todos.length },
            { key: "pending" as const, label: "Pending", count: pending },
            { key: "completed" as const, label: "Done", count: completed },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                filter === f.key
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f.label}
              <span className="ml-1 opacity-60">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16">
          <Calendar className="h-8 w-8 text-zinc-700 mb-3" />
          <p className="text-sm font-medium text-zinc-400">
            {filter !== "all" ? `No ${filter} tasks` : "No plans for this day"}
          </p>
          <button
            onClick={onOpenNewModal}
            className="mt-4 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Plan
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              className={`group flex items-start gap-3 rounded-xl border p-3.5 transition-all animate-fadeInUp ${
                item.completed
                  ? "border-zinc-800/50 bg-zinc-900/30"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
              }`}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              {/* Checkbox */}
              <button
                onClick={() => item.id && onToggleComplete(item.id, item.completed)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                  item.completed
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-zinc-600 hover:border-indigo-500"
                }`}
              >
                {item.completed && <Check className="h-3 w-3 stroke-[3]" />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-sm font-medium ${
                    item.completed ? "text-zinc-500 line-through" : "text-zinc-100"
                  }`}>
                    {item.title}
                  </span>
                  {item.time && (
                    <span className="inline-flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                      <Clock className="h-2.5 w-2.5" />
                      {item.time}
                    </span>
                  )}
                  <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-500">
                    {item.category}
                  </span>
                </div>
                {item.description && (
                  <p className={`mt-1 text-xs leading-relaxed ${
                    item.completed ? "text-zinc-600" : "text-zinc-400"
                  }`}>
                    {item.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(item)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-white"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
