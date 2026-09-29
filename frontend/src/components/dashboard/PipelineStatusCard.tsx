"use client";

interface PipelineStatusCardProps {
  hasDocument: boolean;
  hasExtractedText: boolean;
  hasAnalysisData: boolean;
  hasOutputs: boolean;
  hasQualityCheck: boolean;
  isReadyForExport: boolean;
  isMockMode?: boolean;
}

export default function PipelineStatusCard({
  hasDocument,
  hasExtractedText,
  hasAnalysisData,
  hasOutputs,
  hasQualityCheck,
  isReadyForExport,
  isMockMode = false,
}: PipelineStatusCardProps) {
  const steps = [
    { label: "Document Uploaded", active: hasDocument },
    { label: "Text Extracted", active: hasExtractedText },
    { label: "AI Analysis Complete", active: hasAnalysisData },
    { label: "CCR Created", active: hasAnalysisData },
    { label: "Outputs Generated", active: hasOutputs },
    { label: "Quality Checked", active: hasQualityCheck },
    { label: "Ready for Export", active: isReadyForExport },
  ];

  const completedCount = steps.filter((s) => s.active).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3.5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📍</span>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Transformation Pipeline Progress
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
            {completedCount}/{steps.length} Steps
          </span>
        </div>

        {isMockMode && (
          <span className="self-start sm:self-auto text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span>⚠️</span>
            <span>Demo Mode</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-between gap-1.5 transition ${
              step.active
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 shadow-sm"
                : "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-500"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step.active
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              {step.active ? "✓" : idx + 1}
            </div>
            <span className="text-[11px] font-medium leading-tight line-clamp-2">
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
