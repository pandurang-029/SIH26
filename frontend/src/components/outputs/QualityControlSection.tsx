"use client";

import { useState } from "react";
import { QualityControlReport, SupportStatus } from "@/lib/types";
import ClaimEvidenceCard from "./ClaimEvidenceCard";

interface QualityControlSectionProps {
  report: QualityControlReport;
}

export default function QualityControlSection({ report }: QualityControlSectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const claims = report.claims || [];
  const filteredClaims = claims.filter((claim) => {
    if (activeFilter === "all") return true;
    return claim.support_status === activeFilter;
  });

  const getOverallStatusBanner = () => {
    switch (report.overall_status) {
      case "passed":
        return (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">✓</span>
              <div>
                <h4 className="text-sm font-bold text-emerald-300">All Factual Claims Supported</h4>
                <p className="text-xs text-emerald-400/90 mt-0.5">
                  All extracted factual statements have verified source grounding in the Common Content Representation.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-emerald-900/60 text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-700/50">
              PASSED
            </span>
          </div>
        );
      case "review_required":
        return (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="text-sm font-bold text-amber-300">Human Review Required</h4>
                <p className="text-xs text-amber-400/90 mt-0.5">
                  One or more claims have partial evidence grounding. Review flagged claims prior to final distribution.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-amber-900/60 text-amber-200 text-xs font-bold uppercase tracking-wider border border-amber-700/50">
              REVIEW REQUIRED
            </span>
          </div>
        );
      case "failed":
        return (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">✕</span>
              <div>
                <h4 className="text-sm font-bold text-red-300">Unsupported / Conflicting Claims Detected</h4>
                <p className="text-xs text-red-400/90 mt-0.5">
                  Factual statements with value conflicts or missing source grounding were identified. Inspect evidence below.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-red-900/60 text-red-200 text-xs font-bold uppercase tracking-wider border border-red-700/50">
              FAILED
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-800/40">
            Step 7: Provenance & Quality Verification
          </span>
          <h3 className="text-xl font-bold text-slate-100 mt-1">AI Quality Control & Provenance Report</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic claim verification against the CCR single source of truth. Zero LLM API cost.
          </p>
        </div>
      </div>

      {/* Overall Status Banner */}
      {getOverallStatusBanner()}

      {/* Quality Score Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Total Claims</span>
          <div className="text-xl font-extrabold text-slate-100 font-mono">{report.total_claims}</div>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-3 space-y-1">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">Supported</span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">{report.supported_claims}</div>
        </div>
        <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-3 space-y-1">
          <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold block">Partially Supported</span>
          <div className="text-xl font-extrabold text-amber-400 font-mono">{report.partially_supported_claims}</div>
        </div>
        <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-3 space-y-1">
          <span className="text-[10px] text-red-400 uppercase tracking-wider font-bold block">Unsupported</span>
          <div className="text-xl font-extrabold text-red-400 font-mono">{report.unsupported_claims}</div>
        </div>
        <div className="bg-blue-950/20 border border-blue-900/40 rounded-lg p-3 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-blue-400 uppercase tracking-wider font-bold block">Recommendations</span>
          <div className="text-xl font-extrabold text-blue-400 font-mono">{report.recommendations}</div>
        </div>
      </div>

      {/* Claim Filter Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <span className="text-xs font-semibold text-slate-400 pr-2">Filter Claims:</span>
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
            activeFilter === "all"
              ? "bg-slate-700 text-white shadow-md"
              : "bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          All ({claims.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("supported")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
            activeFilter === "supported"
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          Supported ({report.supported_claims})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("partially_supported")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
            activeFilter === "partially_supported"
              ? "bg-amber-600 text-white shadow-md"
              : "bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          Partially Supported ({report.partially_supported_claims})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("unsupported")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
            activeFilter === "unsupported"
              ? "bg-red-600 text-white shadow-md"
              : "bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          Unsupported ({report.unsupported_claims})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("recommendation")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
            activeFilter === "recommendation"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          Recommendations ({report.recommendations})
        </button>
      </div>

      {/* Claim Cards List */}
      {filteredClaims.length > 0 ? (
        <div className="space-y-3">
          {filteredClaims.map((claim) => (
            <ClaimEvidenceCard key={claim.claim_id} claim={claim} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
          No claims match the selected filter criteria.
        </div>
      )}
    </div>
  );
}
