import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import { TodoItem } from "@/types/todo";

/**
 * Normalizes username to a safe Firestore path segment
 */
export function getCleanUsername(username?: string | null): string {
  if (!username) return "guest";
  return username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "") || "guest";
}

/**
 * Subscribe to a specific user's todos in real-time.
 * Each user has their own isolated subcollection: `users/{username}/todos`
 */
export function subscribeToTodos(
  username: string,
  onSuccess: (todos: TodoItem[]) => void,
  onError?: (error: Error) => void
) {
  const clean = getCleanUsername(username);
  const userTodosRef = collection(db, "users", clean, "todos");
  const q = query(userTodosRef, orderBy("date", "desc"));

  return onSnapshot(
    q,
    async (snapshot) => {
      // If user's private collection is empty, check legacy "todos" once and migrate
      if (snapshot.empty) {
        try {
          const legacySnap = await getDocs(query(collection(db, "todos"), orderBy("date", "desc")));
          if (!legacySnap.empty) {
            for (const legDoc of legacySnap.docs) {
              await addDoc(userTodosRef, {
                ...legDoc.data(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
            return;
          }
        } catch {
          // Ignore migration errors
        }
      }

      const todos: TodoItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || "",
          description: data.description || "",
          date: data.date || (() => {
            const n = new Date();
            return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
          })(),
          time: data.time || "09:00",
          completed: Boolean(data.completed),
          completedAt: data.completedAt || null,
          category: data.category || "General",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        } as TodoItem;
      });
      onSuccess(todos);
    },
    (err) => {
      console.error(`Firestore subscription error for user ${clean}:`, err);
      if (onError) onError(err);
    }
  );
}

/**
 * Add a new plan/todo item to the user's private collection
 */
export async function addTodo(username: string, item: Omit<TodoItem, "id">): Promise<string> {
  const clean = getCleanUsername(username);
  const docRef = await addDoc(collection(db, "users", clean, "todos"), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing plan/todo item in user's private collection
 */
export async function updateTodo(username: string, id: string, updates: Partial<TodoItem>): Promise<void> {
  const clean = getCleanUsername(username);
  const docRef = doc(db, "users", clean, "todos", id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Toggle task completion status in user's private collection
 */
export async function toggleTodo(username: string, id: string, completed: boolean): Promise<void> {
  const clean = getCleanUsername(username);
  const docRef = doc(db, "users", clean, "todos", id);
  await updateDoc(docRef, {
    completed,
    completedAt: completed ? new Date().toISOString() : null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a plan/todo item from user's private collection
 */
export async function deleteTodo(username: string, id: string): Promise<void> {
  const clean = getCleanUsername(username);
  const docRef = doc(db, "users", clean, "todos", id);
  await deleteDoc(docRef);
}
