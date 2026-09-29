"use client";

import { useState } from "react";
import { PresentationOutput } from "@/lib/types";
import { exportDocumentOutput } from "@/lib/api";

interface PresentationOutputViewProps {
  documentId: string;
  data: PresentationOutput;
}

export default function PresentationOutputView({
  documentId,
  data,
}: PresentationOutputViewProps) {
  const [activeSlideNum, setActiveSlideNum] = useState<number>(1);
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleDownloadPptx = async () => {
    setIsExporting(true);
    setExportError(null);
    const res = await exportDocumentOutput(documentId, "presentation", "pptx");
    if (!res.success) {
      setExportError(res.error || "Failed to download Presentation PPTX.");
    }
    setIsExporting(false);
  };

  const slides = data.slides || [];
  const currentSlide = slides.find((s) => s.slide_number === activeSlideNum) || slides[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-950 text-purple-400 px-2 py-0.5 rounded border border-purple-800/40">
            Presentation Slide Deck Model ({slides.length} Slides)
          </span>
          <h3 className="text-xl font-bold text-slate-100 mt-1">{data.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{data.subtitle}</p>
        </div>

        <button
          type="button"
          disabled={isExporting}
          onClick={handleDownloadPptx}
          className="self-start sm:self-auto px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white shadow-md font-bold text-xs transition flex items-center gap-2 disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Preparing PPTX...
            </>
          ) : (
            <>
              <span>Download PPTX</span>
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

      {/* Slide Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <span className="text-xs font-semibold text-slate-400 pr-2">Slides:</span>
        {slides.map((slide) => (
          <button
            key={slide.slide_number}
            type="button"
            onClick={() => setActiveSlideNum(slide.slide_number)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
              activeSlideNum === slide.slide_number
                ? "bg-purple-600 text-white shadow-md"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Slide {slide.slide_number}
          </button>
        ))}
      </div>

      {/* Slide Preview Canvas */}
      {currentSlide && (
        <div className="space-y-4">
          <div className="bg-slate-950 border-2 border-purple-900/40 rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl min-h-[300px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-lg sm:text-xl font-extrabold text-purple-300">
                {currentSlide.title}
              </h4>
              <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Slide {currentSlide.slide_number} of {slides.length}
              </span>
            </div>

            {/* Slide Bullet Points */}
            <div className="space-y-3">
              {currentSlide.key_points && currentSlide.key_points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="text-purple-400 font-bold text-base mt-0.5">•</span>
                  <span className="leading-relaxed">{pt}</span>
                </div>
              ))}
            </div>

            {/* Slide Source Reference Badges */}
            {currentSlide.source_references && currentSlide.source_references.length > 0 && (
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
                {currentSlide.source_references.map((ref, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 font-bold text-[10px] border border-purple-800/50">
                    Source: Page {ref.page_number}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Speaker Notes Drawer */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎙️</span>
                <span>Speaker Talking Notes</span>
              </span>
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                {showNotes ? "Hide Notes ▲" : "Show Notes ▼"}
              </button>
            </div>
            {showNotes && (
              <p className="text-xs text-slate-300 italic leading-relaxed pt-1 border-t border-slate-800/60 font-mono">
                "{currentSlide.speaker_notes || "No speaker notes provided for this slide."}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
