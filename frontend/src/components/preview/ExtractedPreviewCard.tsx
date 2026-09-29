"use client";

import { useState } from "react";
import { DocumentExtractionResponse } from "@/lib/types";

interface ExtractedPreviewCardProps {
  extractionData: DocumentExtractionResponse;
  onClearDocument: () => void;
}

export default function ExtractedPreviewCard({
  extractionData,
  onClearDocument,
}: ExtractedPreviewCardProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activePageTab, setActivePageTab] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const { filename, file_type, pages, metadata, full_text } = extractionData;

  const handleCopy = () => {
    navigator.clipboard.writeText(full_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activePageObj = pages.find((p) => p.page_number === activePageTab) || pages[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6 transition-colors">
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              Extraction Complete
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ID: {extractionData.document_id.substring(0, 8)}...
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1.5 flex items-center gap-2">
            <span>📄</span>
            <span>Extracted Content: {filename}</span>
          </h3>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
          >
            {copied ? "✓ Copied!" : "📋 Copy Text"}
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-semibold text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 transition"
          >
            {isExpanded ? "Collapse ▲" : "View Content ▼"}
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Format</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">{file_type || "PDF"}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Pages</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{metadata?.total_pages ?? pages.length ?? 1}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Word Count</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{(metadata?.word_count ?? Math.round((full_text?.length || 0) / 6)).toLocaleString()}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Character Count</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{(metadata?.char_count ?? full_text?.length ?? 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Collapsible Content Area */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Page Tabs for Multi-page PDFs */}
          {pages.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 pr-2">Pages:</span>
              {pages.map((p) => (
                <button
                  key={p.page_number}
                  type="button"
                  onClick={() => setActivePageTab(p.page_number)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    activePageTab === p.page_number
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Page {p.page_number}
                </button>
              ))}
            </div>
          )}

          {/* Text Preview Box */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 max-h-96 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {pages.length > 1 && activePageObj ? (
              <div>
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                  --- Page {activePageObj.page_number} of {metadata?.total_pages || pages.length} ---
                </div>
                {activePageObj.text || "(No text content extracted on this page)"}
              </div>
            ) : (
              full_text || "(No text content extracted)"
            )}
          </div>
        </div>
      )}
    </div>
  );
}
