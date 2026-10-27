"use client";

import React, { useState, useEffect } from "react";
import { User, Lock, AtSign, Eye, EyeOff, X, AlertCircle, CheckCircle2, UserPlus, LogIn } from "lucide-react";
import { UserProfile } from "@/types/todo";
import { registerUser, loginUser } from "@/lib/firestore-todos";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
  currentProfile?: UserProfile | null;
  initialMode?: "signin" | "register";
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  currentProfile,
  initialMode = "signin",
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "register">(initialMode);
  const [name, setName] = useState(currentProfile?.name || "");
  const [username, setUsername] = useState(currentProfile?.username || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError("");
      setSuccessMsg("");
      setPassword("");
      setConfirmPassword("");
      if (currentProfile) {
        setName(currentProfile.name);
        setUsername(currentProfile.username);
      }
    }
  }, [isOpen, initialMode, currentProfile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

    if (!cleanUsername) {
      setError("Please enter a valid username (letters, numbers, underscores).");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (cleanUsername.length < 3) {
        setError("Username must be at least 3 characters.");
        return;
      }
      if (password.length < 4) {
        setError("Password must be at least 4 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      let profile: UserProfile;

      if (mode === "register") {
        profile = await registerUser(name.trim(), cleanUsername, password);
        setSuccessMsg(`Welcome, ${profile.name}! Account created successfully.`);
      } else {
        profile = await loginUser(cleanUsername, password);
        setSuccessMsg(`Welcome back, ${profile.name}!`);
      }

      // Persist session to localStorage
      localStorage.setItem("todo_user_session", JSON.stringify(profile));

      // Trigger login callback
      setTimeout(() => {
        onLoginSuccess(profile);
        onClose();
      }, 400);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Authentication failed. Please check your network and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && currentProfile) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl animate-slideIn overflow-hidden">
        {/* Header & Tabs */}
        <div className="border-b border-zinc-800 bg-zinc-950/60 p-4 pb-0">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">
                {mode === "register" ? "Create Account" : "Sign In to Planner"}
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {mode === "register"
                  ? "Register your username to save your personal plans"
                  : "Access your private plans and analytics"}
              </p>
            </div>
            {currentProfile && (
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-zinc-800 -mx-4 px-4 gap-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
                mode === "signin"
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
                mode === "register"
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5 p-5">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs text-indigo-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Name Field (Only in Register mode) */}
          {mode === "register" && (
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Username Field */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                required
                placeholder="e.g. mahesh"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            {mode === "register" && (
              <p className="text-[10px] text-zinc-500 mt-1">
                Letters, numbers, underscores only. Must be unique.
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
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

          {/* Confirm Password Field (Register only) */}
          {mode === "register" && (
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading
                ? mode === "register"
                  ? "Creating Account..."
                  : "Signing In..."
                : mode === "register"
                ? "Create Account & Sign In"
                : "Sign In"}
            </button>
          </div>

          {/* Quick toggle at bottom */}
          <div className="text-center pt-1">
            {mode === "signin" ? (
              <p className="text-[11px] text-zinc-500">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p className="text-[11px] text-zinc-500">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                  }}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
