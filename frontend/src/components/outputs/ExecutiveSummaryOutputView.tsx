"use client";

import { useState } from "react";
import { ExecutiveSummaryOutput } from "@/lib/types";
import { exportDocumentOutput } from "@/lib/api";

interface ExecutiveSummaryOutputViewProps {
  documentId: string;
  data: ExecutiveSummaryOutput;
}

export default function ExecutiveSummaryOutputView({
  documentId,
  data,
}: ExecutiveSummaryOutputViewProps) {
  const [showSources, setShowSources] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setExportError(null);
    const res = await exportDocumentOutput(documentId, "executive_summary", "pdf");
    if (!res.success) {
      setExportError(res.error || "Failed to download Executive Summary PDF.");
    }
    setIsExporting(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-800/40">
            Executive Summary Artifact
          </span>
          <h3 className="text-xl font-bold text-slate-100 mt-1">{data.title}</h3>
        </div>

        <button
          type="button"
          disabled={isExporting}
          onClick={handleDownloadPdf}
          className="self-start sm:self-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-md font-bold text-xs transition flex items-center gap-2 disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Preparing PDF...
            </>
          ) : (
            <>
              <span>Download PDF</span>
              <span>📥</span>
            </>
          )}
        </button>
      </div>

      {exportError && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs">
          ⚠️ {exportError}
        </div>
      )}

      {/* Briefing Paragraph */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Executive Summary</h4>
        <p className="text-sm text-slate-200 leading-relaxed font-normal">{data.executive_summary}</p>
      </div>

      {/* Key Points */}
      {data.key_points && data.key_points.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Decision Points</h4>
          <ul className="space-y-2">
            {data.key_points.map((pt, idx) => (
              <li key={idx} className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-200 flex items-start gap-2.5">
                <span className="text-blue-400 font-bold">•</span>
                <span className="leading-relaxed">{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Statistics */}
      {data.important_statistics && data.important_statistics.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Numerical Metrics</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.important_statistics.map((st, idx) => (
              <div key={idx} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 space-y-1">
                <span className="text-[11px] text-slate-400 block truncate">{st.metric}</span>
                <div className="text-lg font-bold text-blue-400 font-mono">{st.value}</div>
                {st.source_page && (
                  <span className="text-[10px] text-slate-400 block">Source: Page {st.source_page}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks & Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.risks && data.risks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">Identified Risks</h4>
            <div className="space-y-2">
              {data.risks.map((rk, idx) => (
                <div key={idx} className="bg-red-950/20 border border-red-900/40 rounded-lg p-3 text-xs text-slate-200 space-y-1">
                  <div className="font-semibold text-red-300">{rk.risk}</div>
                  {rk.source_page && <span className="text-[10px] text-red-400 block">Source: Page {rk.source_page}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.recommendations && data.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Strategic Recommendations</h4>
            <div className="space-y-2">
              {data.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-3 text-xs text-slate-200 space-y-1">
                  <div className="font-semibold text-emerald-300">{rec.recommendation}</div>
                  {rec.source_page && <span className="text-[10px] text-emerald-400 block">Source: Page {rec.source_page}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Source References */}
      {data.source_references && data.source_references.length > 0 && (
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={() => setShowSources(!showSources)}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5"
          >
            <span>{showSources ? "Hide Source Provenance ▲" : "View Source Provenance (Page Citations) ▼"}</span>
          </button>

          {showSources && (
            <div className="space-y-2 pt-1">
              {data.source_references.map((ref, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-bold text-[10px] border border-blue-800/40">
                    Source: Page {ref.page_number}
                  </span>
                  <div className="font-mono text-slate-300 text-[11px] pt-1">"{ref.supporting_text}"</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
