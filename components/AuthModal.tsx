"use client";

import React, { useState } from "react";
import { User, Lock, AtSign, Eye, EyeOff, X, AlertCircle } from "lucide-react";
import { signInAnonymously, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserProfile } from "@/types/todo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
  currentProfile?: UserProfile | null;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  currentProfile,
}: AuthModalProps) {
  const [name, setName] = useState(currentProfile?.name || "");
  const [username, setUsername] = useState(currentProfile?.username || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!username.trim()) {
      setError("Please choose a username");
      return;
    }
    if (!password.trim() || password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    setLoading(true);
    setError("");

    const cleanUsername = username.trim().replace(/^@/, "");
    const cleanName = name.trim();

    try {
      // 1. Try Firebase Anonymous Auth
      try {
        const userCredential = await signInAnonymously(auth);
        await updateProfile(userCredential.user, {
          displayName: `${cleanName}|${cleanUsername}`,
        });
      } catch (authErr) {
        // Fallback gracefully if anonymous auth is not enabled in Firebase Console
        console.warn("Firebase Auth fallback to local session:", authErr);
      }

      // 2. Persist session in localStorage
      const profile: UserProfile = {
        name: cleanName,
        username: cleanUsername,
      };
      localStorage.setItem("todo_user_session", JSON.stringify(profile));

      onLoginSuccess(profile);
      onClose();
    } catch {
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-white">
              {currentProfile ? "Edit Profile" : "Sign In"}
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Enter your credentials to access your planner
            </p>
          </div>
          {currentProfile && (
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200">
              <AlertCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                required
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                required
                placeholder="alexmorgan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-9 pr-10 py-2 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all"
            >
              {loading ? "Signing in..." : currentProfile ? "Save Changes" : "Sign In & Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
