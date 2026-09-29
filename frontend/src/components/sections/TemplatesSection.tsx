"use client";

import { TransformationSettings } from "@/lib/types";

interface TemplateItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  settings: TransformationSettings;
  outputTypes: string[];
}

interface TemplatesSectionProps {
  onApplyTemplate: (settings: TransformationSettings, outputTypes: string[]) => void;
}

export default function TemplatesSection({ onApplyTemplate }: TemplatesSectionProps) {
  const templates: TemplateItem[] = [
    {
      id: "executive_briefing",
      name: "Senior Executive Briefing",
      badge: "High Priority",
      description: "Tailored for leadership teams needing concise executive summaries, key risk factors, and strategic slide decks.",
      settings: {
        audience: "Senior Officials",
        tone: "Formal",
        language: "English",
        detailLevel: "Brief",
        objective: "Brief",
      },
      outputTypes: ["exec_summary", "presentation"],
    },
    {
      id: "technical_deep_dive",
      name: "Technical Infrastructure Deep-Dive",
      badge: "Detailed Protocol",
      description: "High-granularity technical analysis with detailed findings, actionable advisories, and infographic specifications.",
      settings: {
        audience: "Technical Personnel",
        tone: "Technical",
        language: "English",
        detailLevel: "Detailed",
        objective: "Explain",
      },
      outputTypes: ["advisory", "infographic"],
    },
    {
      id: "field_tactical_directive",
      name: "Field Tactical Operational Alert",
      badge: "Field Operations",
      description: "Simplified, action-oriented directives and social media thread posts for operational teams and field personnel.",
      settings: {
        audience: "Field Personnel",
        tone: "Simplified",
        language: "English",
        detailLevel: "Brief",
        objective: "Advise",
      },
      outputTypes: ["advisory", "social_media"],
    },
    {
      id: "multilingual_public_release",
      name: "Multilingual Public Briefing",
      badge: "Hindi & Marathi",
      description: "Accessible public communication in Hindi or Marathi with visual infographic data highlights and citizen engagement.",
      settings: {
        audience: "General Audience",
        tone: "Neutral",
        language: "Hindi",
        detailLevel: "Medium",
        objective: "Inform",
      },
      outputTypes: ["exec_summary", "social_media", "infographic"],
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800/40">
            Preset Transformation Templates
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1.5 flex items-center gap-2">
            <span>🧩</span>
            <span>Transformation Templates Gallery</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select a pre-configured template to automatically apply audience, tone, language, and output format presets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="text-purple-600 dark:text-purple-400 font-mono text-xs">▸</span>
                  {tpl.name}
                </span>
                <span className="text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 px-2 py-0.5 rounded-full">
                  {tpl.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {tpl.description}
              </p>

              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px]">
                <span className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg">
                  Audience: <strong>{tpl.settings.audience}</strong>
                </span>
                <span className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg">
                  Tone: <strong>{tpl.settings.tone}</strong>
                </span>
                <span className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg">
                  Lang: <strong>{tpl.settings.language}</strong>
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Outputs: {tpl.outputTypes.join(", ").replace(/_/g, " ")}
              </span>
              <button
                type="button"
                onClick={() => onApplyTemplate(tpl.settings, tpl.outputTypes)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-1.5"
              >
                <span>Apply Template</span>
                <span>⚡</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
