"use client";

import { useState } from "react";
import { ClaimProvenance, HumanReviewStatus } from "@/lib/types";

interface ClaimEvidenceCardProps {
  claim: ClaimProvenance;
}

export default function ClaimEvidenceCard({ claim }: ClaimEvidenceCardProps) {
  const [reviewStatus, setReviewStatus] = useState<HumanReviewStatus>("none");
  const [showEvidence, setShowEvidence] = useState<boolean>(true);
  const [notice, setNotice] = useState<string | null>(null);

  const handleReviewAction = (status: HumanReviewStatus) => {
    setReviewStatus(status);
    if (status === "needs_correction") {
      setNotice("Correction workflow coming in next step.");
    } else {
      setNotice(null);
    }
  };

  const getStatusBadge = () => {
    switch (claim.support_status) {
      case "supported":
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
            <span>✓</span>
            <span>Supported</span>
          </span>
        );
      case "partially_supported":
        return (
          <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/50 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
            <span>⚠️</span>
            <span>Partially Supported</span>
          </span>
        );
      case "unsupported":
        return (
          <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/50 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
            <span>✕</span>
            <span>Unsupported / Conflict</span>
          </span>
        );
      case "recommendation":
        return (
          <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/50 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
            <span>💡</span>
            <span>Recommendation</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm hover:border-slate-700 transition">
      {/* Top Meta Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge()}
          <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {claim.output_type.replace("_", " ")}
          </span>
          {claim.slide_number && (
            <span className="text-[10px] font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
              Slide {claim.slide_number}
            </span>
          )}
          <span className="text-[10px] text-slate-500 font-mono">ID: {claim.claim_id}</span>
        </div>

        {/* Source Page Badges */}
        {claim.source_pages && claim.source_pages.length > 0 ? (
          <div className="flex items-center gap-1.5">
            {claim.source_pages.map((pg, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 font-bold text-[10px] border border-blue-800/40">
                Source: Page {pg}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[10px] text-slate-500 italic">No source ref</span>
        )}
      </div>

      {/* Claim Body */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-slate-200 leading-relaxed font-mono">
          "{claim.claim_text}"
        </div>
        <p className="text-[11px] text-slate-400 italic leading-normal">
          {claim.reason}
        </p>
      </div>

      {/* Supporting Evidence Text Excerpt */}
      {claim.supporting_text && claim.supporting_text.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowEvidence(!showEvidence)}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>{showEvidence ? "Hide Supporting Evidence ▲" : "Show Supporting Evidence ▼"}</span>
          </button>
          {showEvidence && (
            <div className="mt-2 space-y-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-300">
              {claim.supporting_text.map((text, idx) => (
                <div key={idx} className="leading-relaxed border-l-2 border-blue-500 pl-2">
                  "{text}"
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Human Review Action Controls */}
      <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Review:</span>
          {reviewStatus !== "none" && (
            <span className="capitalize font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {reviewStatus.replace("_", " ")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleReviewAction("reviewed")}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              reviewStatus === "reviewed"
                ? "bg-slate-700 text-white border border-slate-600 shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            Reviewed
          </button>
          <button
            type="button"
            onClick={() => handleReviewAction("accepted")}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              reviewStatus === "accepted"
                ? "bg-emerald-700 text-white border border-emerald-600 shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-emerald-300 border border-slate-800"
            }`}
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => handleReviewAction("needs_correction")}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              reviewStatus === "needs_correction"
                ? "bg-amber-700 text-white border border-amber-600 shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-amber-300 border border-slate-800"
            }`}
          >
            Flag Correction
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-2 rounded bg-amber-950/40 border border-amber-800/50 text-amber-300 text-[11px] font-medium">
          ℹ️ {notice}
        </div>
      )}
    </div>
  );
}
