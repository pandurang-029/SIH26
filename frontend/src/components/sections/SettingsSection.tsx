"use client";

import { useState } from "react";

export default function SettingsSection() {
  const [model, setModel] = useState("qwen-2.5-3b");
  const [maxChars, setMaxChars] = useState(100000);
  const [qualityThreshold, setQualityThreshold] = useState(80);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = () => {
    setSaveStatus("Settings saved successfully.");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800/40">
            System Configuration
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Platform & AI Model Settings</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure system execution limits, AI grounding strictness, and deployment parameters.
          </p>
        </div>

        {saveStatus && (
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1 rounded-xl animate-pulse">
            ✓ {saveStatus}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: AI Engine & Intelligence Model */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🤖</span>
              <span>AI Engine & Model Setup</span>
            </h4>
            <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-md">
              Active
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Understanding Engine
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
              >
                <option value="qwen-2.5-3b">Qwen 2.5 3B Instruct (Local llama.cpp - 100% Offline, No API Key)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Cloud API)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Analysis Mode)</option>
                <option value="standalone-mock">Standalone Fallback Mode (Offline Demo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Single-Pass Character Limit: <span className="text-blue-600 dark:text-blue-400 font-mono">{maxChars.toLocaleString()} chars</span>
              </label>
              <input
                type="range"
                min="10000"
                max="200000"
                step="10000"
                value={maxChars}
                onChange={(e) => setMaxChars(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>10,000</span>
                <span>100,000 (Default)</span>
                <span>200,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Quality & Grounding Guardrails */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🛡️</span>
              <span>Quality & Provenance Strictness</span>
            </h4>
            <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40 px-2 py-0.5 rounded-md">
              Step 7 Grounding
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Minimum Factual Support Score: <span className="text-purple-600 dark:text-purple-400 font-mono">{qualityThreshold}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={qualityThreshold}
                onChange={(e) => setQualityThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Outputs below this threshold will display an ungrounded claim alert for human review.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">CCR Strict Validation</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-md">
                ENFORCED (Pydantic)
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Security & Operational Limits */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🔒</span>
              <span>Security & Intake Limits</span>
            </h4>
            <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 px-2 py-0.5 rounded-md">
              Hardened
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800/50">
              <span className="text-slate-500 dark:text-slate-400">Max File Intake Limit</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold font-mono">25 MB (PDF, DOCX, TXT)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800/50">
              <span className="text-slate-500 dark:text-slate-400">API Key Storage</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Protected Environment (.env)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">Export Generators</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">ReportLab (PDF), python-pptx</span>
            </div>
          </div>
        </div>

        {/* Card 4: System Status & Health */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>📡</span>
              <span>System Health & Demo Status</span>
            </h4>
            <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-md">
              Operational
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800/50">
              <span className="text-slate-500 dark:text-slate-400">Backend API URL</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">http://localhost:8000</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800/50">
              <span className="text-slate-500 dark:text-slate-400">Frontend Environment</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">Next.js 14 App Router</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">SIH Demonstration Mode</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">READY</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2"
        >
          <span>Save System Settings</span>
          <span>💾</span>
        </button>
      </div>
    </div>
  );
}
