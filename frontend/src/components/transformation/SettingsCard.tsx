"use client";

import {
  TransformationSettings,
  AudienceType,
  ToneType,
  LanguageType,
  DetailLevelType,
  ObjectiveType,
} from "@/lib/types";

interface SettingsCardProps {
  settings: TransformationSettings;
  onChange: (newSettings: TransformationSettings) => void;
}

export default function SettingsCard({ settings, onChange }: SettingsCardProps) {
  const audiences: AudienceType[] = [
    "Senior Officials",
    "Technical Personnel",
    "Field Personnel",
    "General Audience",
  ];

  const tones: ToneType[] = [
    "Formal",
    "Technical",
    "Neutral",
    "Simplified",
  ];

  const languages: LanguageType[] = [
    "English",
    "Hindi",
    "Marathi",
  ];

  const detailLevels: DetailLevelType[] = [
    "Brief",
    "Medium",
    "Detailed",
  ];

  const objectives: ObjectiveType[] = [
    "Inform",
    "Brief",
    "Advise",
    "Explain",
    "Recommend",
  ];

  const updateSetting = <K extends keyof TransformationSettings>(
    key: K,
    value: TransformationSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div id="settings-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Transformation Parameters</span>
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          Step 2 of 3
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* AUDIENCE */}
        <div className="space-y-1.5">
          <label htmlFor="select-audience" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Target Audience
          </label>
          <select
            id="select-audience"
            value={settings.audience}
            onChange={(e) => updateSetting("audience", e.target.value as AudienceType)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {audiences.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* TONE */}
        <div className="space-y-1.5">
          <label htmlFor="select-tone" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Transformation Tone
          </label>
          <select
            id="select-tone"
            value={settings.tone}
            onChange={(e) => updateSetting("tone", e.target.value as ToneType)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {tones.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* LANGUAGE */}
        <div className="space-y-1.5">
          <label htmlFor="select-language" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Target Language
          </label>
          <select
            id="select-language"
            value={settings.language}
            onChange={(e) => updateSetting("language", e.target.value as LanguageType)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {languages.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* DETAIL LEVEL */}
        <div className="space-y-1.5">
          <label htmlFor="select-detail" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Detail Level
          </label>
          <select
            id="select-detail"
            value={settings.detailLevel}
            onChange={(e) => updateSetting("detailLevel", e.target.value as DetailLevelType)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {detailLevels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* OBJECTIVE */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
          <label htmlFor="select-objective" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Communication Objective
          </label>
          <select
            id="select-objective"
            value={settings.objective}
            onChange={(e) => updateSetting("objective", e.target.value as ObjectiveType)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {objectives.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
