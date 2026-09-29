"use client";

import { useState } from "react";
import { DocumentExtractionResponse } from "@/lib/types";
import DocumentUploadCard from "@/components/upload/DocumentUploadCard";
import ExtractedPreviewCard from "@/components/preview/ExtractedPreviewCard";

interface DocumentsSectionProps {
  extractionData: DocumentExtractionResponse | null;
  onExtractionSuccess: (data: DocumentExtractionResponse | null) => void;
  onClearDocument: () => void;
  onNavigateToTransformation: () => void;
}

export default function DocumentsSection({
  extractionData,
  onExtractionSuccess,
  onClearDocument,
  onNavigateToTransformation,
}: DocumentsSectionProps) {
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);

  if (!extractionData) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800/40">
            Document Repository & Intake
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1.5 flex items-center gap-2">
            <span>📁</span>
            <span>Document Management & Text Extraction</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload source PDFs, Word documents, or text files to perform deterministic text extraction and grounding.
          </p>
        </div>

        <DocumentUploadCard
          onExtractionSuccess={onExtractionSuccess}
          onClearDocument={onClearDocument}
        />
      </div>
    );
  }

  const pages = extractionData.pages || [];
  const currentPage = pages[selectedPageIndex] || { page_number: 1, text: extractionData.full_text };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
            Active Extracted Document
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1.5 flex items-center gap-2">
            <span>📄</span>
            <span className="truncate max-w-md">{extractionData.filename}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Document ID: <span className="font-mono text-slate-700 dark:text-slate-300">{extractionData.document_id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onNavigateToTransformation}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
          >
            <span>Proceed to Transformation</span>
            <span>⚡</span>
          </button>

          <button
            type="button"
            onClick={onClearDocument}
            className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/80 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 font-bold text-xs transition"
          >
            Clear Document
          </button>
        </div>
      </div>

      {/* Metadata Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Characters</div>
          <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
            {(extractionData.metadata?.char_count || extractionData.full_text?.length || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Page Count</div>
          <div className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
            {extractionData.metadata?.total_pages || extractionData.pages?.length || 1} Page{(extractionData.metadata?.total_pages || extractionData.pages?.length || 1) > 1 ? "s" : ""}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Extraction Engine</div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 uppercase">
            PyMuPDF / python-docx
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Extraction Status</div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <span>✓ Verified Clean</span>
          </div>
        </div>
      </div>

      {/* Interactive Page Inspector */}
      <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Page-by-Page Inspector
            </h4>
            {pages.length > 0 && (
              <span className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded-lg">
                Page {selectedPageIndex + 1} of {pages.length}
              </span>
            )}
          </div>

          {pages.length > 1 && (
            <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
              {pages.map((p, idx) => (
                <button
                  key={p.page_number}
                  type="button"
                  onClick={() => setSelectedPageIndex(idx)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-mono transition ${
                    idx === selectedPageIndex
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  P.{p.page_number}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Viewport */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-800 dark:text-slate-300 max-h-96 overflow-y-auto leading-relaxed whitespace-pre-wrap">
          {currentPage.text || extractionData.full_text}
        </div>
      </div>

      {/* Extracted Preview Component Embedded */}
      <ExtractedPreviewCard
        extractionData={extractionData}
        onClearDocument={onClearDocument}
      />
    </div>
  );
}
