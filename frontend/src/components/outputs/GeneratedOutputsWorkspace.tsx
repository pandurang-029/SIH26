"use client";

import { useState, useEffect } from "react";
import { GeneratedOutputsResponse, QualityControlReport } from "@/lib/types";
import { runQualityCheck } from "@/lib/api";
import { saveHistoryRecord } from "@/lib/history";
import ExecutiveSummaryOutputView from "./ExecutiveSummaryOutputView";
import AdvisoryOutputView from "./AdvisoryOutputView";
import PresentationOutputView from "./PresentationOutputView";
import SocialMediaOutputView from "./SocialMediaOutputView";
import InfographicOutputView from "./InfographicOutputView";
import QualityControlSection from "./QualityControlSection";

interface GeneratedOutputsWorkspaceProps {
  outputsData: GeneratedOutputsResponse;
}

export default function GeneratedOutputsWorkspace({
  outputsData,
}: GeneratedOutputsWorkspaceProps) {
  const { executive_summary, advisory, presentation, social_media, infographic, errors } = outputsData;

  const availableOutputs = [
    { id: "executive_summary", label: "Executive Summary", hasData: !!executive_summary },
    { id: "advisory", label: "Advisory", hasData: !!advisory },
    { id: "presentation", label: "Presentation Slide Deck", hasData: !!presentation },
    { id: "social_media", label: "Social Media", hasData: !!social_media },
    { id: "infographic", label: "Infographic", hasData: !!infographic },
  ].filter((item) => item.hasData);

  const initialTab = availableOutputs.find((item) => item.hasData)?.id || "executive_summary";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [qualityReport, setQualityReport] = useState<QualityControlReport | null>(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState<boolean>(false);
  const [qualityError, setQualityError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchQuality = async () => {
      const activeTypes = availableOutputs.map((item) => item.id);
      if (activeTypes.length === 0 || !outputsData.document_id) return;

      setIsCheckingQuality(true);
      setQualityError(null);

      const res = await runQualityCheck(outputsData.document_id, activeTypes);
      if (!isMounted) return;

      if (res.success && res.data) {
        setQualityReport(res.data);
        try {
          const score =
            res.data.total_claims > 0
              ? Math.round((res.data.supported_claims / res.data.total_claims) * 100)
              : 100;
          const statusMap: Record<string, "Verified" | "Reviewed" | "Flagged"> = {
            passed: "Verified",
            review_required: "Reviewed",
            failed: "Flagged",
          };
          saveHistoryRecord({
            id: outputsData.document_id,
            qualityScore: score,
            unsupportedClaims: res.data.unsupported_claims,
            status: statusMap[res.data.overall_status] || "Reviewed",
          });
        } catch {
          // Ignore in environments where storage is restricted
        }
      } else {
        setQualityError(res.error || "Failed to complete quality check.");
      }
      setIsCheckingQuality(false);
    };

    fetchQuality();
    return () => {
      isMounted = false;
    };
  }, [outputsData.document_id]);

  return (
    <div id="outputs-section" className="space-y-6">
      {/* Multi-Output Tab Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm transition-colors">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-2">
            Generated Outputs:
          </span>
          {executive_summary && (
            <button
              type="button"
              onClick={() => setActiveTab("executive_summary")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "executive_summary"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              📋 Executive Summary
            </button>
          )}
          {advisory && (
            <button
              type="button"
              onClick={() => setActiveTab("advisory")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "advisory"
                  ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              📢 Advisory
            </button>
          )}
          {presentation && (
            <button
              type="button"
              onClick={() => setActiveTab("presentation")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "presentation"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              📊 Presentation Deck
            </button>
          )}
          {social_media && (
            <button
              type="button"
              onClick={() => setActiveTab("social_media")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "social_media"
                  ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              📱 Social Media
            </button>
          )}
          {infographic && (
            <button
              type="button"
              onClick={() => setActiveTab("infographic")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "infographic"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              🖼️ Infographic
            </button>
          )}
        </div>

        {/* Quality Check Tab Toggle */}
        <button
          type="button"
          onClick={() => setActiveTab("quality_control")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "quality_control"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md font-extrabold"
              : "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
          }`}
        >
          <span>🔍 Quality & Provenance</span>
          {qualityReport && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                qualityReport.overall_status === "passed"
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                  : qualityReport.overall_status === "review_required"
                  ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                  : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700"
              }`}
            >
              {qualityReport.overall_status.replace("_", " ")}
            </span>
          )}
        </button>
      </div>

      {/* Partial Errors Warning Box */}
      {errors && Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs space-y-1">
          <div className="font-bold text-amber-900 dark:text-amber-300">Partial Output Generation Warning</div>
          {Object.entries(errors).map(([key, msg]) => (
            <div key={key}>
              <strong className="capitalize">{key.replace("_", " ")}:</strong> {msg}
            </div>
          ))}
        </div>
      )}

      {/* Export Safety Warnings */}
      {qualityReport && qualityReport.overall_status === "failed" && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 text-red-800 dark:text-red-200 text-xs flex items-start gap-3 shadow-md">
          <span className="text-lg">⚠️</span>
          <div>
            <div className="font-bold text-red-900 dark:text-red-300">Export Warning: Unsupported Claims Identified</div>
            <div className="text-red-800/90 dark:text-red-300/90 leading-relaxed mt-0.5">
              One or more factual claims in this generated artifact contain conflicting metrics or lack source grounding in the CCR. Please review flagged items in the <strong>Quality & Provenance</strong> tab before exporting.
            </div>
          </div>
        </div>
      )}

      {qualityReport && qualityReport.overall_status === "review_required" && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-3 shadow-sm">
          <span className="text-lg">ℹ️</span>
          <div>
            <div className="font-bold text-amber-900 dark:text-amber-300">Export Advisory: Partial Source Evidence</div>
            <div className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed mt-0.5">
              Some generated statements have partial evidence grounding. Downloads remain enabled; human verification is recommended.
            </div>
          </div>
        </div>
      )}

      {/* Selected Output View */}
      {activeTab === "executive_summary" && executive_summary && (
        <ExecutiveSummaryOutputView documentId={outputsData.document_id} data={executive_summary} />
      )}

      {activeTab === "advisory" && advisory && (
        <AdvisoryOutputView documentId={outputsData.document_id} data={advisory} />
      )}

      {activeTab === "presentation" && presentation && (
        <PresentationOutputView documentId={outputsData.document_id} data={presentation} />
      )}

      {activeTab === "social_media" && social_media && (
        <SocialMediaOutputView documentId={outputsData.document_id} data={social_media} />
      )}

      {activeTab === "infographic" && infographic && (
        <InfographicOutputView documentId={outputsData.document_id} data={infographic} />
      )}

      {activeTab === "quality_control" && (
        <>
          {isCheckingQuality ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3 shadow-sm">
              <div className="inline-block animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <div>Running deterministic AI Quality Control & Provenance Check against CCR...</div>
            </div>
          ) : qualityReport ? (
            <QualityControlSection report={qualityReport} />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-red-500 shadow-sm">
              ⚠️ {qualityError || "Unable to load Quality Control Report."}
            </div>
          )}
        </>
      )}
    </div>
  );
}
