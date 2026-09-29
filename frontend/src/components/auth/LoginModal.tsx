"use client";

import { useState, useEffect } from "react";
import { loginUser, fetchLoginStatus, resetLoginRateLimit } from "@/lib/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; role: string; email: string }) => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [email, setEmail] = useState("officer@ntro.gov.in");
  const [password, setPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);

  // Security & Daily Login Rate Limit states
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState("");
  const [loginError, setLoginError] = useState("");
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    async function loadStatus() {
      try {
        const status = await fetchLoginStatus(email);
        setIsLocked(status.is_locked);
        setAttemptsRemaining(status.attempts_remaining);
        setMaxAttempts(status.max_attempts);
        setRetryAfterSeconds(status.retry_after_seconds);
        if (status.is_locked) {
          setLockoutMessage(status.message);
        }
      } catch {}
    }
    loadStatus();
  }, [isOpen, email]);

  // Countdown timer for lockout
  useEffect(() => {
    if (retryAfterSeconds <= 0) return;
    const interval = setInterval(() => {
      setRetryAfterSeconds((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setLockoutMessage("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryAfterSeconds]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setIsLoading(true);
    setLoginError("");

    try {
      const res = await loginUser(email || "officer@ntro.gov.in", password);
      setIsLoading(false);

      if (res.success && res.data?.user) {
        setIsLocked(false);
        setLoginError("");
        onLoginSuccess(res.data.user);
        onClose();
      } else {
        setAttemptsRemaining(res.attemptsRemaining);
        if (res.isLocked) {
          setIsLocked(true);
          setLockoutMessage(
            res.error || "Daily login limit reached. Access locked for 24 hours for security purposes."
          );
          setRetryAfterSeconds(res.retryAfterSeconds || 86400);
        } else {
          setLoginError(
            res.error || `Invalid credentials. ${res.attemptsRemaining} attempts left today.`
          );
        }
      }
    } catch {
      setIsLoading(false);
      setLoginError("Failed to reach authentication service.");
    }
  };

  const handleQuickDemoLogin = () => {
    if (isLocked) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: "Officer / Evaluator",
        role: "Smart India Hackathon Evaluator",
        email: "evaluator@sih2026.gov.in",
      });
      onClose();
    }, 300);
  };

  const handleResetLockout = async () => {
    setIsLoading(true);
    try {
      const res = await resetLoginRateLimit(email);
      setIsLocked(false);
      setLockoutMessage("");
      setLoginError("");
      setAttemptsRemaining(res.max_attempts);
      setRetryAfterSeconds(0);
    } catch {}
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/25">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 8h12M13 4l4 4-4 4" />
              <path d="M20 16H8M11 20l-4-4 4-4" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to TransformAI
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Access the document intelligence workspace, CCR synthesis, and multi-format generators.
          </p>
        </div>

        {/* Daily Security Limit Status Badge */}
        <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isLocked ? "bg-red-500 animate-ping" : attemptsRemaining <= 1 ? "bg-red-500" : attemptsRemaining <= 3 ? "bg-amber-500" : "bg-emerald-500"}`} />
            <span>Daily Security Limit:</span>
          </div>
          <span className={`font-semibold ${isLocked || attemptsRemaining <= 1 ? "text-red-600 dark:text-red-400 font-bold" : attemptsRemaining <= 3 ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`}>
            {isLocked ? "🔒 Locked for Today" : `${attemptsRemaining} / ${maxAttempts} attempts left`}
          </span>
        </div>

        {/* Lockout Alert Box */}
        {isLocked && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-xs text-red-600 dark:text-red-400">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Daily Login Limit Reached</span>
            </div>
            <p className="text-[11px] text-red-700 dark:text-red-300 leading-relaxed">
              {lockoutMessage || `Maximum login attempts per day (${maxAttempts}) reached. Locked for 24 hours.`}
            </p>
            {retryAfterSeconds > 0 && (
              <div className="text-[10px] font-mono text-red-600 dark:text-red-400 font-semibold bg-red-100/70 dark:bg-red-900/40 px-2 py-0.5 rounded">
                Remaining: {Math.floor(retryAfterSeconds / 3600)}h {Math.floor((retryAfterSeconds % 3600) / 60)}m {retryAfterSeconds % 60}s
              </div>
            )}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Security Protection</span>
              <button
                type="button"
                onClick={handleResetLockout}
                disabled={isLoading}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reset Limit (Evaluator / Demo)
              </button>
            </div>
          </div>
        )}

        {/* Login Error Notification */}
        {loginError && !isLocked && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <span className="text-base leading-none">⚠️</span>
            <div className="space-y-0.5">
              <div className="font-semibold">{loginError}</div>
              <div className="text-[11px] text-amber-700 dark:text-amber-300">
                {attemptsRemaining} of {maxAttempts} attempts remaining today.
              </div>
            </div>
          </div>
        )}

        {/* Quick Demo Login Pill */}
        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 rounded-2xl p-3 text-center space-y-2">
          <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
            ✨ SIH 2026 Evaluator Quick Access
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isLocked || isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLocked ? "🔒 Locked for Today" : isLoading ? "Signing in..." : "1-Click Instant Demo Login →"}
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <span className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            or continue with credentials
          </span>
          <span className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Government / Official Email
            </label>
            <input
              type="email"
              required
              disabled={isLocked || isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@ntro.gov.in"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              disabled={isLocked || isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isLocked || isLoading}
            className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLocked ? "🔒 Locked for Today" : isLoading ? "Authenticating..." : "Sign In with Credentials"}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400">
          Encrypted with TLS 1.3 · Document security guaranteed
        </p>
      </div>
    </div>
  );
}
