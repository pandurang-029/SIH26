"use client";

import { useState } from "react";
import { InfographicOutput } from "@/lib/types";

interface InfographicOutputViewProps {
  documentId: string;
  data: InfographicOutput;
}

export default function InfographicOutputView({
  documentId,
  data,
}: InfographicOutputViewProps) {
  const [showSources, setShowSources] = useState(false);

  const getVisualIcon = (visualType: string) => {
    const vt = visualType.toLowerCase();
    if (vt.includes("timeline")) return "📈";
    if (vt.includes("bar_chart") || vt.includes("chart")) return "📊";
    if (vt.includes("number") || vt.includes("highlight")) return "🔢";
    if (vt.includes("process") || vt.includes("flow")) return "🔄";
    if (vt.includes("comparison")) return "⚖️";
    if (vt.includes("map")) return "🗺️";
    return "🖼️";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40">
            Infographic Content Artifact
          </span>
          <h3 className="text-xl font-bold text-slate-100 mt-1">{data.title}</h3>
          {data.subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{data.subtitle}</p>
          )}
        </div>

        {/* Disabled Export Button */}
        <div className="self-start sm:self-auto flex items-center gap-2">
          <button
            type="button"
            disabled
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/60 font-semibold text-xs transition cursor-not-allowed flex items-center gap-2"
            title="Export coming later"
          >
            <span>Export coming later</span>
            <span className="text-slate-500">🔒</span>
          </button>
        </div>
      </div>

      {/* Highlighted Key Statistics */}
      {data.key_statistics && data.key_statistics.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Key Statistics & Data Points
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.key_statistics.map((stat, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2"
              >
                <div>
                  <span className="text-2xl font-black text-emerald-400 tracking-tight">
                    {stat.value}
                  </span>
                  <div className="text-xs font-semibold text-slate-200 mt-1">{stat.metric}</div>
                </div>
                {stat.context && (
                  <p className="text-[11px] text-slate-400 line-clamp-2">{stat.context}</p>
                )}
                {stat.source_page && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    Page {stat.source_page}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Infographic Sections */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Visual Content Sections ({data.sections?.length || 0})
        </h4>

        {data.sections && data.sections.length > 0 ? (
          <div className="space-y-3">
            {data.sections.map((sec, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                  <h5 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-xs">0{idx + 1}.</span>
                    {sec.heading}
                  </h5>

                  <span className="self-start sm:self-auto text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <span>{getVisualIcon(sec.suggested_visual)}</span>
                    <span className="capitalize">Visual: {sec.suggested_visual.replace("_", " ")}</span>
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {sec.content}
                </p>

                {sec.source_references && sec.source_references.length > 0 && (
                  <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Grounding Citation:</span>
                    <span>
                      Page {sec.source_references.map((r) => r.page_number).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No infographic sections specified.</p>
        )}
      </div>

      {/* Key Takeaways */}
      {data.key_takeaways && data.key_takeaways.length > 0 && (
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Infographic Key Takeaways
          </h4>
          <ul className="space-y-1.5">
            {data.key_takeaways.map((kt, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{kt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grounding Excerpts */}
      {data.source_references && data.source_references.length > 0 && (
        <div className="border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => setShowSources(!showSources)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5"
          >
            <span>{showSources ? "Hide Grounding Citations" : "Show Grounding Citations"}</span>
            <span className="text-slate-500">({data.source_references.length})</span>
            <span>{showSources ? "▲" : "▼"}</span>
          </button>

          {showSources && (
            <div className="mt-3 space-y-2">
              {data.source_references.map((ref, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 space-y-1"
                >
                  <div className="font-semibold text-emerald-400">
                    Source Page {ref.page_number}
                  </div>
                  <p className="italic text-slate-400">&ldquo;{ref.supporting_text}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
