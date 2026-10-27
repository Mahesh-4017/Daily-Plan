import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { TodoItem, UserProfile } from "@/types/todo";

/**
 * Normalizes username to a safe Firestore path segment
 */
export function getCleanUsername(username?: string | null): string {
  if (!username) return "";
  return username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

/**
 * Register a new user account with Name, Username, and Password in Firestore.
 * Ensures the username is unique and saves the user record under `users/{cleanUsername}`.
 */
export async function registerUser(
  name: string,
  username: string,
  password: string
): Promise<UserProfile> {
  const clean = getCleanUsername(username);
  if (!clean || clean.length < 3) {
    throw new Error("Username must be at least 3 characters (letters, numbers, underscores).");
  }
  if (!name.trim()) {
    throw new Error("Please enter your name.");
  }
  if (!password || password.length < 4) {
    throw new Error("Password must be at least 4 characters.");
  }

  const userDocRef = doc(db, "users", clean);
  const existingDoc = await getDoc(userDocRef);

  if (existingDoc.exists()) {
    throw new Error(`Username "@${clean}" is already registered. Please sign in instead.`);
  }

  const cleanName = name.trim();
  await setDoc(userDocRef, {
    name: cleanName,
    username: clean,
    password: password, // user credentials
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  return {
    name: cleanName,
    username: clean,
  };
}

/**
 * Sign in an existing user with Username and Password from Firestore.
 */
export async function loginUser(
  username: string,
  password: string
): Promise<UserProfile> {
  const clean = getCleanUsername(username);
  if (!clean) {
    throw new Error("Please enter your username.");
  }
  if (!password) {
    throw new Error("Please enter your password.");
  }

  const userDocRef = doc(db, "users", clean);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // If user record doesn't exist yet (e.g. legacy account created before password requirement),
    // we can allow claiming or prompt to register.
    throw new Error(`Username "@${clean}" not found. Please click "Register" above to create this account.`);
  }

  const data = userDoc.data();
  if (data.password && data.password !== password) {
    throw new Error("Incorrect password. Please check and try again.");
  }

  // Update last login
  try {
    await updateDoc(userDocRef, {
      lastLoginAt: serverTimestamp(),
    });
  } catch {
    // Non-fatal
  }

  return {
    name: data.name || clean,
    username: clean,
  };
}

/**
 * Subscribe to a specific user's plans in real-time.
 * Each user has their own completely isolated subcollection: `users/{username}/todos`
 * If username is empty or guest, it returns an empty list and DOES NOT query any data.
 */
export function subscribeToTodos(
  username: string,
  onSuccess: (todos: TodoItem[]) => void,
  onError?: (error: Error) => void
) {
  const clean = getCleanUsername(username);
  if (!clean || clean === "guest") {
    // When no user is signed in, return empty array immediately.
    onSuccess([]);
    return () => {};
  }

  const userTodosRef = collection(db, "users", clean, "todos");
  const q = query(userTodosRef, orderBy("date", "desc"));

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
