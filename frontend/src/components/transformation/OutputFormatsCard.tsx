"use client";

import { OutputFormatOption } from "@/lib/types";

interface OutputFormatsCardProps {
  selectedOutputs: string[];
  onToggleOutput: (outputId: string) => void;
}

export default function OutputFormatsCard({
  selectedOutputs,
  onToggleOutput,
}: OutputFormatsCardProps) {
  const formats: OutputFormatOption[] = [
    {
      id: "exec_summary",
      title: "Executive Summary",
      description: "Concise high-level overview of key facts, findings and critical insights.",
      isSupported: true,
    },
    {
      id: "advisory",
      title: "Advisory",
      description: "Structured actionable threat & guidance communication for decision makers.",
      isSupported: true,
    },
    {
      id: "presentation",
      title: "Presentation",
      description: "Automatically structured multi-slide deck synthesized from source content.",
      isSupported: true,
    },
    {
      id: "infographic",
      title: "Infographic",
      description: "Visual structured specification of key themes, metrics and statistics.",
      isSupported: true,
    },
    {
      id: "social_media",
      title: "Social Media",
      description: "Audience-tailored post series and thread content for digital platforms.",
      isSupported: true,
    },
    {
      id: "video_script",
      title: "Video Script",
      description: "Structured narration script for video briefings and digital broadcasts.",
      isSupported: false,
      badgeText: "Coming Soon",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🎯</span>
            <span>Target Output Formats</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select one or more output types to generate from the analyzed content.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          Step 3 of 3
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formats.map((item) => {
          const isSelected = selectedOutputs.includes(item.id);

          if (!item.isSupported) {
            return (
              <div
                key={item.id}
                className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 opacity-50 cursor-not-allowed relative flex flex-col justify-between"
                aria-disabled="true"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-slate-500 dark:text-slate-400">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                      {item.badgeText || "Coming Soon"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              onClick={() => onToggleOutput(item.id)}
              tabIndex={0}
              role="checkbox"
              aria-checked={isSelected}
              aria-label={`Select ${item.title}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleOutput(item.id);
                }
              }}
              className={`rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between border ${
                isSelected
                  ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-md shadow-blue-500/10"
                  : "bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-bold text-sm ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-100"}`}>
                    {item.title}
                  </h4>
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold transition border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-transparent"
                    }`}
                  >
                    ✓
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider text-[10px]">
                  AI Supported
                </span>
                <span className={isSelected ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400 dark:text-slate-500"}>
                  {isSelected ? "Selected" : "Click to select"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
