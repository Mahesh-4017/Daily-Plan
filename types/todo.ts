export type PriorityLevel = "low" | "medium" | "high" | "urgent";
export type CategoryType = "Work" | "Personal" | "Study" | "Health" | "Finance" | "General";

export interface TodoItem {
  id?: string;
  title: string;
  description: string;
  date: string; // Format: YYYY-MM-DD (e.g., 2026-10-28 or 2026-03-15)
  time: string; // Format: HH:mm (e.g., "09:30" or "14:00")
  completed: boolean;
  completedAt?: string | null;
  priority?: PriorityLevel;
  category: CategoryType;
  createdAt?: string;
  updatedAt?: string;
}

export interface DayActivitySummary {
  date: string;
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export interface UserProfile {
  name: string;
  username: string;
}
