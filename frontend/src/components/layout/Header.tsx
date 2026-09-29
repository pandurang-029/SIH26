"use client";

import { useEffect, useState } from "react";
import { fetchHealthStatus, HealthCheckResponse } from "@/lib/api";

interface HeaderProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  user?: { name: string; role: string; email: string } | null;
  onLogout?: () => void;
}

export default function Header({
  activeTab = "Dashboard",
  onSelectTab,
  theme = "light",
  onToggleTheme,
  user,
  onLogout,
}: HeaderProps) {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [statusState, setStatusState] = useState<"checking" | "connected" | "error">("checking");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      const res = await fetchHealthStatus();
      if (!isMounted) return;
      if (res.success && res.data) {
        setHealthData(res.data);
        setStatusState("connected");
      } else {
        setStatusState("error");
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { label: "Dashboard", tabTarget: "Dashboard", icon: "📊" },
    { label: "New Transformation", tabTarget: "New Transformation", icon: "✨", badge: "AI" },
    { label: "Documents", tabTarget: "Documents", icon: "📁" },
    { label: "Outputs", tabTarget: "Generated Outputs", icon: "📄" },
    { label: "Templates", tabTarget: "Templates", icon: "🧩" },
    { label: "History", tabTarget: "History", icon: "🕒" },
  ];

  return (
    <>
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 transition-colors duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* 1. Left: Logo & Workspace Tag */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab("Dashboard")}
              className="flex items-center gap-2.5 group focus:outline-none"
              aria-label="TransformAI Home"
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

            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              Workspace
            </span>
          </div>

          {/* 2. Center: Primary Navigation Navbar */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 overflow-x-auto" aria-label="Main Workspace Navigation">
            {navLinks.map((link) => {
              const isActive = activeTab === link.tabTarget;
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => onSelectTab && onSelectTab(link.tabTarget)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span className="text-sm">{link.icon}</span>
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* 3. Right: System Status, Settings Icon, Theme Toggle, User Profile & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* System Status Indicator Pill */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300"
              title={
                statusState === "connected"
                  ? `Connected to ${healthData?.service || "AI Backend"}`
                  : "Connecting to Backend..."
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  statusState === "connected"
                    ? "bg-emerald-500"
                    : statusState === "checking"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-red-500"
                }`}
              />
              <span className="text-[11px]">
                {statusState === "connected"
                  ? healthData?.mock_mode
                    ? "Demo Mode"
                    : "Online"
                  : statusState === "checking"
                  ? "Connecting"
                  : "Offline"}
              </span>
            </div>

            {/* Small Settings Icon Button near theme toggle */}
            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab("Settings")}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition focus:outline-none ${
                activeTab === "Settings"
                  ? "bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              aria-label="Settings"
              title="Settings & System Configuration"
            >
              <svg
                className="w-3.5 h-3.5 transition-transform hover:rotate-45"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* User Profile Pill */}
            <div
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 pl-2 cursor-pointer group"
              role="button"
              tabIndex={0}
              title="View profile details"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : "SO"}
              </div>
              <div className="hidden xl:block text-left text-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition">
                  {user?.name || "Security Officer"}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                  {user?.role || "NTRO Enterprise"}
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="ml-1 p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                title="Sign out & return to landing page"
                aria-label="Sign out"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            )}

          </div>
        </div>

        {/* Responsive Mobile / Tablet Sub-Navbar */}
        <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2 bg-slate-50/80 dark:bg-slate-900/80 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {navLinks.map((link) => {
              const isActive = activeTab === link.tabTarget;
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => onSelectTab && onSelectTab(link.tabTarget)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? "text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* User Profile Details Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "SO"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {user?.name || "Security Officer"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {user?.email || "officer@ntro.gov.in"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Role:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {user?.role || "Tier-1 Official"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Session Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active (Authenticated)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Platform:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Smart India Hackathon 2026</span>
              </div>
            </div>

            <div className="pt-2">
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm"
                >
                  Sign Out of TransformAI
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
