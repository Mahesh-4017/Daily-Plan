import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { TodoItem } from "@/types/todo";

const TODOS_COLLECTION = "todos";

/**
 * Subscribe to all todos in real-time.
 * Real-time listener keeps both current day view and all-time analytics automatically in sync.
 */
export function subscribeToTodos(
  onSuccess: (todos: TodoItem[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(db, TODOS_COLLECTION), orderBy("date", "desc"));
  
  return onSnapshot(
    q,
    (snapshot) => {
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
          priority: data.priority || "medium",
          category: data.category || "General",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        } as TodoItem;
      });
      onSuccess(todos);
    },
    (err) => {
      console.error("Firestore subscription error:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Add a new plan/todo item to Firestore
 */
export async function addTodo(item: Omit<TodoItem, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, TODOS_COLLECTION), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing plan/todo item in Firestore
 */
export async function updateTodo(id: string, updates: Partial<TodoItem>): Promise<void> {
  const docRef = doc(db, TODOS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Toggle task completion status
 */
export async function toggleTodo(id: string, completed: boolean): Promise<void> {
  const docRef = doc(db, TODOS_COLLECTION, id);
  await updateDoc(docRef, {
    completed,
    completedAt: completed ? new Date().toISOString() : null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a plan/todo item
 */
export async function deleteTodo(id: string): Promise<void> {
  const docRef = doc(db, TODOS_COLLECTION, id);
  await deleteDoc(docRef);
}
