"use client";

import { useState, useEffect } from "react";
import { loginUser, fetchLoginStatus, resetLoginRateLimit } from "@/lib/api";

interface AuthPageProps {
  initialMode?: "login" | "register";
  onLoginSuccess: (user: { name: string; role: string; email: string }) => void;
  onBackToHome?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function AuthPage({
  initialMode = "login",
  onLoginSuccess,
  onBackToHome,
  theme = "light",
  onToggleTheme,
}: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Security & Daily Login Rate Limit states
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState("");
  const [loginError, setLoginError] = useState("");
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);

  // Check initial daily login status on load
  useEffect(() => {
    async function loadStatus() {
      try {
        const status = await fetchLoginStatus(email);
        setIsLocked(status.is_locked);
        setAttemptsUsed(status.attempts_used);
        setAttemptsRemaining(status.attempts_remaining);
        setMaxAttempts(status.max_attempts);
        setRetryAfterSeconds(status.retry_after_seconds);
        if (status.is_locked) {
          setLockoutMessage(status.message);
        }
      } catch {}
    }
    loadStatus();
  }, [email]);

  // Countdown timer for security lockout
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setIsLoading(true);
    setLoginError("");

    try {
      const res = await loginUser(email || "officer@ntro.gov.in", password);
      setIsLoading(false);

      if (res.success && res.data?.user) {
        setAttemptsUsed(0);
        setAttemptsRemaining(res.data.max_attempts || 5);
        setIsLocked(false);
        setLoginError("");
        onLoginSuccess(res.data.user);
      } else {
        setAttemptsRemaining(res.attemptsRemaining);
        setAttemptsUsed(res.attemptsUsed);
        if (res.isLocked) {
          setIsLocked(true);
          setLockoutMessage(
            res.error || "Daily login limit exceeded. Access is temporarily locked for security purposes."
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
      setLoginError("Failed to reach authentication service. Please check network connection.");
    }
  };

  const handleResetLockout = async () => {
    setIsLoading(true);
    try {
      const res = await resetLoginRateLimit(email);
      setIsLocked(false);
      setLockoutMessage("");
      setLoginError("");
      setAttemptsRemaining(res.max_attempts);
      setAttemptsUsed(0);
      setRetryAfterSeconds(0);
    } catch {}
    setIsLoading(false);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: fullName || "Pandurang Hade",
        role: "Official User",
        email: email || "user@organisation.in",
      });
    }, 350);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: "Officer / Evaluator",
        role: "Smart India Hackathon Evaluator",
        email: "evaluator@sih2026.gov.in",
      });
    }, 300);
  };

  // Password strength calculation
  const passwordLength = password.length;
  const strengthLevel = passwordLength === 0 ? 0 : passwordLength < 6 ? 1 : passwordLength < 10 ? 2 : 3;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased relative overflow-hidden transition-colors duration-200">
      
      {/* Ambient background blur circles matching screenshot */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-200/30 via-blue-200/20 to-transparent dark:from-cyan-900/10 dark:via-blue-900/10 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-gradient-to-tr from-blue-200/25 via-sky-100/20 to-transparent dark:from-blue-950/20 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Split Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-12 py-8 lg:py-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* LEFT COLUMN: BRANDING & HEADLINE */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between self-stretch py-2 sm:py-4">
          
          {/* Top Logo & Back Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToHome}
              className="flex items-center gap-2.5 group focus:outline-none"
              title="Return to home page"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 8h12M13 4l4 4-4 4" />
                  <path d="M20 16H8M11 20l-4-4 4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Transform<span className="text-blue-600">AI</span>
              </span>
            </button>

            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <span>←</span>
                <span>Back to Home</span>
              </button>
            )}
          </div>

          {/* Middle Main Content */}
          <div className="my-10 sm:my-16 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              One document.<br />
              Every format <span className="text-[#0284c7] dark:text-cyan-400">you need.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed font-normal">
              TransformAI turns reports, papers and decks into summaries, notes, slides, FAQs and social content — tuned to the audience and language you choose.
            </p>

            {/* Bullet Points with circular checkmarks */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
                <div className="w-5 h-5 rounded-full border border-blue-600 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  ✓
                </div>
                <span>11 transformation types out of the box</span>
              </div>

              <div className="flex items-center gap-3 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
                <div className="w-5 h-5 rounded-full border border-blue-600 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  ✓
                </div>
                <span>6 Indian languages for generated output</span>
              </div>

              <div className="flex items-center gap-3 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
                <div className="w-5 h-5 rounded-full border border-blue-600 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  ✓
                </div>
                <span>Projects, history and re-runnable outputs</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            © 2026 TransformAI
          </div>
        </div>

        {/* RIGHT COLUMN: FLOATING AUTH CARD */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[30px] p-8 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 max-w-[460px] w-full transition-all">
            
            {/* VIEW A: LOGIN ("Welcome back") */}
            {mode === "login" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Welcome back
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                    Log in to continue transforming your content.
                  </p>
                </div>

                {/* Daily Security Limit Indicator */}
                <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <span className={`w-2 h-2 rounded-full ${isLocked ? "bg-red-500 animate-ping" : attemptsRemaining <= 1 ? "bg-red-500" : attemptsRemaining <= 3 ? "bg-amber-500" : "bg-emerald-500"}`} />
                    <span>Daily Security Policy:</span>
                  </div>
                  <span className={`font-semibold ${isLocked || attemptsRemaining <= 1 ? "text-red-600 dark:text-red-400 font-bold" : attemptsRemaining <= 3 ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`}>
                    {isLocked ? "🔒 Account Locked" : `${attemptsRemaining} / ${maxAttempts} attempts left today`}
                  </span>
                </div>

                {/* Lockout Alert Banner */}
                {isLocked && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2 font-bold text-sm text-red-600 dark:text-red-400">
                      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Security Lockout Triggered</span>
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                      {lockoutMessage || `Maximum login attempts per day (${maxAttempts}) exceeded. For security purposes, this account and IP are locked for 24 hours to prevent unauthorized access.`}
                    </p>
                    {retryAfterSeconds > 0 && (
                      <div className="text-[11px] font-mono text-red-600 dark:text-red-400 font-semibold bg-red-100/70 dark:bg-red-900/40 px-2.5 py-1 rounded-md inline-block">
                        Lockout time remaining: {Math.floor(retryAfterSeconds / 3600)}h {Math.floor((retryAfterSeconds % 3600) / 60)}m {retryAfterSeconds % 60}s
                      </div>
                    )}
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">NTRO Cyber Defense Protocol</span>
                      <button
                        type="button"
                        onClick={handleResetLockout}
                        disabled={isLoading}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Reset Limit (Evaluator / Demo)
                      </button>
                    </div>
                  </div>
                )}

                {/* Login Error Notification (When not locked) */}
                {loginError && !isLocked && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                    <span className="text-base leading-none">⚠️</span>
                    <div className="space-y-0.5">
                      <div className="font-semibold">{loginError}</div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-300">
                        {attemptsRemaining} of {maxAttempts} attempts remaining today before security lockout.
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      disabled={isLocked || isLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@organisation.in"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Password field with Forgot Password link */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => alert("Password reset link sent to your registered government email.")}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      disabled={isLocked || isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Keep me signed in checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="keep-signed-in"
                      checked={keepSignedIn}
                      disabled={isLocked || isLoading}
                      onChange={(e) => setKeepSignedIn(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer disabled:opacity-50"
                    />
                    <label htmlFor="keep-signed-in" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      Keep me signed in
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLocked || isLoading}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-600/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
                  >
                    {isLocked ? "🔒 Locked for Today" : isLoading ? "Verifying..." : "Login"}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <span className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
                  <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                    OR
                  </span>
                  <span className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
                </div>

                {/* Continue with Google SSO */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm shadow-sm transition flex items-center justify-center gap-3 active:scale-[0.99]"
                >
                  {/* Google SVG G Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Bottom Switch Link */}
                <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Create one
                  </button>
                </div>
              </div>
            )}

            {/* VIEW B: REGISTER ("Create your account") */}
            {mode === "register" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Create your account
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                    Free while TransformAI is in hackathon preview.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Pandurang Hade"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@organisation.in"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Password + Strength Indicator */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    
                    {/* Password Strength Bar */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className={`h-1 flex-1 rounded-full ${strengthLevel >= 1 ? "bg-amber-400" : "bg-slate-200 dark:bg-slate-700"}`} />
                      <div className={`h-1 flex-1 rounded-full ${strengthLevel >= 2 ? "bg-amber-400" : "bg-slate-200 dark:bg-slate-700"}`} />
                      <div className={`h-1 flex-1 rounded-full ${strengthLevel >= 3 ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                      <div className={`h-1 flex-1 rounded-full ${strengthLevel >= 3 && passwordLength >= 10 ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                      <span className="text-[10px] text-slate-400 pl-1 shrink-0">
                        {passwordLength === 0 ? "Too weak" : passwordLength < 6 ? "Too weak" : passwordLength < 10 ? "Good" : "Strong"}
                      </span>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="agree-terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <label htmlFor="agree-terms" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      I agree to the Terms and Privacy Policy
                    </label>
                  </div>

                  {/* Create Account Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-600/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <span className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
                  <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                    OR
                  </span>
                  <span className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
                </div>

                {/* Google SSO */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm shadow-sm transition flex items-center justify-center gap-3 active:scale-[0.99]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Switch to Login */}
                <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Log in
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
